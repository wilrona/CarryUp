__author__ = 'User'

from ...modules import *
from ..bcmd.models_bcmd import Documents, LigneDoc, Ecritures, StoryReceipt
from ..compte.models_compte import Comptes
from ..bcmd.forms_bcmd import FormVente
from ..magasin.models_mag import Magasins
from ..customer.models_client import Clients
from ..article.models_item import Articles, Variantes
from ..user.models_user import Users

prefix = Blueprint('vente', __name__)

@prefix.route('/', methods=['GET'])
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))    

    return render_template('vente/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    if data_id:
        data = Documents.objects.get(id=data_id)
        form = FormVente(obj=data)
        form.id.data = data_id

        form.magasin_origine.data = str(data.magasin_origine.id)

    else:
        data = Documents()
        form = FormVente()

    compte = Comptes.objects.get(id=session.get('compte_id'))

    if request.method == 'GET' and not data_id:
        time_zones = tzlocal()
        date_auto_nows = datetime.datetime.now(time_zones).strftime("%m/%d/%y")
        current_date = datetime.datetime.strptime(date_auto_nows, "%m/%d/%y")
        form.date_bon.data = current_date

    magasin = Magasins.objects(compte=compte)

    form.magasin_origine.choices = [('', 'Choix du magasin')]
    for choice_mag in magasin:
        form.magasin_origine.choices.append((str(choice_mag.id), choice_mag.name))

    if form.validate_on_submit():

        if not data.reference:
            count_transaction = Documents.objects(Q(compte=compte) & Q(type_transaction=4)).count()
            data.reference = function.reference(prefix='SO', count=count_transaction+1, caractere=7)
        data.etat = 1

        magasin = Magasins.objects.get(id=form.magasin_origine.data)
        data.magasin_origine = magasin

        data.date_bon = datetime.datetime.combine(function.date_convert(form.date_bon.data), datetime.datetime.min.time())

        data.compte = compte

        user = Users.objects.get(id=session.get('user_id'))
        data.user = user

        json_data = str(form.ligne_data.data)
        ligne_data = json.loads(json_data)

        data.ligne_data = []
        for item in ligne_data:
            ligne = LigneDoc()

            variante = Variantes.objects.get(id=item['id'])
            ligne.article_id = variante.article_id
            ligne.variante_id = variante

            ligne.quantite = float(item['quantite'])
            ligne.prix_vente = float(item['prix_vente'])

            data.ligne_data.append(ligne)

        data.save()

        for item in data.ligne_data:

            ecriture = Ecritures()

            variante = Variantes.objects.get(id=item.variante_id.id)
            ecriture.quantite = item.quantite

            ecriture.prix_achat = variante.article_id.prix_achat
            ecriture.compte = compte

            ecriture.prix_vente = item.prix_vente

            ecriture.article = variante.article_id
            ecriture.variante = variante

            for mag in variante.magasins:
                if mag.mag_id.id == data.magasin_origine.id:
                    if mag.active :
                        ecriture.quantite_after = mag.stock - ecriture.quantite
                        mag.stock -= ecriture.quantite
                    else:
                        ecriture.quantite_after = mag.stock
            variante.save()

            ecriture.type_ecriture = 2
            ecriture.reason = 'Vente en PDV'
            ecriture.magasin = data.magasin_origine
            ecriture.document = data

            ecriture.user = user
            ecriture.save()

            for recette in item.recette_complement:

                complemt = Articles.objects.get(id=recette.article_id.id)

                if complemt.type_article == 0:

                    variante = Variantes.objects.get(id=recette.variante_id.id)

                    active = False
                    # Verifier si le magasin en cours accepte le suivie de stock
                    for mag in variante.magasins:
                        if mag.mag_id.id == data.magasin_origine.id and mag.active:
                            active = True

                    if active:

                        ecriture = Ecritures()

                        ecriture.quantite = item.quantite * recette.quantite

                        ecriture.prix_achat = variante.article_id.prix_achat
                        ecriture.compte = compte

                        ecriture.prix_vente = variante.prixVente(data.magasin_origine.id)

                        ecriture.article = variante.article_id
                        ecriture.variante = variante

                        for mag in variante.magasins:
                            if mag.mag_id.id == data.magasin_origine.id:
                                if mag.active :
                                    ecriture.quantite_after = mag.stock - ecriture.quantite
                                    mag.stock -= ecriture.quantite
                                else:
                                    ecriture.quantite_after = mag.stock
                        variante.save()

                        ecriture.type_ecriture = 0
                        ecriture.reason = 'Consommation (Vente en PDV)'
                        ecriture.magasin = data.magasin_origine
                        ecriture.document = data

                        ecriture.user = user
                        ecriture.save()



        flash('Enregistrement avec succes.', 'success')
        if data_id:
            return redirect(url_for('vente.view', data_id=data_id))
        else:
            return redirect(url_for('vente.index'))

    return render_template('vente/edit.html', **locals())


@prefix.route('/view/<objectid:data_id>', methods=['GET', 'POST'])
@login_required
def view(data_id):

    data = Documents.objects.get(id=data_id)
    form = FormBon(obj=data)
    form.id.data = data_id

    compte = Comptes.objects.get(id=session.get('compte_id'))
    magasin = Magasins.objects(compte=compte)

    recu = 0
    total = 0

    for receipt in data.ligne_data:
        recu += receipt.quantite_recu
        total += receipt.quantite

    return render_template('vente/view.html', **locals())


@prefix.route('/annulation/<objectid:data_id>', methods=['GET'])
@login_required
def annulation(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat == 2 or data.etat == 3:
        flash('Impposible d\'annuler un bon en reception partielle ou Terminee.', 'success')
        return redirect(url_for('bcmd.view', data_id=data_id))

    data.etat = 4
    data.save()

    flash('Annulation enregistree avec succes.', 'success')
    return redirect(url_for('bcmd.view', data_id=data_id))
