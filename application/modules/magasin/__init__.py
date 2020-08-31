
from ...modules import app
from views_mag import prefix
from api_mag import prefix as api_prefix

app.register_blueprint(prefix, url_prefix='/parametre/pdv')
app.register_blueprint(api_prefix, url_prefix='/api/pdv')
