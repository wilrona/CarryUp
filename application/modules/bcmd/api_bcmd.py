__author__ = 'User'

from ...modules import *
from ..bcmd.models_bcmd import Documents, LigneDoc
from ..article.models_item import Articles, Variantes
from ..magasin.models_mag import Magasins

prefix = Blueprint('api_bcmd', __name__)


def make_public(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
            new_task['uri_view'] = url_for('bcmd.view', data_id=data['id'], _external=True)
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
            if len(data['article_id'].variantes) > 1:
                new_task['name'] += ' ('+ new_task['name']+')'

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
        datas = Documents.objects(Q(compte=compte_id) & Q(reference__icontains=q) & Q(type_transaction=0))
    else:
        datas = Documents.objects(Q(compte=compte_id) & Q(type_transaction=0))

    datas = datas.skip(offset).limit(limit)

    order_by = ''
    if order == 'desc':
        order_by += '-'

    if sort is not None:
        order_by += sort
        datas.order_by(order_by)

    count = Documents.objects(Q(compte=compte_id) & Q(type_transaction=0)).count() / limit

    return jsonify({'data' : [make_public(data) for data in datas], 'total_page': count, 'order': order, 'sort': sort })


@prefix.route('/check/achat/', methods=['POST'])
def check():

    article_id = request.json['id']
    prix_achat = request.json['prix_achat']
    quantite = request.json['quantite']
    select = request.json['select']

    info = {}

    if article_id :

        variante = Variantes.objects.get(id=article_id)

        info['name'] = variante.article_id.name
        if len(variante.article_id.variantes) > 1:
            info['name'] += ' ('+ variante.name+')'

        info['id'] = article_id
        info['quantite'] = int(quantite)

        if select:
            info['prix_achat'] = int(variante.article_id.prix_achat)
        else:
            info['prix_achat'] = int(prix_achat)

        info['magasin'] = variante.MagVarianteID()

        info['montant'] = float(info['prix_achat']) * float(info['quantite'])

    return jsonify(info)

@prefix.route('/all/achat/<objectid:compte_id>/', methods=['GET'])
def allArticle(compte_id):

    datas =  []

    magasin_id = request.args.get('magasin')
    magasin = None
    if magasin_id:
        magasin = Magasins.objects.get(id=magasin_id)

    if magasin:
        articles = Articles.objects(Q(compte=compte_id) & Q(type_article__ne=2))
        for article in articles:
            if article.type_article == 0 :
                for variante in article.variantes:
                    if magasin.id in variante.MagVariante():
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

            matiere = {}
            matiere['id'] = str(item.variante_id.id)
            matiere['name'] = item.article_id.name
            if len(item.article_id.variantes) > 1:
                matiere['name'] += ' ('+ item.variante_id.name+')'
            matiere['quantite'] = int(item.quantite)
            matiere['prix_achat'] = int(item.prix_achat)
            matiere['montant'] = int(item.quantite) * int(item.prix_achat)
            matiere['magasin'] = item.variante_id.MagVarianteID()

            data.append(matiere)
            currentSelect.append(str(item.variante_id.id))

    return jsonify({'data': data, 'currentSelect': currentSelect})
