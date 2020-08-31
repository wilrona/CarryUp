__author__ = 'wilrona'

from ...modules import *

class StoryReceipt(db.EmbeddedDocument):
    date_receipt = db.DateTimeField()
    quantite_recu = db.FloatField()

class LigneDoc(db.EmbeddedDocument):
    article_id = db.ReferenceField('Articles')
    variante_id = db.ReferenceField('Variantes')

    article_fini = db.ReferenceField('Articles')
    variante_fini = db.ReferenceField('Variantes')

    quantite = db.FloatField()
    prix_achat = db.FloatField()
    prix_vente = db.FloatField()
    receipt = db.IntField() # 0 en attente, 1 total, 2 partielle
    quantite_recu = db.FloatField()
    prix_achat_recu = db.FloatField()
    old_stock = db.FloatField() # ancienne valeur du stock au moment de l'ajustement de stock d'un article

    story_receipt = db.ListField(db.EmbeddedDocumentField(StoryReceipt))


class Documents(db.Document):

    reference = db.StringField()

    type_transaction = db.IntField(default=0) # 0 Bon de commande, 1 Transfert de stock, 2 ajustement de stock, 3 ticket de vente

    # Utilise pour les bons de commande 0 Brouillon, 1 en attente, 2 reception partielle, 3 Terminee, 4 Annulation
    # Utilise pour le transfert de stock  0 Brouillon, 1 en transit, 2 reception partielle, 3 Terminee
    etat = db.IntField(default=0)

    fournisseur = db.ReferenceField('Clients')
    magasin_origine = db.ReferenceField('Magasins')
    magasin_destina = db.ReferenceField('Magasins')
    compte = db.ReferenceField('Comptes')
    user = db.ReferenceField('Users')

    ligne_data = db.ListField(db.EmbeddedDocumentField(LigneDoc))
    date_bon = db.DateTimeField()
    date_prevu_bon = db.DateTimeField()

    createDate = db.DateTimeField()
    updateDate = db.DateTimeField()

    meta = {
        'ordering': ['-createDate']
    }

    def save(self, *args, **kwargs):
        if not self.createDate:
            self.createDate = datetime.datetime.now()
        self.updateDate = datetime.datetime.now()
        return super(Documents, self).save(*args, **kwargs)

    def montant_achat(self):
        total = 0
        for item in self.ligne_data:
            total += item.quantite * item.prix_achat
        return total

    def montant_vente(self):
        total = 0
        for item in self.ligne_data:
            total += item.quantite * item.prix_vente
        return total

    def story_receipt(self):
        receipt = []
        for item in self.ligne_data:
            for story in item.story_receipt:
                receipt.append(story)
        return receipt


class Ecritures(db.Document):

    quantite = db.FloatField()
    quantite_after = db.FloatField()

    prix_achat = db.FloatField()
    prix_vente = db.FloatField()

    article = db.ReferenceField('Articles')
    variante = db.ReferenceField('Variantes')
    document = db.ReferenceField('Documents')
    magasin = db.ReferenceField('Magasins')
    user = db.ReferenceField('Users')
    compte = db.ReferenceField('Comptes')

    type_ecriture = db.IntField(default=0) # 0 Sortie de stock, 1 Entree de stock, 2 Recomptage
    reason = db.StringField()

    createDate = db.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.createDate:
            self.createDate = datetime.datetime.now()
        return super(Ecritures, self).save(*args, **kwargs)
