__author__ = 'wilrona'

from flaskext import wtf
from flaskext.wtf import validators
from application import function
from ...modules import *
import datetime
from ..magasin.models_mag import Magasins
from ..compte.models_compte import Comptes
from flaskext.wtf.html5 import NumberInput

choice = [
    ('', 'Choix du motif d\'ajustement'),
    ('0', 'Stock Recu'), # 0 a 999999999999
    ('1', 'Recomptage'), # 0 a 999999999999
    ('2', 'Dommage'), # -999999999999 a 0
    ('3', 'Vol'), # -999999999999 a 0
    ('4', 'Perte'), # -999999999999 a 0
    ('5', 'Don') # -999999999999 a 0
]

def magasin_validator(form, field):
    compte = Comptes.objects.get(id=session.get('compte_id'))
    if Magasins.objects(compte=compte).count() > 1 and not field.data:
        raise wtf.ValidationError("Nom de magasin obligatoire")

def diff_magasin_validator(form, field):
    if form.magasin_origine.data and field.data:
        if form.magasin_origine.data == field.data:
            raise wtf.ValidationError("Le magasin de destionation doit etre different du magasin d'origine")

def valid_ligne_data(form, field):
    json_data = str(field.data)
    ligne = json.loads(json_data)
    if len(ligne) == 0:
        raise wtf.ValidationError("Le document doit avoir au moin une ligne d'article.")


class FormBon(wtf.Form):
    id = wtf.HiddenField()
    ligne_data = wtf.HiddenField(validators=[valid_ligne_data])

    date_bon = wtf.DateField(label='Date du bon :', format="%d/%m/%Y", validators=[validators.Required('Date du bon de commande obligatoire')])
    date_prevu_bon = wtf.DateField(label='Date prevu :', format="%d/%m/%Y", validators=(validators.Optional(), ))

    magasin_origine = wtf.SelectField(label='Magasin :', coerce=str, validators=[validators.Required('Magasin d\'origine obligatoire')])
    fournisseur = wtf.SelectField(label='Fournisseur :', coerce=str, validators=[validators.Required(message='Fournisseur obligatoire')])


class FormTransfert(wtf.Form):
    id = wtf.HiddenField()
    ligne_data = wtf.HiddenField(validators=[valid_ligne_data])

    date_bon = wtf.DateField(label='Date du transfert :', format="%d/%m/%Y", validators=[validators.Required('Date du transfert obligatoire')])

    magasin_origine = wtf.SelectField(label='Magasin d\'origine :', coerce=str, validators=[validators.Required('Magasin d\'origine obligatoire')])
    magasin_destina = wtf.SelectField(label='Magasin de destination :', coerce=str, validators=[validators.Required('Magasin de destination 0bligatoire')])

class FormAjustement(wtf.Form):
    id = wtf.HiddenField()
    ligne_data = wtf.HiddenField(validators=[valid_ligne_data])

    date_bon = wtf.DateField(label='Date :', format="%d/%m/%Y", validators=[validators.Required('Date obligatoire')])

    magasin_origine = wtf.SelectField(label='Magasin :', coerce=str, validators=[validators.Required('Magasin obligatoire')])
    etat = wtf.SelectField(label='Motif d\'ajustement :', coerce=str, choices=choice, validators=[validators.Required('Motif d\'ajustement obligatoire')])

class FormVente(wtf.Form):
    id = wtf.HiddenField()
    ligne_data = wtf.HiddenField(validators=[valid_ligne_data])

    date_bon = wtf.DateField(label='Date vente :', format="%d/%m/%Y", validators=[validators.Required('Date de la vente obligatoire')])

    magasin_origine = wtf.SelectField(label='PDV de la vente :', coerce=str, validators=[validators.Required('PDV Obligatoire')])
