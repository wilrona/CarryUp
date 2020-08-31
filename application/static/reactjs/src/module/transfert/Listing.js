import React, { Component } from "react";
import { render } from "react-dom";
import DataTable from "../../component/table";

class Listing extends Component {

    constructor(props){
        super(props);

        this.state = {
            query: ''
        }
    }

    updateQuery = (e) => {
        this.setState({
            query: e.target.value
        })
    };

    render(){

        const header = [
            {
                index: 'reference',
                name: 'Reference',
                className: '',
                showDefault: true

            },
            {
                index: 'magasin_origine',
                subIndex: 'name',
                name: 'Magasin d\'origine',
                showDefault: true,
            },
            {
                index: 'magasin_destina',
                subIndex: 'name',
                name: 'Magasin destination',
                showDefault: true,
            },
            {
                index: 'etat_name',
                name: 'Etat',
                showDefault: true,
            },
        ];

        return (
            <div>
                <div className="card-header">
                    <div className="card-title col-md-8">
                        <a href={this.props.linkEdit} className="btn btn-primary btn-sm">Creer un ordre de transfert</a>
                    </div>

                    <div className="card-controls">
                        <input type="text" className="form-control" onChange={this.updateQuery} placeholder="Recherche bon de commande" />
                    </div>
                </div>
                <DataTable linkList={this.props.linkList} actionView={true} header={header} search={this.state.query}/>

            </div>
        )
    }
}

const domContainer = document.getElementById('card_transfert');

if (domContainer){

    const edit = domContainer.getAttribute('data-edit');
    domContainer.removeAttribute('data-edit');

    const list = domContainer.getAttribute('data-list');
    domContainer.removeAttribute('data-list');

    render(
        <Listing linkEdit={edit} linkList={list}/>,
        domContainer
    );

}
