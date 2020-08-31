__author__ = 'wilrona'

from ...modules import *


class Clients(db.Document):

    entreprise = db.StringField()

    ref = db.StringField()
    display_name = db.StringField()

    email = db.StringField()
    phone = db.StringField()

    ville = db.StringField()
    quartier = db.StringField()

    type_source = db.IntField(default=0)  # 0 creation; 1 a la commande; 2 importation
    type_client = db.IntField(default=0)  # 0 Client; 1 Fournisseurs

    categorie = db.ListField(db.ReferenceField('Categories'))

    note = db.StringField()

    compte = db.ReferenceField('Comptes')

    createDate = db.DateTimeField()
    updateDate = db.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.createDate:
            self.createDate = datetime.datetime.now()
        self.updateDate = datetime.datetime.now()
        return super(Clients, self).save(*args, **kwargs)
