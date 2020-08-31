
import stores from '../stores/index.js';

const { observer, Provider, inject } = mobxReact;

const LikeButton = inject("contacts")(
    observer(
        class LikeButton extends React.Component {
            header = [
                {
                    index: 'id',
                    name: '#'
                },
                {
                    index: 'name',
                    name: 'Nom'
                },
                {
                    index: 'description',
                    name: ''
                },
                {
                    index: 'genre',
                    name: 'Genre'
                }
            ];

            componentWillMount(){

                this.setState({
                    liked: false
                });

            }

            render() {

                if (this.state.liked) {
                    return 'You liked this.';
                }

                return (
                    <div>
                        <button className='btn btn-primary' onClick={() => { this.setState({ liked: true })}}>
                            LIKE
                        </button>
                        <table>
                            <thead>
                                <tr>
                                    {this.header.map(head =>

                                        <th>{head.name ? head.name : head.index}</th>

                                    )}

                                </tr>
                            </thead>
                            <tbody>
                                {this.props.contacts.all.slice().map(info =>
                                    <tr key={info.id}>
                                        {this.header.map(head =>
                                            <td>{info[head.index]}</td>
                                        )}

                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            }
        }
    )
);

const domContainer = document.getElementById('like_button_container');

ReactDOM.render(
    <Provider contacts={stores.Contacts}>
        <LikeButton/>
    </Provider>,
    domContainer
);
