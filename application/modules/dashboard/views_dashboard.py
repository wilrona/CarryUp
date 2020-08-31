__author__ = 'User'

from ...modules import *
from ..user.models_user import Users

prefix = Blueprint('dashboard', __name__)


@prefix.route('/')
@login_required
def index():
    return render_template('dashboard/index.html', **locals())
