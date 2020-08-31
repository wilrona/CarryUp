__author__ = 'wilrona'

from ...modules import *


class VarianteMagasin(db.EmbeddedDocument):
    mag_id = db.ReferenceField('Magasins')
    stock = db.FloatField(default=0)
    stock_alert = db.FloatField(default=0)
    alert = db.BooleanField(default=False)
    prix_vente = db.FloatField()
    active = db.BooleanField(default=True)
    alonePrice = db.BooleanField(default=False)
    show = db.BooleanField(default=True)


class Variantes(db.Document):
    name = db.StringField()
    # elle prend la valeur du cout unitaire de conditionnement quand c'est une matiere premiere
    prix_vente = db.FloatField(default=0)
    base = db.BooleanField(default=False)
    magasins = db.ListField(db.EmbeddedDocumentField(VarianteMagasin))
    article_id = db.ReferenceField('Articles')

    def stock_active(self):
        stock = 0.0
        for mag in self.magasins:
            if mag.active:
                stock += mag.stock
        return stock

    def stock_magasin(self, magasin_id):

        from ..magasin.models_mag import Magasins

        stock = 0.0
        magasin = Magasins.objects.get(id=magasin_id)
        for mag in self.magasins:
            if mag.mag_id == magasin:
                stock += mag.stock
        return stock

    def show_magasin(self, magasin_id):

        from ..magasin.models_mag import Magasins

        show = False
        magasin = Magasins.objects.get(id=magasin_id)
        for mag in self.magasins:
            if mag.show and mag.mag_id == magasin:
                show = True
        return show

    def prixVente(self, magasin_id=None):

        from ..magasin.models_mag import Magasins

        prix_vente = self.prix_vente

        if magasin_id:
            magasin = Magasins.objects.get(id=magasin_id)
            for mag in self.magasins:
                if mag.mag_id == magasin and mag.alonePrice:
                    prix_vente = mag.prix_vente

        return prix_vente

    def stock_magasin_active(self, magasin_id):

        from ..magasin.models_mag import Magasins

        stock = 0.0
        magasin = Magasins.objects.get(id=magasin_id)
        for mag in self.magasins:
            if mag.mag_id == magasin and mag.active:
                stock += mag.stock
        return stock

    def MagVariante(self):
        data = []
        for mag in self.magasins:
            if mag.active:
                data.append(mag.mag_id.id)
        return data

    def AllMagVariante(self):
        data = []
        for mag in self.magasins:
            data.append(mag.mag_id.id)
        return data

    def MagVarianteID(self):
        data = []
        for mag in self.magasins:
            if mag.active:
                data.append(str(mag.mag_id.id))
        return data

    def allPrice(self):
        data = []
        data.append(self.prix_vente)
        for prix in self.magasins:
            if prix.alonePrice is True:
                data.append(prix.prix_vente)
        return data


class ArticleCompose(db.EmbeddedDocument):
    article_id = db.ReferenceField('Articles')
    variante_id = db.ReferenceField('Variantes')
    quantite = db.FloatField(default=0)
    prix_achat = db.FloatField()


class PrixCompose(db.EmbeddedDocument):
    prix_vente = db.FloatField()
    magasin = db.ReferenceField('Magasins')


class Articles(db.Document):
    name = db.StringField()
    description = db.StringField()

    prix_achat = db.FloatField(default=0)

    compte = db.ReferenceField('Comptes')

    categorie = db.ReferenceField('Categories')
    magasins = db.ListField(db.ReferenceField('Magasins'))

    type_article = db.IntField(default=0)  # 0 article, 1 produit compose
    a_vendre = db.IntField(default=0)  # 0 pas a vendre, 1 a vendre

    variantes = db.ListField(db.ReferenceField(Variantes))

    createDate = db.DateTimeField()
    updateDate = db.DateTimeField()

    # Cette valeur correspond au produit constituant le produit compose
    produit_compose = db.ListField(db.EmbeddedDocumentField(ArticleCompose))
    prix_compose =  db.ListField(db.EmbeddedDocumentField(PrixCompose))
    prix_vente = db.FloatField()

    meta = {
        'ordering': ['name']
    }

    def save(self, *args, **kwargs):
        if not self.createDate:
            self.createDate = datetime.datetime.now()
        self.updateDate = datetime.datetime.now()
        return super(Articles, self).save(*args, **kwargs)

    def stock_active(self):
        stock = 0.0
        for variante in self.variantes:
            stock += variante.stock_active()
        return stock

    def magasin_active(self):
        data = []
        for variante in self.variantes:
            for mag in variante.MagVariante():
                if mag not in data:
                    data.append(mag)
        return data

    def AllMagasin(self):
        data = []
        for variante in self.variantes:
            for mag in variante.AllMagVariante():
                if mag not in data:
                    data.append(mag)
        return data

    def allPrice(self):
        data = []
        for prix in self.variantes:
            for price in prix.allPrice():
                data.append(price)
        data = (list(set(data)))  # valeur unique dans le tableau
        if len(data) > 1:
            data = sorted(data)  # classer le tableau par ordre croissant

        valeur = ''
        if len(data) > 1:
            valeur += '' + str(min(data))
            valeur += ' - ' + str(max(data))
        else:
            for i in data:
                valeur += str(i)
        return valeur
