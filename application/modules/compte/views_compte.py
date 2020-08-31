__author__ = 'User'

from ...modules import *
from models_compte import Comptes
from forms_compte import FormCompte

prefix = Blueprint('compte', __name__)


@prefix.route('/compte', methods=['GET', 'POST'])
@login_required
def index():

    compte = Comptes.objects().get(id=session.get('compte_id'))

    if request.method == 'POST':

        form = FormCompte(request.form)

        if form.validate_on_submit():

            compte.nameCompagny = form.nameCompagny.data
            compte.notification_email = form.notification_email.data
            compte.adresse_un = form.adresse_un.data
            compte.adresse_deux = form.adresse_deux.data
            compte.ville = form.ville.data
            compte.pays = form.pays.data
            compte.phone = form.phone.data
            compte.siteweb = form.siteweb.data
            compte.facebook_link = form.facebook_link.data
            compte.twitter_link = form.twitter_link.data
            compte.instagramm = form.instagramm.data
            compte.devise = form.devise.data

            compte.save()

            flash('Enregistrement des informations avec succes', 'success')
    else:

        form = FormCompte(obj=compte)

    pays_list = pycountry.countries

    return render_template('compte/index.html', **locals())
