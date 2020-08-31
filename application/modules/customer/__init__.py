from ...modules import app
from views_client import prefix
from views_cate import prefix as prefix_groupe
from api_client import prefix as api_prefix

app.register_blueprint(prefix, url_prefix='/clients')
app.register_blueprint(prefix_groupe, url_prefix='/groupe/client')
app.register_blueprint(api_prefix, url_prefix='/api/client')
