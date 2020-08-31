
from ...modules import app
from views_compte import prefix

app.register_blueprint(prefix, url_prefix='/parametre')
