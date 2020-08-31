__author__ = 'User'

from ...modules import *
from models_cate import Categories
from ..compte.models_compte import Comptes
from forms_cate import FormCat

prefix = Blueprint('categorie', __name__)

@prefix.route('/', methods=['GET'])
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    datas = Categories.objects(compte=compte.id)

    return render_template('categorie/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    current_mag = []

    if data_id:
        data = Categories.objects.get(id=data_id)
        form = FormCat(obj=data)
        form.id.data = data_id
    else:
        data = Categories()
        form = FormCat()

    if form.validate_on_submit():

        compte = Comptes.objects().get(id=session.get('compte_id'))

        data.name = form.name.data
        data.compte = compte
        data.type_cat = form.type_cat.data

        data.save()

        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('categorie.index'))

    return render_template('categorie/edit.html', **locals())
