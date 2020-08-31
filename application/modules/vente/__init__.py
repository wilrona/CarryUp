
from ...modules import app
from views_vente import prefix
from api_vente import prefix as api_prefix

app.register_blueprint(prefix, url_prefix='/vente/vente')
app.register_blueprint(api_prefix, url_prefix='/api/vente')
