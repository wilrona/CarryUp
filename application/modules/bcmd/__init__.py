
from ...modules import app
from views_bcmd import prefix
from api_bcmd import prefix as api_prefix

app.register_blueprint(prefix, url_prefix='/stock/achat')
app.register_blueprint(api_prefix, url_prefix='/api/achat')
