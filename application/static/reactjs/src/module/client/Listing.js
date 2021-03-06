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
                index: 'display_name',
                name: 'Nom',
                className: '',
                showDefault: true,
                sortable: true,
                sortDefault: true

            },
            {
                index: 'email',
                name: 'Courriel',
                showDefault: true,
            },
            {
                index: 'phone',
                name: 'Telephone',
                showDefault: true,
            },
        ];

        return (
            <div>
                <div className="card-header">
                    <div className="card-title col-md-8">
                        <a href={this.props.linkEdit} className="btn btn-primary btn-sm">Creer un client</a>
                    </div>

                    <div className="card-controls">
                        <input type="text" className="form-control" onChange={this.updateQuery} placeholder="Recherche dans le repertoire" />
                    </div>
                </div>
                <DataTable linkList={this.props.linkList} actionEdit={true} header={header} search={this.state.query}/>

            </div>
        )
    }
}

const domContainer = document.getElementById('card_client');

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
