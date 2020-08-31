__author__ = 'wilrona'

from ...modules import *

class Categories(db.Document):

    name = db.StringField()

    type_cat = db.IntField() # 0: categorie article, 1: Departement employe, 2: Groupe de client
    grpe_article = db.IntField(default=0) # 0: article, 1: matiere premiere, 2: recette

    compte = db.ReferenceField('Comptes')

    createDate = db.DateTimeField()
    updateDate = db.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.createDate:
            self.createDate = datetime.datetime.now()
        self.updateDate = datetime.datetime.now()
        return super(Categories, self).save(*args, **kwargs)
