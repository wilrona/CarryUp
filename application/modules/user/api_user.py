__author__ = 'User'

from ...modules import *
from models_user import Users
from ..categorie.models_cate import Categories

prefix = Blueprint('api_user', __name__)


def make_public(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
            new_task['uri_edit'] = url_for('user.edit', data_id=data['id'], _external=True)
        else:
            new_task[field] = data[field]

        if field == 'first_name':

            new_task['display_name'] = data['first_name']

        if field == 'last_name' and data['last_name']:
            new_task['display_name'] += ' '+data['last_name']

    return new_task


def make_public_groupe(data):
    new_task = {}
    for field in data:
        if field == 'id':
            new_task['id'] = str(data['id'])
            new_task['uri_edit'] = url_for('departement.edit', data_id=data['id'], _external=True)
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
        datas = Users.objects(Q(compte=compte_id) & (Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(email__icontains=q) | Q(phone__icontains=q)))
    else:
        datas = Users.objects(compte=compte_id)

    datas = datas.skip(offset).limit(limit)

    order_by = ''
    if order == 'desc':
        order_by += '-'

    if sort is not None:
        order_by += sort
        datas.order_by(order_by)

    count = Users.objects(compte=compte_id).count() / limit

    return jsonify({'data' : [make_public(data) for data in datas], 'total_page': count, 'order': order, 'sort': sort })



@prefix.route('/groupe/<objectid:compte_id>', methods=['GET'])
def groupe(compte_id):

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
        datas = Categories.objects(Q(type_cat=1) & Q(compte=compte_id) & Q(name__icontains=q))
    else:
        datas = Categories.objects(Q(type_cat=1) & Q(compte=compte_id))

    datas = datas.skip(offset).limit(limit)

    order_by = ''
    if order == 'desc':
        order_by += '-'

    if sort is not None:
        order_by += sort
        datas.order_by(order_by)

    count = Categories.objects(Q(type_cat=1) & Q(compte=compte_id)).count() / limit

    return jsonify({'data' : [make_public_groupe(data) for data in datas], 'total_page': count, 'order': order, 'sort': sort })
