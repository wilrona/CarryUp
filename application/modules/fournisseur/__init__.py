from ...modules import app
from views_four import prefix
from api_four import prefix as api_prefix

app.register_blueprint(prefix, url_prefix='/stock/fournisseur')
app.register_blueprint(api_prefix, url_prefix='/api/fournisseur')
