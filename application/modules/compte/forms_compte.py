__author__ = 'wilrona'

from flaskext import wtf
from flaskext.wtf import validators
from application import function
from ...modules import *
import datetime
from models_compte import Comptes


def unique_email_validator(form, field):
    """ email must be unique"""
    user_manager = Comptes.objects(
        Q(notification_email=field.data)
    ).count()

    if form.id.data:
        mag_old = Comptes.objects.get(id=str(form.id.data))
        if mag_old.notification_email != field.data and user_manager >= 1:
            raise wtf.ValidationError("Email deja utilise dans un compte")
    else:
        if user_manager >= 1:
            raise wtf.ValidationError("Email deja utilise dans un compte")


class FormCompte(wtf.Form):
    id = wtf.HiddenField()
    nameCompagny = wtf.StringField(label='Nom Entreprise :', validators=[validators.Required('Nom de l\'entreprise obligatoire')])
    notification_email = wtf.StringField(label='Adresse Email :', validators=[validators.Required('Information obligatoire'),
                                                                 validators.Email('Adresse email invalide'),
                                                                 unique_email_validator])
    phone = wtf.StringField(label='Telephone :', validators=[validators.Required('Information du telephone obligatoire')])
    pays = wtf.StringField(label='Pays :', validators=[validators.Required('Information du pays obligatoire')])
    ville = wtf.StringField(label='Ville :', validators=[validators.Required('Information de la ville obligatoire')])
    adresse_un = wtf.StringField(label='Adresse 1 :')
    adresse_deux = wtf.StringField(label='Adresse 2 :')

    siteweb = wtf.StringField(label='Site Web :')
    facebook_link = wtf.StringField(label='Lien Facebook :')
    twitter_link = wtf.StringField(label='Lien twitter :')
    instagramm = wtf.StringField(label='Lien instagramm :')
    devise = wtf.StringField(label='Devise :')