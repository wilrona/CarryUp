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
                  index: 'name',
                  name: 'Article',
                  className: 'table-width-30',
                  showDefault: true

              },
              {
                  index: 'categorie_name',
                  name: 'Categorie',
                  showDefault: true,
              },
              {
                  index: 'pos',
                  name: 'Point de vente',
                  showDefault: true,
              },

              {
                  index: 'stock',
                  name: 'En stock',
                  className : 'text-right',
                  showDefault: true,
              },
              {
                  index: 'prix',
                  name: 'Prix',
                  className : 'text-right',
                  showDefault: true,
              }
          ];

          return (
              <div>
                  <div className="card-header">
                      <div className="card-title col-md-8">
                          <a href={this.props.linkEdit} className="btn btn-primary btn-sm">Creer un article</a>
                      </div>

                      <div className="card-controls">
                          <input type="text" className="form-control" onChange={this.updateQuery} placeholder="Recherche dans le catalogue" />
                      </div>
                  </div>
                  <DataTable linkList={this.props.linkList} actionEdit={true} header={header} search={this.state.query}/>

              </div>
          )
      }

}


const domContainer = document.getElementById('card_item');

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
