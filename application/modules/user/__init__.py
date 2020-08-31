__author__ = 'wilrona'

from ...modules import app
from views_user import prefix, prefix_homeUser
from api_user import prefix as api_prefix
from views_cate import prefix as prefix_departement

app.register_blueprint(prefix, url_prefix='/user')
app.register_blueprint(prefix_homeUser, url_prefix='/confirmation')
app.register_blueprint(api_prefix, url_prefix='/api/user')
app.register_blueprint(prefix_departement, url_prefix='/departement')
