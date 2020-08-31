# coding=utf-8


__author__ = 'wilrona'

from ...modules import *
from application import login_manager
from models_user import Users
from forms_user import FormLogin, FormUser, FormRegister
from ...token import confirm_token, generate_confirmation_token
from ..compte.models_compte import Comptes
from ..categorie.models_cate import Categories
from ..pos.models_pos import PointDeVente

prefix = Blueprint('user', __name__)
prefix_homeUser = Blueprint('home_user', __name__)


@login_manager.user_loader
def load_user(userid):
    return Users.objects(id=userid).first()


@prefix.route('/oauth2callback', methods=['POST'])
def login():
    form = FormLogin(request.form)

    if form.validate_on_submit():

        try:
            password = hashlib.sha256(form.password.data).hexdigest()
        except UnicodeEncodeError:
            flash('Adresse email ou mot de passe incorrect' 'danger')
            return redirect(url_for('home.index'))

        user_login = Users.objects(
            Q(email=form.email.data) & Q(password=password)
        ).first()

        if user_login is None:
            flash('Adresse email et mot de passe ne correspondent pas', 'danger')
            return redirect(url_for('home.index'))
        else:
            if not user_login.is_active():
                flash('Votre compte est desactive. Veuillez confirmer votre adresse email a partir de l\'email de '
                      'confirmation recu lors de votre inscription.', 'danger')
                return redirect(url_for('home.index'))

            # implementation de l'heure local
            time_zones = tzlocal()
            date_auto_nows = datetime.datetime.now(time_zones).strftime("%Y-%m-%d %H:%M:%S")

            session['user_id'] = str(user_login.id)
            user_login.logged = True
            user_login.lastLogin = function.datetime_convert(date_auto_nows)
            user_login.save()

            session['compte_id'] = str(user_login.compte.id)

            return redirect(url_for('dashboard.index'))
    else:
        flash('Adresse email ou mot de passe incorrect', 'danger')
        return redirect(url_for('home.index'))

        # return render_template('test.html', **locals())


@prefix.route('/logout')
def logout():
    change = None

    if 'user_id' in session:
        UserLogout = Users.objects.get(id=session.get('user_id'))
        UserLogout.logged = False
        change = UserLogout.save()

    if change:
        session.pop('user_id')
        session.pop('compte_id')

        flash('Deconnexion reussie avec success', 'success')

        # if 'package' in session:
        #     session.pop('package');
        # session.pop('site')

    return redirect(url_for('home.index'))


@prefix.route('/')
@login_required
def index():
    compte = Comptes.objects().get(id=session.get('compte_id'))

    datas = Users.objects(Q(compte=compte.id))

    return render_template('user/index.html', **locals())


@prefix.route('/edit/<objectid:data_id>', methods=['GET', 'POST'])
@prefix.route('/edit/', methods=['GET', 'POST'])
@login_required
def edit(data_id=None):

    if data_id:
        data = Users.objects.get(id=data_id)
        form = FormUser(obj=data)
        form.id.data = data_id

        if request.method == 'GET':
            if data.categorie:
                form.categorie.data = []
                for cat in data.categorie:
                    form.categorie.data.append(str(cat.id))

            if data.appareil:
                form.appareil.data = []
                for cat in data.appareil:
                    form.appareil.data.append(str(cat.id))

    else:
        data = Users()
        form = FormUser()

    compte = Comptes.objects().get(id=session.get('compte_id'))

    form.categorie.choices = [('', 'Aucune categorie')]

    categorie = Categories.objects(Q(type_cat=1) & Q(compte=compte))
    for choice in categorie:
        form.categorie.choices.append((str(choice.id), choice.name))

    form.appareil.choices = [('', 'Tous les magasins')]

    appareil = PointDeVente.objects(compte=compte)
    for choice in appareil:
        form.appareil.choices.append((str(choice.id), choice.name))

    if data.admin_compte and request.method == 'POST':
        del form.categorie
        del form.appareil

    if form.validate_on_submit():

        data.first_name = form.first_name.data
        data.last_name = form.last_name.data
        data.email = form.email.data
        data.phone = form.phone.data


        data.compte = compte

        new = False
        if not data.id:
            data.activated = False
            data.pin = "0000"
            new = True

        data.appareil = []
        if form.appareil and form.appareil.data:
            magasin = PointDeVente.objects().get(id=form.appareil.data)
            data.appareil.appent(magasin)

        data.categorie = []
        if form.categorie and form.categorie.data:
            categorie = Categories.objects().get(id=form.categorie.data)
            data.categorie.appent(categorie)

        data.save()

        if new:

            token = generate_confirmation_token(data.email)
            confirm_url = url_for('home_user.confirm_email', user_id=data.id, token=token, _external=True)

            # Design de l'email a faire
            html = render_template('template_mail/user/activate.html', **locals())

            msg = Message()
            msg.recipients = [data.email]
            msg.subject = data.full_name() + ', veuillez confirmer votre adresse e-mail'
            msg.sender = (data.email, 'no_reply@carryup.com')

            msg.html = html

        flash('Enregistrement avec succes.', 'success')
        return redirect(url_for('user.index'))

    list_roles = global_role

    return render_template('user/edit.html', **locals())


@prefix.route('/pin/<objectid:data_id>', methods=['POST'])
def pin(data_id):


    user = Users.objects.get(id=data_id)

    current_pin = request.json['pin']
    info = {}

    if user.pin == "0000":
        if current_pin == "0000":
            info['statut'] = 'NOK'
            info['message'] = 'Vous devez introduire un code pin different de 0000 (4 zeros).'
            info['alert'] = 'danger'
            info['alertRemove'] = 'success'
        else:
            info['statut'] = 'OK'
            info['message'] = 'Vous etes sur point de definir un nouveau code pin.'
            info['alert'] = 'success'
            info['alertRemove'] = 'danger'
    else:
        if user.pin == str(current_pin):
            info['statut'] = 'NOK'
            info['message'] = 'Veuillez saisir un mot de passe different de l\'ancien pour qu\'il soit pris en compte.'
            info['alert'] = 'danger'
            info['alertRemove'] = 'success'
        else:
            if current_pin == '0000':
                info['statut'] = 'NOK'
                info['message'] = 'Vous devez introduire un code pin different de 0000 (4 zeros).'
                info['alert'] = 'danger'
                info['alertRemove'] = 'success'
            else:
                info['statut'] = 'OK'
                info['message'] = 'Vous etes sur point de modifier votre code pin.'
                info['alert'] = 'success'
                info['alertRemove'] = 'danger'

    return jsonify(info)


@prefix.route('/save/pin/<objectid:data_id>', methods=['POST'])
def savepin(data_id):

    user = Users.objects.get(id=data_id)

    current_pin = request.json['pin']
    user.pin = current_pin
    user.save()

    info = {}
    info['statut'] = 'OK'
    info['message'] = 'Votre code pin a éte modifié avec succes. <br/> Vous avez defini  le code PIN : ' + str(
        current_pin)
    info['code'] = str(current_pin)

    return jsonify(info)


@prefix.route('/active/<objectid:data_id>', methods=['GET'])
@login_required
def active(data_id):
    user = Users.objects.get(id=data_id)

    if user.activated:
        user.activated = False
    else:
        user.activated = True

    user.save()

    flash('Modification pris en compte avec succes.', 'success')
    return redirect(url_for('user.edit', data_id=data_id))


@prefix.route('/save/role/<objectid:data_id>', methods=['POST'])
@login_required
def saverole(data_id):

    user = Users.objects.get(id=data_id)

    data = []

    if request.form.getlist('role'):

        role = []

        user.roles = []

        if user.admin_compte:
            role.append('admin')

        for item in request.form.getlist('module'):

            if item == 'panneau_admin':
                user.access_admin = True

        for item_role in request.form.getlist('role'):
            role.append(item_role)

        user.roles = role

        user.save()

        info = {}
        info['statut'] = 'OK'
        info['message'] = 'Les droits d\'acces ont ete enregistres avec succes'
        data.append(info)

    else:
        info = {}
        info['statut'] = 'NOK'
        info['message'] = 'Aucun droit d\'acces n\'a ete selectionne'
        data.append(info)

    data = json.dumps(data)

    return data


@prefix_homeUser.route('/confirm/<objectid:user_id>/<token>')
def confirm_email(user_id, token):
    token_email = confirm_token(token)
    user = Users.objects.get(id=user_id)

    if user.activated:
        flash('Votre compte est deja confirme. SVP connectez vous.', 'success')
    else:
        if user.email == token_email:
            user.activated = True

            flash('Vous avez confirmee votre compte. Merci!', 'success')
            user.save()
        else:
            flash('Le lien de confirmation est invalide ou est expiree.', 'danger')

    if user.is_authenticated():
        return redirect(url_for('home_user.unconfirmed'))
    else:
        return redirect(url_for('home.index'))


@prefix_homeUser.route('/unconfirmed')
@login_required
def unconfirmed():
    if current_user.is_active():
        return redirect('dashboard.index')

    flash('SVP confirmez votre adresse email!', 'warning')
    return render_template('user/unconfirmed.html', **locals())


@prefix_homeUser.route('/resend_confirmation')
@login_required
def resend_confirmation():
    token = generate_confirmation_token(current_user.email)
    reset = True

    confirm_url = url_for('home_user.confirm_email', user_id=current_user.id, token=token, _external=True)
    html = render_template('template_mail/user/activate.html', **locals())

    msg = Message()
    msg.recipients = [current_user.email]
    msg.subject = current_user.full_name() + ', veuillez confirmer votre adresse e-mail'
    msg.sender = (current_user.email, 'no_reply@ici.cm')

    msg.html = html
    mail.send(msg)

    flash('Un nouveau message de confirmation a ete envoye.', 'success')
    return redirect(url_for('home_user.unconfirmed'))

# @prefix_param.route('/view/<objectid:user_id>', methods=['GET'])
# def view(user_id):
#
#     if request.args.get('internaute'):
#         title_page = 'Internautes'
#     else:
#         title_page = 'Utilisateurs'
#
#     data = Users.objects.get(id=user_id)
#     form = FormUser(obj=data)
#
#     if data.user == 2:
#         # liste des roles lie a l'utiliasteur en cours
#         attrib_list = [role.role_id.id for role in data.roles]
#
#         # liste des roles lie a l'utiliasteur en cours avec le droit d'edition
#         edit_list = [role.role_id.id for role in data.roles if role.edit == True]
#
#         # liste des roles lie a l'utiliasteur en cours avec le droit de suppression
#         delete_list = [role.role_id.id for role in data.roles if role.deleted == True]
#
#         liste_role = []
#         data_role = Roles.objects(
#             valeur__ne='super_admin'
#         )
#
#         for role in data_role:
#             if not role.parent:
#                 module = {}
#                 module['titre'] = role.titre
#                 module['id'] = role.id
#                 enfants = Roles.objects(
#                     parent = role.id
#                 )
#                 module['role'] = []
#                 for enfant in enfants:
#                     rol = {}
#                     rol['id'] = enfant.id
#                     rol['titre'] = enfant.titre
#                     rol['action'] = enfant.action
#                     module['role'].append(rol)
#                 liste_role.append(module)
#
#     if data.user == 1:
#
#         date_start = datetime.date.today().replace(day=1)
#
#         date_end = datetime.date.today()
#
#     return render_template('user/view.html', **locals())


# @prefix_param.route('/set_ref')
# def set_ref():
#
#     count_user = Users.objects(user=True).order_by('createDate')
#     count = 1
#     for user in count_user:
#         user.ref = function.reference(count=count, caractere=4, user=True, refuser=None)
#         user.save()
#         count += 1
#
#     return 'True'


# @prefix_param.route('/permission/<objectid:user_id>', methods=['GET', 'POST'])
# @login_required
# @roles_required([('super_admin', 'user_permission')])
# def permission(user_id):
#     menu = 'user'
#     submenu = 'users'
#     context = 'permission'
#     title_page = 'Parametre - Utilisateurs'
#
#     user = Users.objects.get(id=user_id)
#
#     # liste des roles lie a l'utiliasteur en cours
#     attrib = UserRole.objects(
#         user_id = user.id
#     )
#     attrib_list = [role.role_id.id for role in attrib]
#
#     # liste des roles lie a l'utiliasteur en cours avec le droit d'edition
#     edit = UserRole.objects(Q(user_id=user.id) & Q(edit=True))
#     edit_list = [role.role_id.id for role in edit]
#
#     # liste des roles lie a l'utiliasteur en cours avec le droit de suppression
#     delete = UserRole.objects(Q(user_id=user.id) & Q(deleted=True))
#     delete_list = [role.role_id.id for role in delete]
#
#
#     liste_role = []
#     data_role = Roles.objects(
#         valeur__ne='super_admin'
#     )
#
#     for role in data_role:
#         if not role.parent:
#             module = {}
#             module['titre'] = role.titre
#             module['id'] = role.id
#             enfants = Roles.objects(
#                 parent = role.id
#             )
#             module['role'] = []
#             for enfant in enfants:
#                 rol = {}
#                 rol['id'] = enfant.id
#                 rol['titre'] = enfant.titre
#                 rol['action'] = enfant.action
#                 module['role'].append(rol)
#             liste_role.append(module)
#
#     # liste des profils de l'application
#     list_profil = Profil.objects(
#         active=True
#     )
#
#     profil_select = None
#     if request.args.get('profil') and request.method == 'GET':
#
#         profil_select = int(request.args.get('profil'))
#         profil_request = Profil.objects.get(id=request.args.get('profil'))
#
#         attrib = ProfilRole.objects(
#             profil_id= profil_request.id
#         )
#
#         attrib_list = [role.role_id.id for role in attrib]
#
#         # liste des roles lie a l'utiliasteur en cours avec le droit d'edition
#         edit = ProfilRole.objects(Q(profil_id=profil_request) & Q(edit=True))
#         edit_list = [role.role_id.id for role in edit]
#
#         # liste des roles lie a l'utiliasteur en cours avec le droit de suppression
#         delete = ProfilRole.objects(Q(profil_id=profil_request.id) & Q(deleted=True))
#         delete_list = [role.role_id.id for role in delete]
#
#
#     if request.method == 'POST' and current_user.has_roles([('super_admin', 'user_permission')], ['edit']):
#
#         form_attrib = request.form.getlist('attrib')
#
#         # if not form_attrib and attrib_list:
#         #     flash('Les utilisateurs ne doivent pas exister sans permission dans l\'application', 'warning')
#         #     return redirect(url_for('user_param.permission', user_id=user_id))
#         # elif form_attrib:
#         #     user.is_enabled = True
#         #     user.put()
#
#         form_edit = request.form.getlist('edit')
#         form_delete = request.form.getlist('delete')
#
#         # liste des roles lie au profil et supprimer ce qui ne sont plus attribue
#         current_profil_role = UserRole.objects(
#             user_id = user.id
#         )
#         for current in current_profil_role:
#             if current.role_id.id not in form_attrib:
#                 current.delete()
#
#         # Insertion des roles et authorisation en provenance du formulaire
#         for attrib in form_attrib:
#
#             role_form = Roles.objects.get(id=attrib)
#
#             profil_role_exist = UserRole.objects(Q(role_id=role_form.id) & Q(user_id=user.id)).first()
#
#             if profil_role_exist:
#                 if attrib in form_edit:
#                     profil_role_exist.edit = True
#                 else:
#                     profil_role_exist.edit = False
#
#                 if attrib in form_delete:
#                     profil_role_exist.deleted = True
#                 else:
#                     profil_role_exist.deleted = False
#
#                 profil_role_exist.save()
#             else:
#                 profil_role_create = UserRole()
#                 profil_role_create.role_id = role_form
#                 profil_role_create.user_id = user
#                 if attrib in form_edit:
#                     profil_role_create.edit = True
#                 else:
#                     profil_role_create.edit = False
#
#                 if attrib in form_delete:
#                     profil_role_create.deleted = True
#                 else:
#                     profil_role_create.deleted = False
#
#                 profil_role_create.save()
#
#         flash('Enregistement effectue avec succes', 'success')
#         return redirect(url_for('user_param.permission', user_id=user_id))
#
#     return render_template('user/permission.html', **locals())
