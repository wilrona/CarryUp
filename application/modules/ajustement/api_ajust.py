__author__ = 'User'

from ...modules import *
from ..bcmd.models_bcmd import Documents, LigneDoc
from ..article.models_item import Articles, Variantes
from ..magasin.models_mag import Magasins
from ..compte.models_compte import Comptes

prefix = Blueprint('api_ajust', __name__)


def make_public(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
            new_task['uri_view'] = url_for('ajustement.view', data_id=data['id'], _external=True)
        else:
            new_task[field] = data[field]

        if field == 'etat':
            new_task['etat_name'] = 'Stock recu'
            if new_task['etat'] == 1:
                new_task['etat_name'] = 'Recomptage'
            if new_task['etat'] == 2:
                new_task['etat_name'] = 'Dommage'
            if new_task['etat'] == 3:
                new_task['etat_name'] = 'Vol'
            if new_task['etat'] == 4:
                new_task['etat_name'] = 'Perte'
            if new_task['etat'] == 5:
                new_task['etat_name'] = 'Don'

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
        datas = Documents.objects(Q(compte=compte_id) & Q(reference__icontains=q) & Q(type_transaction=2))
    else:
        datas = Documents.objects(Q(compte=compte_id) & Q(type_transaction=2))

    datas = datas.skip(offset).limit(limit)

    order_by = ''
    if order == 'desc':
        order_by += '-'

    if sort is not None:
        order_by += sort
        datas.order_by(order_by)

    count = Documents.objects(Q(compte=compte_id) & Q(type_transaction=2)).count() / limit

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

        if len(variante.article_id.variantes) > 1:
            info['name'] += ' ('+ variante.name+')'

        info['id'] = article_id

        info['magasin'] = variante.MagVarianteID()

        info['stock'] = variante.stock_magasin(magasin_id)

        info['quantite'] = int(quantite)

    return jsonify(info)

@prefix.route('/all/achat/<objectid:compte_id>/', methods=['GET'])
def allArticle(compte_id):

    datas =  []

    magasin_origine_id = request.args.get('magasin_origine')

    compte = Comptes.objects.get(id=compte_id)

    magasin_origine = None
    if magasin_origine_id:
        magasin_origine = Magasins.objects.get(id=magasin_origine_id)

    if magasin_origine:
        articles = Articles.objects(Q(compte=compte) & Q(type_article=0))
        for article in articles:
            for variante in article.variantes:
                if magasin_origine in variante.MagVariante():
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

            current = Variantes.objects.get(id=item.article_id.id)
            magasin_id = request.args.get('magasin_origine')

            matiere = {}
            matiere['id'] = str(current.id)
            matiere['name'] = current.article_id.name
            if len(current.article_id.variantes) > 1:
                matiere['name'] += ' ('+ current.name+')'
            matiere['quantite'] = int(item.quantite)
            matiere['magasin'] = current.MagVarianteID()
            matiere['stock'] = current.stock_magasin(magasin_id)

            data.append(matiere)
            currentSelect.append(str(current.id))

    return jsonify({'data': data, 'currentSelect': currentSelect})
