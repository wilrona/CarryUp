
from ...modules import app
from views_pos import prefix
from api_pos import prefix as api_prefix

app.register_blueprint(prefix, url_prefix='/parametre/appareil')
app.register_blueprint(api_prefix, url_prefix='/api/appareil')
