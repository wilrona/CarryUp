
from ...modules import app
from views_cate import prefix

app.register_blueprint(prefix, url_prefix='/parametre/categorie')
