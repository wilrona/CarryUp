__author__ = 'User'

from ...modules import *
from ..bcmd.models_bcmd import Documents, LigneDoc
from ..article.models_item import Articles, Variantes
from ..magasin.models_mag import Magasins
from ..compte.models_compte import Comptes

prefix = Blueprint('api_transfert', __name__)


def make_public(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
            new_task['uri_view'] = url_for('transfert.view', data_id=data['id'], _external=True)
        else:
            new_task[field] = data[field]

        if field == 'etat':
            new_task['etat_name'] = 'En attente'
            if new_task['etat'] == 2:
                new_task['etat_name'] = 'Reception partielle'
            if new_task['etat'] == 3:
                new_task['etat_name'] = 'Terminee'
            if new_task['etat'] == 4:
                new_task['etat_name'] = 'Annulation'

    return new_task


def make_public_variante(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
        else:
            new_task[field] = data[field]

        if field == 'name':
            new_task['name_variante'] = data['article_id'].name
            if len(data['article_id'].variantes) > 1 :
                new_task['name_variante'] += ' ('+new_task['name']+')'

    return new_task



@prefix.route('/<objectid:compte_id>', methods=['GET'])
def index(compte_id):

    sort = request.args.get('sort')
    order = request.args.get('order')

    q = str(request.args.get('q'))
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1

    offset = 0
    limit = 10

    if request.args.get('per'):
        limit = int(request.args.get('per'))

    if page > 1:
        offset = ((page - 1) * limit)

    if q is not None:
        datas = Documents.objects(Q(compte=compte_id) & Q(reference__icontains=q) & Q(type_transaction=1))
    else:
        datas = Documents.objects(Q(compte=compte_id) & Q(type_transaction=1))

    datas = datas.skip(offset).limit(limit)

    order_by = ''
    if order == 'desc':
        order_by += '-'

    if sort is not None:
        order_by += sort
        datas.order_by(order_by)

    count = Documents.objects(Q(compte=compte_id) & Q(type_transaction=1)).count() / limit

    return jsonify({'data' : [make_public(data) for data in datas], 'total_page': count, 'order': order, 'sort': sort })


@prefix.route('/check/achat/', methods=['POST'])
def check():

    article_id = request.json['id']
    quantite = request.json['quantite']
    magasin_id = request.args.get('magasin_origine')

    info = {}

    if article_id :

        variante = Variantes.objects.get(id=article_id)

        info['name'] = variante.article_id.name

        if len(variante.article_id.variantes) > 1 :
            info['name'] += ' ('+variante.name+')'

        info['id'] = article_id

        info['magasin'] = variante.MagVarianteID()

        info['stock'] = variante.stock_magasin(magasin_id)

        info['quantite'] = int(quantite)

    return jsonify(info)

@prefix.route('/all/achat/<objectid:compte_id>/', methods=['GET'])
def allArticle(compte_id):

    datas =  []

    magasin_origine_id = request.args.get('magasin_origine')
    magasin_destina_id = request.args.get('magasin_destina')

    compte = Comptes.objects.get(id=compte_id)

    magasin_origine = None
    if magasin_origine_id:
        magasin_origine = Magasins.objects.get(id=magasin_origine_id)

    magasin_destina = None
    if magasin_destina_id:
        magasin_destina = Magasins.objects.get(id=magasin_destina_id)

    if magasin_destina and magasin_origine:
        articles = Articles.objects(Q(compte=compte) & Q(type_article=0))
        for article in articles:
            for variante in article.variantes:
                if magasin_destina in variante.MagVariante() and magasin_origine in variante.MagVariante():
                    datas.append(variante)

    return jsonify({'data': [make_public_variante(data) for data in datas]})


@prefix.route('/ligne/<objectid:compte_id>/<objectid:item_id>', methods=['GET'])
@prefix.route('/ligne/<objectid:compte_id>/', methods=['GET'])
def ligne(compte_id, item_id=None):

    data = []
    currentSelect = []

    if item_id :

        docs = Documents.objects.get(id=item_id)

        for item in docs.ligne_data:

            magasin_id = request.args.get('magasin_origine')

            matiere = {}
            matiere['id'] = str(item.variante_id.id)
            matiere['name'] = item.article_id.name

            if len(item.article_id.variantes) > 1 :
                matiere['name'] += ' ('+item.variante_id.name+')'

            matiere['quantite'] = item.quantite
            matiere['magasin'] = item.variante_id.MagVarianteID()
            matiere['stock'] = item.old_stock

            data.append(matiere)
            currentSelect.append(str(item.variante_id.id))

    return jsonify({'data': data, 'currentSelect': currentSelect})
