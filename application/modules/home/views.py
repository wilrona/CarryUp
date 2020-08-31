__author__ = 'wilrona'

from ...modules import *
from application import login_manager
from ..user.models_user import Users
from ..compte.models_compte import Comptes
from ..magasin.models_mag import Magasins
from ..pos.models_pos import PointDeVente
from ..user.forms_user import FormLogin, FormRegister
from ...token import generate_confirmation_token

prefix = Blueprint('home', __name__)


# @app.route('/set_session')
# def set_session():
#     session.permanent = True
#     return json.dumps({
#         'statut': True
#     })


@prefix.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard.index'))

    form = FormLogin()

    return render_template('user/login.html', **locals())


@prefix.route('/inscription', methods=['GET', 'POST'])
def inscription():
    if 'user_id' in session:
        return redirect(url_for('dashboard.index'))

    if request.method == 'POST':

        form = FormRegister(request.form)

        if form.validate_on_submit():

            password = hashlib.sha256(form.password.data).hexdigest()

            compte = Comptes()
            compte.nameCompagny = form.name.data
            compte.phone = form.phone.data
            compte.adresse_un = form.adresse_un.data
            compte.adresse_deux = form.adresse_deux.data
            compte.ville = form.ville.data
            compte.pays = form.pays.data
            compte.notification_email = form.email.data
            compte_save = compte.save()

            mag = Magasins()
            mag.name = 'PDV central'
            mag.compte = compte_save
            mag.ville = form.ville.data
            mag.phone = form.phone.data
            mag.email = form.email.data
            mag.principal = True
            mag.save()

            user = Users()
            user.password = password
            user.email = form.email.data
            user.first_name = form.name.data
            user.compte = compte_save
            user.magasin = mag
            user.admin_compte = True
            user.access_admin = True
            user.access_pdv = True
            user.activated = False
            user.pin = '0000'

            super_admin_exist = Users.objects(roles='super_admin').count()
            if not super_admin_exist:
                user.roles.append('super_admin')

            user.roles.append('admin')
            user.save()

            pdv = PointDeVente()
            pdv.name = 'Appareil 1'
            pdv.principal = True
            pdv.compte = compte_save
            pdv.magasin = mag
            pdv.save()

            mag.pos = []
            mag.pos.append(pdv)
            mag.save()

            data = user

            token = generate_confirmation_token(form.email.data)
            confirm_url = url_for('home_user.confirm_email', user_id=user.id, token=token, _external=True)

            # Design de l'email a faire
            html = render_template('template_mail/user/activate.html', **locals())

            msg = Message()
            msg.recipients = [user.email]
            msg.subject = user.full_name() + ', veuillez confirmer votre adresse e-mail'
            msg.sender = (user.email, 'no_reply@carryup.tk')

            msg.html = html

            # Active l'envoie de Message
            # mail.send(msg)

            flash('Un mail de confirmation a ete envoye dans l\'adresse email fournit lors de la creation.', 'success')

            return redirect(url_for('home.index'))

    else:

        form = FormRegister()

    pays_list = pycountry.countries

    return render_template('user/register.html', **locals())


@prefix.route('/uploads/<path:filename>')
def download_file(filename):
    link = app.config['STATIC_APPS'] + '/images/'
    return send_from_directory(link,
                               filename, as_attachment=True)
