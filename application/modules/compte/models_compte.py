__author__ = 'wilrona'

from ...modules import *

class Comptes(db.Document):
    nameCompagny = db.StringField()

    notification_email = db.StringField()

    adresse_un = db.StringField()
    adresse_deux = db.StringField()
    ville = db.StringField()
    phone = db.StringField()
    pays = db.StringField()


    siteweb = db.StringField()
    facebook_link = db.StringField()
    twitter_link = db.StringField()
    instagramm = db.StringField()
    devise = db.StringField()

    createDate = db.DateTimeField()
    updateDate = db.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.createDate:
            self.createDate = datetime.datetime.now()
        self.updateDate = datetime.datetime.now()
        return super(Comptes, self).save(*args, **kwargs)
