
from ...modules import app
from views_ajust import prefix
from api_ajust import prefix as api_prefix

app.register_blueprint(prefix, url_prefix='/stock/ajustement')
app.register_blueprint(api_prefix, url_prefix='/api/ajustement')
