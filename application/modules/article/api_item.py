__author__ = 'User'

from ...modules import *
from models_item import Articles, Variantes
from ..categorie.models_cate import Categories
from ..magasin.models_mag import Magasins

prefix = Blueprint('api_item', __name__)


def make_public(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
            new_task['uri_edit'] = url_for('item.edit', data_id=data['id'], _external=True)
        else:
            new_task[field] = data[field]

        if field == 'categorie':
            new_task['categorie_name'] = 'Aucune'
            if new_task['categorie'] :
                categorie = Categories.objects.get(id=new_task['categorie'].id)
                new_task['categorie_name'] = categorie.name

        if data['type_article'] == 2:
            data['name'] += ' (Recette)'

        if field == 'magasins':
            new_task['pos'] = 'Tous les magasins'
            if new_task['magasins']:
                mag = ''
                index = 0
                for maga in new_task['magasins']:
                    mag += maga.name
                    if index > 0:
                        mag += ','
                    index += 1
                new_task['pos'] = mag
    new_task['stock'] = data.stock_active()
    new_task['prix'] = data.allPrice()

    return new_task


def make_public_variante(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
        else:
            new_task[field] = data[field]

        if field == 'name':
            variante_name = new_task['name']
            new_task['name'] = data['article_id'].name
            if len(data['article_id'].variantes) > 1 :
                new_task['name'] += ' ('+variante_name+')'

    new_task['type_article'] = data['article_id'].type_article

    return new_task


def make_public_groupe(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
            new_task['uri_edit'] = url_for('cat.edit', data_id=data['id'], _external=True)
        else:
            new_task[field] = data[field]

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
        datas = Articles.objects(Q(compte=compte_id) & Q(name__icontains=q) & Q(type_article=0))
    else:
        datas = Articles.objects(Q(compte=compte_id) & Q(type_article=0))

    datas = datas.skip(offset).limit(limit)

    order_by = ''
    if order == 'desc':
        order_by += '-'

    if sort is not None:
        order_by += sort
        datas.order_by(order_by)

    count = Articles.objects(Q(compte=compte_id) & Q(type_article=0)).count() / limit

    return jsonify({'data' : [make_public(data) for data in datas], 'total_page': count, 'order': order, 'sort': sort })


@prefix.route('/groupe/<objectid:compte_id>', methods=['GET'])
def groupe(compte_id):

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
        datas = Categories.objects(Q(grpe_article=0) & Q(type_cat=0) & Q(compte=compte_id) & Q(name__icontains=q))
    else:
        datas = Categories.objects(Q(grpe_article=0) & Q(type_cat=0) & Q(compte=compte_id))

    datas = datas.skip(offset).limit(limit)

    order_by = ''
    if order == 'desc':
        order_by += '-'

    if sort is not None:
        order_by += sort
        datas.order_by(order_by)

    count = Categories.objects(Q(type_cat=0) & Q(compte=compte_id)).count() / limit

    return jsonify({'data' : [make_public_groupe(data) for data in datas], 'total_page': count, 'order': order, 'sort': sort })


@prefix.route('/variante/<objectid:compte_id>/<objectid:item_id>', methods=['GET'])
@prefix.route('/variante/<objectid:compte_id>/', methods=['GET'])
def variante(compte_id, item_id=None):

    addVariante = request.args.get('addVariante')
    pdv = request.args.get('pdv')

    data = []

    if addVariante is None:

        if item_id :

            article = Articles.objects.get(id=item_id)

            for vari in article.variantes:

                varianteCurrent = Variantes.objects.get(id=vari.id)

                variante = {}
                variante['id'] = str(varianteCurrent.id)
                variante['name'] = varianteCurrent.name
                variante['prix_vente'] = varianteCurrent.prix_vente
                variante['stock'] = varianteCurrent.stock_active()
                variante['base'] = varianteCurrent.base

                variante['magasin'] = []

                alert = False

                for magasin in varianteCurrent.magasins:

                    maga = Magasins.objects.get(id=magasin.mag_id.id)

                    magas = {}
                    magas['mag_id'] = str(maga.id)
                    magas['mag_name'] = maga.name
                    magas['stock'] = magasin.stock
                    magas['stock_alert'] = magasin.stock_alert
                    if magasin.alert:
                        alert = True
                    magas['alert'] = magasin.alert
                    magas['prix_vente'] = magasin.prix_vente
                    magas['alone_price'] = magasin.alonePrice
                    magas['show'] = magasin.show # afficher dans la liste des magasins du cote de la vue
                    magas['active'] = magasin.active # magasin disponible pour cette variante

                    variante['magasin'].append(magas)

                variante['alert'] = alert

                data.append(variante)


        else:
            variante = {}
            variante['id'] = ''
            variante['name'] = 'Article de base'
            variante['prix_vente'] = 0
            variante['stock'] = 0
            variante['base'] = True
            variante['alert'] = False
            variante['magasin'] = []

            magasinSysteme = Magasins.objects(compte=compte_id)

            for mag in magasinSysteme:
                magas = {}
                magas['mag_id'] = str(mag.id)
                magas['mag_name'] = mag.name
                magas['stock'] = 0
                magas['stock_alert'] = 0
                magas['alert'] = False
                magas['prix_vente'] = 0
                magas['alone_price'] = False
                magas['show'] = True # afficher dans la liste des magasins du cote de la vue
                magas['active'] = True # magasin disponible pour cette variante
                variante['magasin'].append(magas)

            data.append(variante)

    else:
        variante = {}
        variante['id'] = ''
        variante['name'] = ''
        variante['prix_vente'] = 0
        variante['stock'] = 0
        variante['base'] = False
        variante['alert'] = False
        variante['magasin'] = []

        magasinSysteme = Magasins.objects(compte=compte_id)

        for mag in magasinSysteme:
            magas = {}
            magas['mag_id'] = str(mag.id)
            magas['mag_name'] = mag.name
            magas['stock'] = 0
            magas['stock_alert'] = 0
            magas['alert'] = False
            magas['prix_vente'] = 0
            magas['alone_price'] = False
            magas['show'] = True # afficher dans la liste des magasins
            magas['active'] = True # magasin disponible pour cette variante
            variante['magasin'].append(magas)

        data.append(variante)


    return jsonify({'data': data, 'var' : addVariante})


@prefix.route('/all/articles/<objectid:compte_id>/', methods=['GET'])
def allRecette(compte_id):

    current_id = request.args.get('currentID')

    datas = []
    #liste des recettes et articles
    if current_id:
        data =  Articles.objects(Q(id__ne=current_id) & Q(compte=compte_id) & Q(type_article__ne=1) & (Q(type_recette=0) | Q(semi_fini=0)))
    else:
        data =  Articles.objects(Q(compte=compte_id) & Q(type_article__ne=1) & (Q(type_recette=0) | Q(semi_fini=0)))

    for item in data:
        if item.type_article == 0:
            if not len(item.recette_complement):
                for arti in item.variantes:
                    info = make_public_variante(arti)
                    datas.append(info)
        if item.type_article == 2:
            info = make_public(item)
            datas.append(info)

    return jsonify({'data': datas})



@prefix.route('/all/article/<objectid:compte_id>/', methods=['GET'])
def allArticle(compte_id):

    current_id = request.args.get('currentID')

    datas = []

    if current_id:
        data =  Articles.objects(Q(compte=compte_id) & Q(type_article=0) & Q(id__ne=current_id))
    else:
        data =  Articles.objects(Q(compte=compte_id) & Q(type_article=0))

    for item in data:
        for arti in item.variantes:
            info = make_public_variante(arti)
            datas.append(info)

    return jsonify({'data': datas})


@prefix.route('/check/article/', methods=['POST'])
def check():

    article_id = request.json['id']
    quantite = request.json['quantite']

    info = {}

    if article_id :

        try:
            article = Articles.objects.get(id=article_id)
            info['name'] = article.name
            info['id'] = article_id
            info['quantite'] = float(quantite)
            info['type_article'] = article.type_article
        except:
            variante = Variantes.objects.get(id=article_id)

            info['name'] = variante.article_id.name+' ('+variante.name+')'
            info['id'] = article_id
            info['quantite'] = float(quantite)
            info['type_article'] = variante.article_id.type_article

    return jsonify(info)


@prefix.route('/recette/<objectid:compte_id>/<objectid:item_id>', methods=['GET'])
@prefix.route('/recette/<objectid:compte_id>/', methods=['GET'])
def recettes(compte_id, item_id=None):

    data = []
    currentSelect = []

    if item_id :

        article = Articles.objects.get(id=item_id)

        for item in article.recette_complement:

            matiere = {}

            if item.article_id.type_article == 0:

                matiere['id'] = str(item.variante_id.id)
                matiere['name'] = item.article_id.name+' ('+item.variante_id.name+')'
                matiere['quantite'] = float(item.quantite)
                matiere['type_article'] = item.article_id.type_article

            if item.article_id.type_article == 2:

                matiere['id'] = str(item.article_id.id)
                matiere['name'] = item.article_id.name
                matiere['quantite'] = float(item.quantite)
                matiere['type_article'] = item.article_id.type_article

            data.append(matiere)
            currentSelect.append(str(item.article_id.id))

    return jsonify({'data': data, 'currentSelect': currentSelect})


@prefix.route('/article_fini/<objectid:compte_id>/<objectid:item_id>', methods=['GET'])
@prefix.route('/article_fini/<objectid:compte_id>/', methods=['GET'])
def articleFini(compte_id, item_id=None):

    data = []
    currentSelect = []

    if item_id :

        article = Articles.objects.get(id=item_id)

        for item in article.matiere_premiere:

            matiere = {}
            matiere['id'] = str(item.article_id.id)
            matiere['name'] = item.article_id.name
            matiere['quantite'] = float(item.quantite)

            data.append(matiere)
            currentSelect.append(str(item.article_id.id))

    return jsonify({'data': data, 'currentSelect': currentSelect})
