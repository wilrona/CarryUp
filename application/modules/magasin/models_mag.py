__author__ = 'wilrona'

from ...modules import *


class Magasins(db.Document):

    name = db.StringField()

    biographic = db.StringField()
    adresse = db.StringField()
    phone = db.StringField()
    ville = db.StringField()
    email = db.StringField()

    compte = db.ReferenceField('Comptes')

    principal = db.BooleanField(default=False)

    pos = db.ListField(db.ReferenceField('PointDeVente'))

    createDate = db.DateTimeField()
    updateDate = db.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.createDate:
            self.createDate = datetime.datetime.now()
        self.updateDate = datetime.datetime.now()
        return super(Magasins, self).save(*args, **kwargs)

    def count_pdv(self):
        from ..pos.models_pos import PointDeVente

        count = PointDeVente.objects(magasin=self.id).count()

        return count

