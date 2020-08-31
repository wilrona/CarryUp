__author__ = 'wilrona'

from flaskext import wtf
from flaskext.wtf import validators
from application import function
from ...modules import *
import datetime
from models_pos import PointDeVente


def unique_name_validator(form, field):
    """ name must be unique"""
    data = PointDeVente.objects(
        Q(name=field.data)
    ).count()
    if form.id.data :
        data_old = PointDeVente.objects.get(id=str(form.id.data))
        if data_old.name != field.data and data >= 1:
            raise wtf.ValidationError("Nom appareil existant")
    else:
        if data >= 1 and field.data :
            raise wtf.ValidationError("Nom appareil existant")


class FormPos(wtf.Form):
    id = wtf.HiddenField()

    name = wtf.StringField(label='Nom appareil :', validators=[validators.Required('Nom obligatoire'), unique_name_validator])
    magasin = wtf.SelectField(label='Point de vente :', coerce=str, validators=[validators.Required(message='Point de vente obligatoire')])
