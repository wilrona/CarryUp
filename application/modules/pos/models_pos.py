__author__ = 'wilrona'

from ...modules import *


class PointDeVente(db.Document):

    name = db.StringField()

    compte = db.ReferenceField('Comptes')
    magasin = db.ReferenceField('Magasins')

    active = db.BooleanField(default=True)

    principal = db.BooleanField(default=False)

    createDate = db.DateTimeField()
    updateDate = db.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.createDate:
            self.createDate = datetime.datetime.now()
        self.updateDate = datetime.datetime.now()
        return super(PointDeVente, self).save(*args, **kwargs)
