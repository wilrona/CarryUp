
from ...modules import app
from views_item import prefix
from views_cate import prefix as prefix_groupe
from api_item import prefix as api_prefix


app.register_blueprint(prefix, url_prefix='/article')
app.register_blueprint(prefix_groupe, url_prefix='/categorie/article')
app.register_blueprint(api_prefix, url_prefix='/api/article')
