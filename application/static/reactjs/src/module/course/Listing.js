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
                index: 'title',
                name: 'Nom',
                className: '',
                showDefault: true,
                sortable: true,
                sortDefault: true

            },
            {
                index: 'date',
                name: 'date course',
                showDefault: true,
            },
            {
                index: 'cout',
                name: 'Montant',
                showDefault: true,
            },
        ];

        return (
            <div>
                <div className="card-header">
                    <div className="card-title col-md-8">
                        <a href={this.props.linkEdit} className="btn btn-primary btn-sm">Creer une course</a>
                    </div>

                    <div className="card-controls">
                        <input type="text" className="form-control" onChange={this.updateQuery} placeholder="Recherche course" />
                    </div>
                </div>
                <DataTable linkList={this.props.linkList} actionEdit={false} actionView={true} header={header} search={this.state.query}/>

            </div>
        )
    }
}

const domContainer = document.getElementById('card_course');

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
