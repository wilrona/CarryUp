__author__ = 'wilrona'

from flaskext import wtf
from flaskext.wtf import validators
from application import function
from ...modules import *
import datetime
from models_client import Clients


def unique_email_validator(form, field):
    """ name must be unique"""

    user_email = Clients.objects(
        Q(email=field.data) & Q(type_client=form.type_client.data)
    ).count()

    if form.id.data:
        user_manager = Clients.objects().get(id=form.id.data)

        if field.data != user_manager.email and user_email >= 1:
            raise wtf.ValidationError("Adresse Courriel existant")
    else:
        if user_email >= 1 and field.data:
            raise wtf.ValidationError("Adresse Courriel existant")


def unique_name_validator(form, field):
    """ name must be unique"""
    data = Clients.objects(
        Q(display_name=field.data) & Q(type_client=form.type_client.data)
    ).count()

    if form.id.data:
        data_old = Clients.objects.get(id=str(form.id.data))
        if data_old.display_name != field.data and data >= 1:
            if int(form.type_client.data) == 1:
                raise wtf.ValidationError("Nom du fournisseur existant")
            else:
                raise wtf.ValidationError("Nom de client existant")
    else:
        if data >= 1:
            if int(form.type_client.data) == 1:
                raise wtf.ValidationError("Nom du fournisseur existant")
            else:
                raise wtf.ValidationError("Nom de client existant")


class FormClient(wtf.Form):
    id = wtf.HiddenField()
    type_client = wtf.HiddenField()

    display_name = wtf.StringField(label='Nom du client :', validators=[validators.Required('Nom obligatoire'), unique_name_validator])

    email = wtf.StringField(label='Adresse Courriel :', validators=[validators.email('Adresse courriel invalide'), unique_email_validator])
    phone = wtf.StringField(label='Telephone :')

    entreprise = wtf.StringField(label='Societe :')

    ville = wtf.StringField(label='Villes :')
    quartier = wtf.StringField(label='Quartier :')

    categorie = wtf.SelectMultipleField(label='Groupes :', coerce=str)

    note = wtf.TextAreaField(label='Notes :')
