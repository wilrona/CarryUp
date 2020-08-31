# coding=utf-8
__author__ = 'wilrona'

from ...modules import *
from models_client import Clients
from ..compte.models_compte import Comptes
from forms_client import FormClient
from ..categorie.models_cate import Categories

prefix = Blueprint('customer', __name__)


@prefix.route('/')
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    return render_template('client/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    if data_id:

        data = Clients.objects.get(id=data_id)
        form = FormClient(obj=data)
        form.id.data = data_id

        if request.method == 'GET':
            form.categorie.data = []
            for cat in data.categorie:
                form.categorie.data.append(str(cat.id))

    else:
        data = Clients()
        form = FormClient()

    compte = Comptes.objects().get(id=session.get('compte_id'))
    form.type_client.data = 0

    form.categorie.choices = [('', '')]

    categorie = Categories.objects(Q(type_cat=2) & Q(compte=compte))
    for choice in categorie:
        form.categorie.choices.append((str(choice.id), choice.name))

    if form.validate_on_submit():

        data.display_name = form.display_name.data
        data.entreprise = form.entreprise.data

        data.phone = form.phone.data
        data.email = form.email.data

        data.note = form.note.data

        data.ville = form.ville.data
        data.quartier = form.quartier.data
        data.type_client = form.type_client.data

        data.categorie = []
        for cat in form.categorie.data:
            cat_info = Categories.objects.get(id=cat)
            data.categorie.append(cat_info)

        data.compte = compte

        data.save()

        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('customer.index'))

    return render_template('client/edit.html', **locals())
