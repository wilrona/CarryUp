# coding=utf-8
__author__ = 'wilrona'

from ...modules import *
from ..customer.models_client import Clients
from ..compte.models_compte import Comptes
from ..customer.forms_client import FormClient

prefix = Blueprint('four', __name__)


@prefix.route('/')
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    return render_template('fournisseur/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    if data_id:
        data = Clients.objects.get(id=data_id)
        form = FormClient(obj=data)
        form.id.data = data_id

    else:
        data = Clients()
        form = FormClient()

    form.type_client.data = 1

    compte = Comptes.objects().get(id=session.get('compte_id'))

    if form.validate_on_submit():

        data.display_name = form.display_name.data

        data.phone = form.phone.data
        data.email = form.email.data

        data.note = form.note.data

        data.ville = form.ville.data
        data.quartier = form.quartier.data
        data.type_client = form.type_client.data

        data.compte = compte

        data.save()

        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('four.index'))

    return render_template('fournisseur/edit.html', **locals())
