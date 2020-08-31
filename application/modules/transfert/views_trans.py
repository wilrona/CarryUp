__author__ = 'User'

from ...modules import *
from ..bcmd.models_bcmd import Documents, LigneDoc, Ecritures, StoryReceipt
from ..compte.models_compte import Comptes
from ..bcmd.forms_bcmd import FormTransfert
from ..magasin.models_mag import Magasins
from ..customer.models_client import Clients
from ..article.models_item import Articles, Variantes
from ..user.models_user import Users

prefix = Blueprint('transfert', __name__)

@prefix.route('/', methods=['GET'])
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    return render_template('transfert/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    if data_id:
        data = Documents.objects.get(id=data_id)
        form = FormTransfert(obj=data)
        form.id.data = data_id

        form.magasin_origine.data = str(data.magasin.id)
        form.magasin_destination.data = str(data.magasin_destination.id)

    else:
        data = Documents()
        form = FormTransfert()

    compte = Comptes.objects.get(id=session.get('compte_id'))

    if request.method == 'GET' and not data_id:
        time_zones = tzlocal()
        date_auto_nows = datetime.datetime.now(time_zones).strftime("%m/%d/%y")
        current_date = datetime.datetime.strptime(date_auto_nows, "%m/%d/%y")
        form.date_bon.data = current_date

    magasin = Magasins.objects(compte=compte)

    form.magasin_origine.choices = [('', 'Choix du PDV d\'origine')]
    for choice_mag in magasin:
        form.magasin_origine.choices.append((str(choice_mag.id), choice_mag.name))

    form.magasin_destina.choices = [('', 'Choix du PDV de destination')]
    for choice_mag_des in magasin:
        form.magasin_destina.choices.append((str(choice_mag_des.id), choice_mag_des.name))

    if form.validate_on_submit():

        if not data.reference :
            count_transaction = Documents.objects(Q(compte=compte) & Q(type_transaction=1)).count()
            data.reference = function.reference(prefix='TO', count=count_transaction+1, caractere=7)

        data.etat = 1
        data.type_transaction = 1

        magasin_ori = Magasins.objects.get(id=form.magasin_origine.data)
        data.magasin_origine = magasin_ori

        magasin_des = Magasins.objects.get(id=form.magasin_destina.data)
        data.magasin_destina = magasin_des

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
            ligne.old_stock = float(item['stock'])

            ligne.quantite_recu = 0

            data.ligne_data.append(ligne)

        data.save()

        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('transfert.index'))

    return render_template('transfert/edit.html', **locals())



@prefix.route('/view/<objectid:data_id>', methods=['GET', 'POST'])
@login_required
def view(data_id):

    data = Documents.objects.get(id=data_id)
    form = FormTransfert(obj=data)
    form.id.data = data_id

    compte = Comptes.objects.get(id=session.get('compte_id'))

    recu = 0
    total = 0

    for receipt in data.ligne_data:
        recu += receipt.quantite_recu
        total += receipt.quantite

    return render_template('transfert/view.html', **locals())


@prefix.route('/reception/<objectid:data_id>', methods=['GET', 'POST'])
@login_required
def reception(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat > 2 :
        flash('Vous ne pouvez plus effectuer des receptions sur ce transfert de stock.', 'warning')
        return redirect(url_for('transfert.view', data_id=data_id))

    if request.method == 'POST':

        compte = Comptes.objects.get(id=session.get('compte_id'))
        user = Users.objects.get(id=session.get('user_id'))

        data_to_update = data.ligne_data

        index = 0
        saved = False

        for item in request.form.getlist('index'):

            if float(request.form.getlist('a_recevoir')[index]) != 0:
                saved = True

                for subitem in data_to_update:

                    if str(subitem.variante_id.id) == request.form.getlist('item_id')[index]:

                        subitem.quantite_recu += float(request.form.getlist('a_recevoir')[index])

                        store = []
                        if subitem.story_receipt:
                            store = subitem.story_receipt

                        story = StoryReceipt()
                        story.date_receipt = datetime.datetime.now()
                        story.quantite_recu = float(request.form.getlist('a_recevoir')[index])

                        store.append(story)
                        subitem.story_receipt = store

                        # Debut ecriture de stock

                        ecriture_entre  = Ecritures()
                        ecriture_sorti  = Ecritures()

                        ecriture_sorti.quantite = ecriture_entre.quantite = float(request.form.getlist('a_recevoir')[index])
                        ecriture_sorti.prix_achat = ecriture_entre.prix_achat = subitem.article_id.prix_achat
                        ecriture_sorti.compte = ecriture_entre.compte = compte

                        article = Articles.objects.get(id=subitem.article_id.id)

                        ecriture_sorti.article = ecriture_entre.article = article

                        # Enregistrement du stock dans le magasin stock_en_court = 0

                        variante = Variantes.objects.get(id=subitem.variante_id.id)
                        ecriture_entre.prix_vente = variante.prixVente(data.magasin_destina.id)
                        ecriture_sorti.prix_vente = variante.prixVente(data.magasin_origine.id)
                        for mag in variante.magasins:
                            if mag.mag_id.id == data.magasin_origine.id:
                                ecriture_sorti.quantite_after = mag.stock - float(request.form.getlist('a_recevoir')[index])
                                mag.stock -= float(request.form.getlist('a_recevoir')[index])
                                if mag.alonePrice :
                                    ecriture_sorti.prix_vente = mag.prix_vente

                            if mag.mag_id.id == data.magasin_destina.id:
                                ecriture_entre.quantite_after = mag.stock + float(request.form.getlist('a_recevoir')[index])
                                mag.stock += float(request.form.getlist('a_recevoir')[index])
                                if mag.alonePrice :
                                    ecriture_entre.prix_vente = mag.prix_vente

                        variante.save()

                        ecriture_entre.variante = ecriture_sorti.variante = variante

                        ecriture_sorti.type_ecriture = 0
                        ecriture_entre.type_ecriture = 1

                        ecriture_sorti.reason = 'Transfert de stock (Sortie)'
                        ecriture_entre.reason = 'Transfert de stock (Entree)'

                        ecriture_sorti.document = ecriture_entre.document = data

                        ecriture_sorti.magasin_origine = data.magasin_origine
                        ecriture_entre.magasin_destina = data.magasin_destina

                        ecriture_sorti.user = ecriture_entre.user = user

                        ecriture_entre.save()
                        ecriture_sorti.save()

                        if subitem.quantite_recu == subitem.quantite:
                            subitem.receipt = 1
                        else:
                            subitem.receipt = 2


            if float(request.form.getlist('a_recevoir')[index]) == 0 and float(request.form['all_reception']) == 1:
                saved = True
                for subitem in data_to_update:

                    if str(subitem.variante_id.id) == request.form.getlist('item_id')[index]:

                        # old_quantite = subitem.quantite_recu

                        reste = subitem.quantite - subitem.quantite_recu

                        subitem.quantite_recu += reste

                        store = []
                        if subitem.story_receipt:
                            store = subitem.story_receipt

                        story = StoryReceipt()
                        story.date_receipt = datetime.datetime.now()
                        story.quantite_recu = reste

                        store.append(story)
                        subitem.story_receipt = store

                        time_zones = tzlocal()
                        date_auto_nows = datetime.datetime.now(time_zones).strftime("%m/%d/%y")
                        current_date = datetime.datetime.strptime(date_auto_nows, "%m/%d/%y")

                        story = StoryReceipt()
                        story.date_receipt = datetime.datetime.combine(function.date_convert(current_date), datetime.datetime.min.time())
                        story.quantite_recu = reste

                        subitem.story_receipt.append(story)

                        # Debut ecriture de stock
                        ecriture_entre  = Ecritures()
                        ecriture_sorti  = Ecritures()

                        ecriture_sorti.quantite = ecriture_entre.quantite = reste
                        ecriture_sorti.prix_achat = ecriture_entre.prix_achat = subitem.prix_achat
                        ecriture_sorti.compte = ecriture_entre.compte = compte

                        article = Articles.objects.get(id=subitem.article_id.id)

                        ecriture_sorti.article = ecriture_entre.article = article

                        # Enregistrement du stock dans le magasin stock_en_court = 0

                        variante = Variantes.objects.get(id=subitem.variante_id.id)
                        ecriture_entre.prix_vente = variante.prixVente(data.magasin_destina.id)
                        ecriture_sorti.prix_vente = variante.prixVente(data.magasin_origine.id)
                        for mag in variante.magasins:
                            if mag.mag_id.id == data.magasin_origine.id:
                                ecriture_sorti.quantite_after = mag.stock - reste
                                mag.stock -= reste
                                if mag.alonePrice :
                                    ecriture_sorti.prix_vente = mag.prix_vente

                            if mag.mag_id.id == data.magasin_destina.id:
                                ecriture_entre.quantite_after = mag.stock + reste
                                mag.stock += reste
                                if mag.alonePrice :
                                    ecriture_entre.prix_vente = mag.prix_vente

                        variante.save()

                        ecriture_sorti.type_ecriture = 0
                        ecriture_entre.type_ecriture = 1

                        ecriture_sorti.reason = 'Transfert de stock (Sortie)'
                        ecriture_entre.reason = 'Transfert de stock (Entree)'

                        ecriture_sorti.document = ecriture_entre.document = data

                        ecriture_sorti.magasin_origine = data.magasin_origine
                        ecriture_entre.magasin_destina = data.magasin_destina

                        ecriture_sorti.user = ecriture_entre.user = user

                        ecriture_entre.save()
                        ecriture_sorti.save()

                        if subitem.quantite_recu == subitem.quantite:
                            subitem.receipt = 1
                        else:
                            subitem.receipt = 2

            index += 1

        if saved:

            itemTotal = 0
            itemPartiel = False
            for update in data_to_update:
                if update.receipt == 1:
                    itemTotal += 1
                if update.receipt == 2:
                    itemPartiel = True

            if len(data_to_update) == itemTotal:
                data.etat = 3
            else:
                if itemPartiel:
                    data.etat = 2

            data.ligne_data = data_to_update
            data.save()
            flash('Reception enregistree avec succes.', 'success')

        return redirect(url_for('transfert.view', data_id=data_id))

    return render_template('transfert/reception.html', **locals())


@prefix.route('/annulation/<objectid:data_id>', methods=['GET'])
@login_required
def annulation(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat == 2 or data.etat == 3:
        flash('Impposible d\'annuler un ordre de transfert en reception partielle ou Terminee.', 'warning')
        return redirect(url_for('transfert.view', data_id=data_id))

    data.etat = 4
    data.save()

    flash('Annulation enregistree avec succes.', 'success')
    return redirect(url_for('transfert.view', data_id=data_id))


@prefix.route('/annulation/article/<objectid:data_id>', methods=['GET'])
@login_required
def annularticle(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat != 2 :
        flash('Impossible d\'annuler le reste d\'article du transfert de stock.', 'warning')
        return redirect(url_for('transfert.view', data_id=data_id))

    for ligne in data.ligne_data:
        ligne.quantite = ligne.quantite_recu
        ligne.receipt = 1

    data.etat = 3
    data.save()

    flash('Annulation des articles restants effectue avec succes.', 'success')
    return redirect(url_for('transfert.view', data_id=data_id))


@prefix.route('/delete/<objectid:data_id>', methods=['GET'])
@login_required
def delete(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat > 0 :
        flash('Impossible de supprimer ce transfert de stock.', 'warning')
        return redirect(url_for('transfert.view', data_id=data_id))

    data.delete()

    flash('Suppression reussie avec succes.', 'success')
    return redirect(url_for('transfert.index'))
