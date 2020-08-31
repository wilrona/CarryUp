__author__ = 'wilrona'

from flaskext import wtf
from flaskext.wtf import validators
from application import function
from ...modules import *
import datetime
from models_user import Users


def unique_email_validator(form, field):
    """ email must be unique"""
    user_manager = Users.objects(
        Q(email=field.data)
    ).count()
    if user_manager >= 1 and not form.id.data:
        raise wtf.ValidationError("Email deja utilise par un autre utilisateur")


def unique_email_validator_2(form, field):
    """ name must be unique"""
    data = Users.objects(
        Q(email=field.data)
    ).count()

    if form.id.data:
        data_old = Users.objects.get(id=str(form.id.data))
        if data_old.email != field.data and data >= 1:
            raise wtf.ValidationError("Adresse Email existante")
    else:
        if data >= 1:
            raise wtf.ValidationError("Adresse Email existante")


def password_validator(form, field):
    """ Password must have one lowercase letter, one uppercase letter and one digit."""
    # Convert string to list of characters
    password = list(field.data)
    password_length = len(password)

    # Count lowercase, uppercase and numbers
    lowers = uppers = digits = 0
    for ch in password:
        # if ch.islower(): lowers+=1
        if ch.isupper(): uppers += 1
        if ch.isdigit(): digits += 1

    # Password must have one lowercase letter, one uppercase letter and one digit
    is_valid = password_length >= 6 and uppers and digits
    if not is_valid:
        raise wtf.ValidationError(
            'Le mot de passe doit avoir plus de 6 caracteres avec une lettre minuscule, une lettre majuscule et un chiffre.')


class FormLogin(wtf.Form):
    email = wtf.StringField(label='Adresse Email', validators=[validators.Email('Adresse Email invalide'),
                                                                 validators.Required('Information obligatoire')])
    password = wtf.PasswordField(label='Mot de passe',
                                 validators=[validators.Required('Information obligatoire'), password_validator])


#
# def error_phone(form, field):
#     if not form.mobile.data and not field.data:
#         raise wtf.ValidationError('Le telephone ou le mobile, l\'un deux doit etre renseigne')

class FormRegister(wtf.Form):
    id = wtf.HiddenField()
    name = wtf.StringField(label='Nom Entreprise', validators=[validators.Required('Nom de l\'entreprise obligatoire')])
    email = wtf.StringField(label='Adresse Email', validators=[validators.Required('Information obligatoire'),
                                                                 validators.Email('Adresse email invalide'),
                                                                 unique_email_validator])

    password = wtf.PasswordField(label='Mot de passe',
                                 validators=[validators.Required('Mot de passe obligatoire'), password_validator])
    retype_password = wtf.PasswordField(label='Confirmation du mot de passe', validators=[
        validators.EqualTo('password', message='Les deux mots de passe sont differents')])

    phone = wtf.StringField(label='Telephone', validators=[validators.Required('Information du telephone obligatoire')])
    pays = wtf.StringField(label='Pays', validators=[validators.Required('Information du pays obligatoire')])
    ville = wtf.StringField(label='Ville', validators=[validators.Required('Information de la ville obligatoire')])
    adresse_un = wtf.StringField(label='Adresse 1')
    adresse_deux = wtf.StringField(label='Adresse 2')


class FormPassword(wtf.Form):
    password = wtf.PasswordField(label='Mot de passe', validators=[validators.Required('Information obligatoire'), password_validator])
    retype_password = wtf.PasswordField(label='Confirmation du mot de passe', validators=[validators.EqualTo('password', message='Les deux mots de passe sont differents')])


class FormUser(wtf.Form):
    id = wtf.HiddenField()
    first_name = wtf.StringField(label='Nom', validators=[validators.Required('Information obligatoire')])
    last_name = wtf.StringField(label='Prenom')
    email = wtf.StringField(label='Adresse Email', validators=[validators.Email('Adresse email invalide'),
                                                               validators.Required('Information obligatoire'),
                                                               unique_email_validator_2])
    phone = wtf.StringField(label='Telephone')
    appareil = wtf.SelectMultipleField(label='Appareil', coerce=str)
    categorie = wtf.SelectMultipleField(label='Departement', coerce=str)

# formulaire pour le taux horaire
# def control_pass_date(form, field):
#     date = function.datetime_convert(field.data)
#     if datetime.datetime.today() > date:
#         raise wtf.ValidationError('Appliquez les taux horaires sur une date futur ou actuelle.')
