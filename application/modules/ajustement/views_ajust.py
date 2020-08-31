__author__ = 'User'

from ...modules import *
from ..bcmd.models_bcmd import Documents, LigneDoc, Ecritures
from ..compte.models_compte import Comptes
from ..bcmd.forms_bcmd import FormAjustement
from ..magasin.models_mag import Magasins
from ..customer.models_client import Clients
from ..article.models_item import Articles, Variantes
from ..user.models_user import Users

prefix = Blueprint('ajustement', __name__)

@prefix.route('/', methods=['GET'])
@login_required
def index():

    compte = Comptes.objects.get(id=session.get('compte_id'))

    return render_template('ajustement/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    if data_id:
        data = Documents.objects.get(id=data_id)
        form = FormAjustement(obj=data)
        form.id.data = data_id

        form.magasin_origine.data = str(data.magasin.id)

    else:
        data = Documents()
        form = FormAjustement()

    compte = Comptes.objects.get(id=session.get('compte_id'))

    if request.method == 'GET' and not data_id:
        time_zones = tzlocal()
        date_auto_nows = datetime.datetime.now(time_zones).strftime("%m/%d/%y")
        current_date = datetime.datetime.strptime(date_auto_nows, "%m/%d/%y")
        form.date_bon.data = current_date

    magasin = Magasins.objects(compte=compte)

    form.magasin_origine.choices = [('', 'Choix du point de vente d\'origine')]
    for choice_mag in magasin:
        form.magasin_origine.choices.append((str(choice_mag.id), choice_mag.name))

    if form.validate_on_submit():

        if not data.reference :
            count_transaction = Documents.objects(Q(compte=compte) & Q(type_transaction=2)).count()
            data.reference = function.reference(prefix='SA', count=count_transaction+1, caractere=7)

        data.etat = int(form.etat.data)
        data.type_transaction = 2

        magasin_ori = Magasins.objects.get(id=form.magasin_origine.data)
        data.magasin_origine = magasin_ori

        data.date_bon = datetime.datetime.combine(function.date_convert(form.date_bon.data), datetime.datetime.min.time())

        data.compte = compte

        user = Users.objects.get(id=session.get('user_id'))
        data.user = user

        json_data = str(form.ligne_data.data)
        ligne_data = json.loads(json_data)

        ligne_data_save = []
        for item in ligne_data:
            ligne = LigneDoc()

            variante = Variantes.objects.get(id=item['id'])
            ligne.article_id = variante.article_id
            ligne.variante_id = variante

            ligne.quantite = float(item['quantite'])
            ligne.old_stock = float(item['stock'])

            ligne_data_save.append(ligne)

        data.ligne_data = ligne_data_save

        data.save()

        # Enregistrement de l'ecriture de stock
        for item in data.ligne_data:

            ecriture  = Ecritures()

            variante = Variantes.objects.get(id=item.variante_id.id)

            # transformer la valeur de la quantite en valeur positive
            quantite = item.quantite
            if quantite < 0:
                quantite = - 1 * quantite
            ecriture.quantite = quantite

            ecriture.prix_achat = variante.article_id.prix_achat
            ecriture.compte = compte

            ecriture.prix_vente = variante.prixVente(data.magasin_origine.id)

            ecriture.article = variante.article_id
            ecriture.variante = variante

            stock_different = 0
            for mag in variante.magasins:
                if mag.mag_id.id == data.magasin_origine.id:

                    if data.etat == 1: # Recomptage
                        ecriture.quantite_after = item.quantite
                        mag.stock = item.quantite
                        stock_different = mag.stock - item.quantite

                    if data.etat == 0 or data.etat > 1:
                        ecriture.quantite_after = mag.stock + item.quantite
                        mag.stock += item.quantite

            variante.save()

            if data.etat == 1: # Recomptage
                ecriture.type_ecriture = 2
                ecriture.reason = 'Recomptage de stock'

            if data.etat == 0 : # Stock Recu
                ecriture.type_ecriture = 1
                ecriture.reason = 'Reception de stock'

            if data.etat > 1: # Dommage, Vol, Perte, Don
                ecriture.type_ecriture = 0
                if data.etat == 2:
                    ecriture.reason = 'Dommage de stock (Sortie)'

                if data.etat == 3:
                    ecriture.reason = 'Vol de stock (Sortie)'

                if data.etat == 4:
                    ecriture.reason = 'Perte de stock (Sortie)'

                if data.etat == 5:
                    ecriture.reason = 'Don de stock (Sortie)'

            ecriture.document = data
            ecriture.magasin = data.magasin_origine

            ecriture.user = user

            ecriture.save()

            # Contre ecriture pour le Recomptage de stock afin d'enregistrer les pertes ou les gains que cela engendre
            if data.etat == 1 :

                contre_ecriture = Ecritures()
                variante = Variantes.objects.get(id=item.variante_id.id)

                quantite = stock_different
                if stock_different < 0:
                    quantite = -1 * stock_different

                contre_ecriture.quantite = quantite

                contre_ecriture.prix_achat = variante.article_id.prix_achat

                contre_ecriture.article = variante.article_id
                contre_ecriture.compte = compte

                contre_ecriture.prix_vente = variante.prixVente(data.magasin_origine.id)

                contre_ecriture.article = variante.article_id
                contre_ecriture.variante = variante

                if stock_different < 0 :
                    contre_ecriture.type_ecriture = 0
                    contre_ecriture.reason = 'Recomptage de stock (Perte)'
                else:
                    contre_ecriture.type_ecriture = 1
                    contre_ecriture.reason = 'Recomptage de stock (Stock recu)'

                contre_ecriture.document = data
                contre_ecriture.magasin = data.magasin_origine

                contre_ecriture.user = user
                contre_ecriture.save()


        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('ajustement.index'))

    return render_template('ajustement/edit.html', **locals())



@prefix.route('/view/<objectid:data_id>', methods=['GET', 'POST'])
@login_required
def view(data_id):

    data = Documents.objects.get(id=data_id)
    form = FormAjustement(obj=data)
    form.id.data = data_id

    compte = Comptes.objects.get(id=session.get('compte_id'))

    return render_template('ajustement/view.html', **locals())
