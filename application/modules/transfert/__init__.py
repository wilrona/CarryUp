
from ...modules import app
from views_trans import prefix
from api_trans import prefix as api_prefix

app.register_blueprint(prefix, url_prefix='/stock/transfert')
app.register_blueprint(api_prefix, url_prefix='/api/transfert')
