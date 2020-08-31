__author__ = 'User'

from ...modules import *
from models_bcmd import Documents, LigneDoc, Ecritures, StoryReceipt
from ..compte.models_compte import Comptes
from forms_bcmd import FormBon
from ..magasin.models_mag import Magasins
from ..customer.models_client import Clients
from ..article.models_item import Articles, Variantes
from ..user.models_user import Users

prefix = Blueprint('bcmd', __name__)

@prefix.route('/', methods=['GET'])
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    return render_template('bcmd/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    if data_id:
        data = Documents.objects.get(id=data_id)
        form = FormBon(obj=data)
        form.id.data = data_id

        form.fournisseur.data = str(data.fournisseur.id)
        form.magasin_origine.data = str(data.magasin_origine.id)

        if data.etat == 2 or data.etat == 3:
            return redirect(url_for('bcmd.view', data_id=data_id))

    else:
        data = Documents()
        form = FormBon()

    compte = Comptes.objects.get(id=session.get('compte_id'))

    if request.method == 'GET' and not data_id:
        time_zones = tzlocal()
        date_auto_nows = datetime.datetime.now(time_zones).strftime("%m/%d/%y")
        current_date = datetime.datetime.strptime(date_auto_nows, "%m/%d/%y")
        form.date_bon.data = current_date

    form.fournisseur.choices = [('', 'Choix du fournisseur')]
    fournisseur = Clients.objects(Q(compte=compte) & Q(type_client=1))
    for choice_four in fournisseur:
        form.fournisseur.choices.append((str(choice_four.id), choice_four.display_name))

    magasin = Magasins.objects(compte=compte)

    form.magasin_origine.choices = [('', 'Choix du magasin')]
    for choice_mag in magasin:
        form.magasin_origine.choices.append((str(choice_mag.id), choice_mag.name))

    if form.validate_on_submit():

        if not data.reference:
            count_transaction = Documents.objects(Q(compte=compte) & Q(type_transaction=0)).count()
            data.reference = function.reference(prefix='PO', count=count_transaction+1, caractere=7)
        data.etat = 1

        fournisseur = Clients.objects.get(id=form.fournisseur.data)
        data.fournisseur = fournisseur

        magasin = Magasins.objects.get(id=form.magasin_origine.data)
        data.magasin_origine = magasin

        data.date_bon = datetime.datetime.combine(function.date_convert(form.date_bon.data), datetime.datetime.min.time())

        if form.date_prevu_bon.data:
            data.date_prevu_bon = datetime.datetime.combine(function.date_convert(form.date_prevu_bon.data), datetime.datetime.min.time())

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
            ligne.prix_achat = float(item['prix_achat'])

            ligne.quantite_recu = 0

            data.ligne_data.append(ligne)

        data.save()

        flash('Enregistrement avec succes.', 'success')
        if data_id:
            return redirect(url_for('bcmd.view', data_id=data_id))
        else:
            return redirect(url_for('bcmd.index'))

    return render_template('bcmd/edit.html', **locals())


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

    return render_template('bcmd/view.html', **locals())


@prefix.route('/reception/<objectid:data_id>', methods=['GET', 'POST'])
@login_required
def reception(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat > 2 :
        flash('Vous ne pouvez plus effectuer des receptions sur ce bon de commande.', 'warning')
        return redirect(url_for('bcmd.view', data_id=data_id))

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
                        ecriture  = Ecritures()
                        ecriture.quantite = float(request.form.getlist('a_recevoir')[index])
                        ecriture.prix_achat = subitem.article_id.prix_achat
                        article = Articles.objects.get(id=subitem.article_id.id)

                        if subitem.prix_achat != float(request.form.getlist('prix_achat')[index]):
                            subitem.prix_achat_recu = float(request.form.getlist('prix_achat')[index])
                            ecriture.prix_achat = float(request.form.getlist('prix_achat')[index])

                            if article.prix_achat < subitem.prix_achat_recu:
                                article.prix_achat = subitem.prix_achat_recu
                                article.save()

                        ecriture.article = article
                        ecriture.compte = compte

                        # Enregistrement du stock dans le magasin stock_en_court = 0
                        variante = Variantes.objects.get(id=subitem.variante_id.id)
                        ecriture.prix_vente = variante.prixVente(data.magasin_origine.id)
                        for mag in variante.magasins:
                            if mag.mag_id.id == data.magasin_origine.id:
                                ecriture.quantite_after = mag.stock + float(request.form.getlist('a_recevoir')[index])
                                mag.stock += float(request.form.getlist('a_recevoir')[index])

                        variante.save()

                        ecriture.variante = variante

                        ecriture.type_ecriture = 1
                        ecriture.reason = 'Reception de stock'
                        ecriture.document = data
                        ecriture.magasin = data.magasin_origine

                        ecriture.user = user
                        ecriture.save()

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

                        # Debut ecriture de stock
                        ecriture  = Ecritures()
                        ecriture.quantite = reste
                        ecriture.prix_achat = subitem.prix_achat

                        article = Articles.objects.get(id=subitem.article_id.id)

                        if subitem.prix_achat != float(request.form.getlist('prix_achat')[index]):
                            subitem.prix_achat_recu = float(request.form.getlist('prix_achat')[index])
                            ecriture.prix_achat = float(request.form.getlist('prix_achat')[index])

                            if article.prix_achat < subitem.prix_achat_recu:
                                article.prix_achat = subitem.prix_achat_recu
                                article.save()

                        ecriture.article = article
                        ecriture.compte = compte

                        # Enregistrement du stock dans le magasin stock_en_court = 0
                        variante = Variantes.objects.get(id=subitem.variante_id.id)
                        ecriture.prix_vente = variante.prixVente(data.magasin_origine.id)
                        for mag in variante.magasins:
                            if mag.mag_id.id == data.magasin_origine.id:
                                ecriture.quantite_after = mag.stock + reste
                                mag.stock += reste

                        variante.save()

                        ecriture.type_ecriture = 1
                        ecriture.reason = 'Reception de stock'
                        ecriture.document = data
                        ecriture.magasin = data.magasin_origine

                        ecriture.user = user
                        ecriture.save()

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

        return redirect(url_for('bcmd.view', data_id=data_id))

    return render_template('bcmd/reception.html', **locals())


@prefix.route('/annulation/<objectid:data_id>', methods=['GET'])
@login_required
def annulation(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat == 2 or data.etat == 3:
        flash('Impposible d\'annuler un bon en reception partielle ou Terminee.', 'warning')
        return redirect(url_for('bcmd.view', data_id=data_id))

    data.etat = 4
    data.save()

    flash('Annulation enregistree avec succes.', 'success')
    return redirect(url_for('bcmd.view', data_id=data_id))


@prefix.route('/annulation/article/<objectid:data_id>', methods=['GET'])
@login_required
def annularticle(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat != 2 :
        flash('Impossible d\'annuler le reste d\'article du bon de commande.', 'warning')
        return redirect(url_for('bcmd.view', data_id=data_id))

    for ligne in data.ligne_data:
        ligne.quantite = ligne.quantite_recu
        ligne.receipt = 1

    data.etat = 3
    data.save()

    flash('Annulation des articles restants effectue avec succes.', 'success')
    return redirect(url_for('bcmd.view', data_id=data_id))


@prefix.route('/delete/<objectid:data_id>', methods=['GET'])
@login_required
def delete(data_id):

    data = Documents.objects.get(id=data_id)

    if data.etat > 0 :
        flash('Impossible de supprimer ce bon de commande.', 'warning')
        return redirect(url_for('bcmd.view', data_id=data_id))

    data.delete()

    flash('Suppression reussie avec succes.', 'success')
    return redirect(url_for('bcmd.index'))
