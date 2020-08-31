__author__ = 'wilrona'

from flaskext import wtf
from flaskext.wtf import validators
from application import function
from ...modules import *
import datetime
from models_mag import Magasins


def unique_name_validator(form, field):
    """ name must be unique"""
    data = Magasins.objects(
        Q(name=field.data)
    ).count()

    if form.id.data:
        data_old = Magasins.objects.get(id=str(form.id.data))
        if data_old.name != field.data and data >= 1:
            raise wtf.ValidationError("Nom de point de vente existant")
    else:
        if data >= 1 and field.data:
            raise wtf.ValidationError("Nom de point de vente existant")


class FormMag(wtf.Form):
    id = wtf.HiddenField()

    name = wtf.StringField(label='Point de vente :', validators=[validators.Required('Nom du magasin obligatoire'), unique_name_validator])
    biographic = wtf.TextAreaField(label='Bio du point de vente :')

    adresse = wtf.StringField(label='Adresse :')
    ville = wtf.StringField(label='Ville :')

    phone = wtf.StringField(label='Telephone :')
    email = wtf.StringField(label='Adresse Email :', validators=[validators.Required('Adresse courriel obligatoire'),
                                                                 validators.Email('Adresse email invalide')
                                                                 ])
