__author__ = 'User'

from ...modules import *
from models_mag import Magasins
from ..compte.models_compte import Comptes
from forms_mag import FormMag

prefix = Blueprint('pdv', __name__)


@prefix.route('/', methods=['GET'])
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    return render_template('magasin/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    if data_id:
        data = Magasins.objects.get(id=data_id)
        form = FormMag(obj=data)
        form.id.data = data_id
    else:
        data = Magasins()
        form = FormMag()

    if form.validate_on_submit():

        data.name = form.name.data
        data.biographic = form.biographic.data
        data.phone = form.phone.data
        data.adresse = form.adresse.data
        data.ville = form.ville.data
        data.email = form.email.data


        compte = Comptes.objects().get(id=session.get('compte_id'))
        data.compte = compte

        data.save()

        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('pdv.index'))

    return render_template('magasin/edit.html', **locals())


@prefix.route('/delete/<objectid:data_id>', methods=['GET'])
def delete(data_id):

    data = Magasins.objects.get(id=data_id)

    if data.pos:
        flash('Suppression impossible.', 'danger')
        return redirect(url_for('param_mag.editMag', magasin_id=data.id))

    transaction = TransactionStock.objects(magasin=data.id)
    if transaction.count():
        flash('Suppression impossible.', 'danger')
        return redirect(url_for('pdv.editMag', magasin_id=data.id))

    data.delete()

    flash('Suppression avec succes.', 'success')
    return redirect(url_for('pdv.index'))
