__author__ = 'wilrona'

from flaskext import wtf
from flaskext.wtf import validators
from application import function
from ...modules import *
import datetime
from models_item import Articles
from flaskext.wtf.html5 import NumberInput


def unique_name_validator(form, field):
    """ name must be unique"""
    mag = Articles.objects(
        Q(name=field.data) & Q(type_article=form.type_article.data)
    ).count()

    if form.id.data:
        mag_old = Articles.objects.get(id=str(form.id.data))
        if mag_old.name != field.data and mag >= 1:
            raise wtf.ValidationError("Nom existant")
    else:
        if mag >= 1:
            raise wtf.ValidationError("Nom existant")


def valid_matiere(form, field):
    if field.data :
        json_data = str(field.data)
        produit_compose = json.loads(json_data)
        if len(produit_compose) == 0 and form.type_article.data == 1:
            raise wtf.ValidationError("Le produit compose doit avoir au moins un article associe")


class FormItem(wtf.Form):
    id = wtf.HiddenField()
    variantes = wtf.HiddenField()
    produit_compose = wtf.HiddenField(validators=[valid_matiere])

    name = wtf.StringField(label='Nom ', validators=[validators.Required('Nom obligatoire'), unique_name_validator])

    description = wtf.TextAreaField(label='Description')

    prix_achat = wtf.StringField(label='Prix d\'achat', default=0)

    a_vendre = wtf.BooleanField(label='Produit a vendre')
    type_article = wtf.BooleanField(label='Produit Compose')

    categorie = wtf.SelectField(label='Categorie', coerce=str)

    magasin = wtf.SelectMultipleField(label='Point de vente', coerce=str)
