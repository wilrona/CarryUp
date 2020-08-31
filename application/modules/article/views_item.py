__author__ = 'User'

from ...modules import *
from models_item import Articles, VarianteMagasin, Variantes, ArticleCompose, PrixCompose
from ..bcmd.models_bcmd import Ecritures
from ..compte.models_compte import Comptes
from forms_item import FormItem
from ..magasin.models_mag import Magasins
from ..categorie.models_cate import Categories
from ..user.models_user import Users

prefix = Blueprint('item', __name__)


@prefix.route('/', methods=['GET'])
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    return render_template('article/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    current_mag = []

    if data_id:
        data = Articles.objects.get(id=data_id)
        form = FormItem(obj=data)
        form.id.data = data_id

        if request.method == 'GET':
            if data.categorie:
                form.categorie.data = str(data.categorie.id)

            if data.magasins:
                form.magasin.data = []
                for cat in data.magasins:
                    form.magasin.data.append(str(cat.id))

            form.type_article.data = data.type_article
    else:
        data = Articles()
        form = FormItem()

        if request.method == 'GET':
            form.type_article.data = 0

    compte = Comptes.objects().get(id=session.get('compte_id'))
    user = Users.objects.get(id=session.get('user_id'))
    magasins = Magasins.objects(compte=compte.id)

    form.categorie.choices = [('', 'Faite le choix de la categorie')]

    categorie = Categories.objects(Q(grpe_article=0) & Q(type_cat=0) & Q(compte=compte))
    for choice in categorie:
        form.categorie.choices.append((str(choice.id), choice.name))

    form.magasin.choices = [('', 'Tous les points de vente')]

    magasin = Magasins.objects(compte=compte)
    for choice in magasin:
        form.magasin.choices.append((str(choice.id), choice.name))

    if form.validate_on_submit():

        data.name = form.name.data
        data.description = form.description.data
        data.compte = compte
        data.type_article = form.type_article.data

        data.a_vendre = form.a_vendre.data
        data.prix_achat = float(form.prix_achat.data)

        if form.categorie.data:
            selectCat = Categories.objects.get(id=form.categorie.data)
            data.categorie = selectCat

        data.magasins = []

        for itemMag in form.magasin.data:
            magasin = Magasins.objects().get(id=itemMag)
            data.magasins.append(magasin)

        data.produit_compose = []

        data.variantes = []

        if not form.type_article.data :

            # sauvegarde des variantes de l'article
            json_data = str(form.variantes.data)
            varianteData = json.loads(json_data)

            old_variante = data.variantes



            for variant in varianteData:

                if variant['id']:
                    currentVariante = Variantes.objects.get(id=variant['id'])
                else:
                    currentVariante = Variantes()

                currentVariante.name = variant['name']
                currentVariante.base = variant['base']
                currentVariante.prix_vente = float(variant['prix_vente'])
                currentVariante.magasins = []

                # Enregistrement des magasins implique par la variante
                for magasin in variant['magasin']:

                    magasinVar = VarianteMagasin()
                    mags = Magasins.objects.get(id=magasin['mag_id'])
                    magasinVar.mag_id = mags
                    magasinVar.stock = float(magasin['stock'])
                    magasinVar.stock_alert = float( magasin['stock_alert'])
                    magasinVar.alert = magasin['alert']
                    magasinVar.prix_vente = float(magasin['prix_vente'])
                    magasinVar.active = magasin['active']
                    if magasin['show'] is False:
                        magasinVar.active = False
                    magasinVar.alonePrice = magasin['alone_price']
                    magasinVar.show = magasin['show']

                    currentVariante.magasins.append(magasinVar)

                # Enregistrement de la variante dans l'article concerne
                currentVariante.save()
                data.variantes.append(currentVariante)

        else:

            json_data = str(form.produit_compose.data)
            produit_compose = json.loads(json_data)

            for produit in produit_compose:
                current = ArticleCompose()

                variante = Variantes.objects.get(id=produit['id'])
                current.article_id = variante.article_id
                current.variante_id = variante

                current.quantite = float(produit['quantite'])
                data.produit_compose.append(current)

    	data.save()

        for old_variant in old_variante:

            if old_variant not in data.variantes:

                for magasin in old_variant.magasins:

                    if magasin.stock:

                        ecriture = Ecritures()
                        ecriture.quantite = magasin.stock

                        ecriture.prix_achat = old_variant.article_id.prix_achat
                        ecriture.compte = compte
                        ecriture.prix_vente = old_variant.prix_vente
                        if magasin.alonePrice:
                            ecriture.prix_vente = magasin.prix_vente

                        ecriture.article = old_variant.article_id
                        ecriture.variante = old_variant

                        ecriture.quantite_after = magasin.stock - ecriture.quantite

                        ecriture.type_ecriture = 0
                        ecriture.reason = 'Epuisement du stock'
                        if not magasin.active:
                            ecriture.reason = 'Annulation du stock'
                        ecriture.magasin = data.magasin_origine
                        ecriture.document = data

                        ecriture.user = user
                        ecriture.save()

            else:

                for magasin in old_variant.magasins:

                    if magasin.mag_id.id not in data.magasin_active() and magasin.stock:

                        ecriture = Ecritures()
                        ecriture.quantite = magasin.stock

                        ecriture.prix_achat = old_variant.article_id.prix_achat
                        ecriture.compte = compte
                        ecriture.prix_vente = old_variant.prixVente(magasin.mag_id.id)

                        ecriture.article = old_variant.article_id
                        ecriture.variante = old_variant

                        ecriture.quantite_after = magasin.stock - ecriture.quantite

                        ecriture.type_ecriture = 0
                        ecriture.reason = 'Epuisement du stock'
                        if not magasin.active:
                            ecriture.reason = 'Annulation du stock'
                        ecriture.magasin = magasin.mag_id

                        ecriture.user = user
                        ecriture.save()


        # Enregistrement de l'id de l'article dans les variantes
        for var in data.variantes:
            VarTo = Variantes.objects.get(id=var.id)
            VarTo.article_id = data

            # Traitement du reajout d'un magasin existant qui etait au prealable a show false.
            for magasin in VarTo.magasins:

                for old in old_variante:

                    if old.show_magasin(magasin.mag_id.id) is False and magasin.show is True and old.id == var.id:

                        ecriture = Ecritures()
                        ecriture.quantite = old.stock_magasin(magasin.mag_id.id)

                        ecriture.prix_achat = old.article_id.prix_achat
                        ecriture.compte = compte
                        ecriture.prix_vente = old.prixVente(magasin.mag_id.id)

                        ecriture.article = old.article_id
                        ecriture.variante = old

                        ecriture.quantite_after = ecriture.quantite

                        ecriture.type_ecriture = 1
                        ecriture.reason = 'Approvisionnement du stock'
                        ecriture.magasin = magasin.mag_id

                        ecriture.user = user
                        ecriture.save()

            VarTo.save()

        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('item.index'))

    return render_template('article/edit.html', **locals())
