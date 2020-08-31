__author__ = 'wilrona'

from ...modules import *

class Users(db.Document):

    first_name = db.StringField()
    last_name = db.StringField()
    
    email = db.StringField()
    phone = db.StringField()

    password = db.StringField()
    pin = db.StringField()

    registerDate = db.DateTimeField()
    token_confirmation = db.StringField()
    activated = db.BooleanField(default=True)

    logged = db.BooleanField()
    lastLogin = db.DateTimeField()

    picture = db.StringField()

    source = db.StringField()
    roles = db.ListField(db.StringField())

    admin_compte = db.BooleanField(default=False)
    access_admin = db.BooleanField(default=False)
    access_pdv = db.BooleanField(default=False)

    compte = db.ReferenceField('Comptes')
    categorie = db.ListField(db.ReferenceField('Categories'))
    appareil = db.ListField(db.ReferenceField('PointDeVente'))

    # idcompagnie = db.ListField(db.ReferenceField('Compagnie'))

    def save(self, *args, **kwargs):
        if not self.registerDate:
            self.registerDate = datetime.datetime.now()
        return super(Users, self).save(*args, **kwargs)

    def is_active(self):
        return self.activated

    def is_authenticated(self):
        return self.logged

    def is_anonymous(self):
        return False

    def full_name(self):
        full_name = u'' + unicode(self.first_name)
        if self.last_name:
            full_name += u' ' + unicode(self.last_name) + u''
        return full_name

    def has_roles(self, requirements):

        user_roles = [role for role in self.roles]

        # has_role() accepts a list of requirements
        for requirement in requirements:
            if isinstance(requirement, (list, tuple)):
                # this is a tuple_of_role_names requirement
                tuple_of_role_names = requirement
                authorized = False
                for role_name in tuple_of_role_names:
                    if role_name in user_roles:
                        # tuple_of_role_names requirement was met: break out of loop
                        authorized = True
                        break

                if not authorized:
                    return False  # tuple_of_role_names requirement failed: return False
                else:
                    return True
            else:
                # this is a role_name requirement
                role_name = requirement

                # the user must have this role
                if not role_name in user_roles:
                    return False  # role_name requirement failed: return False

        # All requirements have been met: return True
        return True
