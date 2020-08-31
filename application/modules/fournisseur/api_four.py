__author__ = 'User'

from ...modules import *
from ..customer.models_client import Clients

prefix = Blueprint('api_four', __name__)

def make_public(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
            new_task['uri_edit'] = url_for('four.edit', data_id=data['id'], _external=True)
        else:
            new_task[field] = data[field]

    return new_task

@prefix.route('/<objectid:compte_id>', methods=['GET'])
def index(compte_id):

    sort = request.args.get('sort')
    order = request.args.get('order')

    q = str(request.args.get('q'))
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1

    offset = 0
    limit = 10

    if request.args.get('per'):
        limit = int(request.args.get('per'))

    if page > 1:
        offset = ((page - 1) * limit)

    if q is not None:
        datas = Clients.objects(Q(type_client=1) & Q(compte=compte_id) & (Q(display_name__icontains=q) | Q(email__icontains=q) | Q(phone__icontains=q)))
    else:
        datas = Clients.objects(Q(type_client=1) & Q(compte=compte_id))

    datas = datas.skip(offset).limit(limit)

    order_by = ''
    if order == 'desc':
        order_by += '-'

    if sort is not None:
        order_by += sort
        datas.order_by(order_by)

    count = Clients.objects(Q(type_client=1) & Q(compte=compte_id)).count() / limit

    return jsonify({'data' : [make_public(data) for data in datas], 'total_page': count, 'order': order, 'sort': sort })
