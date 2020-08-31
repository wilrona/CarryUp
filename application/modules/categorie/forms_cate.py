__author__ = 'wilrona'

from flaskext import wtf
from flaskext.wtf import validators
from application import function
from ...modules import *
import datetime
from models_cate import Categories
from flaskext.wtf.html5 import NumberInput


def unique_name_validator(form, field):
    """ name must be unique"""
    data = Categories.objects(
        Q(name=field.data) & Q(type_cat=form.type_cat.data)
    ).count()

    if form.id.data:
        mag_old = Categories.objects.get(id=str(form.id.data))
        if mag_old.name != field.data and data >= 1:
            raise wtf.ValidationError("Nom deja utilise")
    else:
        if data >= 1 and field.data:
            raise wtf.ValidationError("Nom deja utilise")


class FormCat(wtf.Form):
    id = wtf.HiddenField()
    type_cat = wtf.HiddenField()

    name = wtf.StringField(label='Nom :', validators=[validators.Required('Nom obligatoire'), unique_name_validator])
