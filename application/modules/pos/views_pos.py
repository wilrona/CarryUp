__author__ = 'User'

from ...modules import *
from models_pos import PointDeVente
from ..compte.models_compte import Comptes
from ..magasin.models_mag import Magasins
from forms_pos import FormPos

prefix = Blueprint('pos', __name__)


@prefix.route('/pdv', methods=['GET'])
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    return render_template('pos/index.html', **locals())


@prefix.route('/pdv/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/pdv/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):
    if data_id:
        data = PointDeVente.objects.get(id=data_id)
        form = FormPos(obj=data)
        form.id.data = data_id

        if request.method == 'GET':
            form.magasin.data = str(data.magasin.id)
    else:
        data = PointDeVente()
        form = FormPos()

    form.magasin.choices = [('', 'Faite le choix du magasin')]

    magasin = Magasins.objects()
    for choice in magasin:
        form.magasin.choices.append((str(choice.id), choice.name))

    if form.validate_on_submit():
        data.name = form.name.data

        principale = Magasins.objects.get(id=form.magasin.data)

        if data.magasin and principale.id != data.magasin.id and data.id:
            old_magasin = Magasins.objects.get(id=data.magasin.id)
            if data in old_magasin.pos:
                old_magasin.pos.remove(data)
                old_magasin.save()

        data.magasin = principale

        compte = Comptes.objects().get(id=session.get('compte_id'))
        data.compte = compte

        data.save()

        if data not in principale.pos:
            principale.pos.append(data)
            principale.save()

        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('pos.index'))

    return render_template('pos/edit.html', **locals())


@prefix.route('/pdv/active/<objectid:data_id>', methods=['GET'])
def active(data_id):
    data = PointDeVente.objects.get(id=data_id)
    if data.active :
        data.active = False
    else:
        data.active = True
    data.save()

    flash('Modification avec succes.', 'success')
    return redirect(url_for('pos.index'))
