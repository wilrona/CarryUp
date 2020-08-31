import React, { Component } from "react";
import { render } from "react-dom";
import LigneItem from './ligneItem';

// Enregistrement des matieres premieres pour les articles
class ProduitCompose extends Component {

      constructor(props){
          super(props);

          this.state = {
              id :  this.props.id ?  this.props.id : null,
              loading: true,
              showAdd: false,
              structureUpdated : false,
              structureItem : [],
              currentUpdateItem : null,
              matieres : [],
              allMatiere : [],
              currentSelect : [],
              typeArticle : false

          }
      }

      componentWillMount = () => {

        if (this.state.id == null) {
          let current = []

          if (this.props.setContent != 'None') {
            const content = JSON.parse(this.props.setContent)
            content.map((head) => {
              current.push(head.id)
            })
          }

          this.setState({
            matieres: this.props.setContent != 'None' ? JSON.parse(this.props.setContent) : [],
            currentSelect: current
          })
        }

        this.fetchAllMatiere();

        if (this.state.id) {
          this.fetchMatiere();
        }


      }

      componentDidMount = () => {

          const compose = document.getElementById('type_article');
          this.setState({
            typeArticle : $(compose).prop('checked')
          });

          const react = this
          $(compose).on('change', function(){
            console.log($(this).prop('checked'))
            react.setState({
              typeArticle : $(this).prop('checked')
            })

          })

      }

      /*
        Suppression d'une matiere premiere de la liste
      */
      deleteMatiere = (e, index) => {
        e.preventDefault();
        let newState =  Object.assign({}, this.state);
        newState.matieres.splice(index, 1)
        newState.currentSelect.splice(index, 1)
        this.setState(newState, () => {
            // mise a jour de l'inpout matiere premiere
            const ligne_data = document.getElementById('matiere_premiere');
            $(ligne_data).val(JSON.stringify(this.state.matieres))
          })

      }

      /*
        Modification d'une matiere premiere de la liste
      */
      updateMatiere = (index, data, key) => {
          let newState =  Object.assign({}, this.state);
          newState.matieres[index][key] =  data
          this.setState(newState, () => {
              // mise a jour de l'inpout matiere premiere
              const ligne_data = document.getElementById('matiere_premiere');
              $(ligne_data).val(JSON.stringify(this.state.matieres))
            })
      }

      /*
        Prise en compte de la modification d'une matiere premieres
      */
      updatedMatiere = (index, data) => {
        let newState =  Object.assign({}, this.state);
        newState.matieres[index] =  data
        newState.currentUpdateItem =  null

        newState.currentSelect = []
        newState.matieres.map((head) => {
          newState.currentSelect.push(head.id)
        })

        this.setState(newState, () => {
            // mise a jour de l'inpout matiere premiere
            const ligne_data = document.getElementById('matiere_premiere');
            $(ligne_data).val(JSON.stringify(this.state.matieres))
          })
      }

      /*
        Affichage du formulaire de modification d'une matiere premiere
      */
      showUpdatedMatiere = (index) => {
        let newState =  Object.assign({}, this.state);
        newState.structureItem.splice(0, 1)
        newState.structureUpdated = false
        newState.currentUpdateItem = index
        this.setState(newState, () => {
            // mise a jour de l'inpout matiere premiere
            const ligne_data = document.getElementById('matiere_premiere');
            $(ligne_data).val(JSON.stringify(this.state.matieres))
          })
        this.handleHideAdd();
      }

      /*

        fonction pour l'ajout d'une ligne

      */

      handleHideAdd = () => {
        this.setState({
          showAdd : false
        })
      }

      handleShowAdd = (e) => {
        e.preventDefault();
        this.setState({
          showAdd : true
        })
      }

      // vider la structure de la matiere premiere
      emptyStructureMatiere = (e, index) => {
        e.preventDefault();
        let newState =  Object.assign({}, this.state);
        newState.structureItem.splice(index, 1)
        newState.structureUpdated = false
        this.setState(newState)
        this.handleHideAdd();
      }

      // afficher le formulaire de l'ajout d'une nouvelle matiere premiere
      addMatiere = (e) => {
        e.preventDefault()
        let newState =  Object.assign({}, this.state);
        newState.structureItem = [{ id: null, quantite : 1, name: ""}]
        newState.currentUpdateItem = null
        this.setState(newState)
        this.handleShowAdd(e);
        // this.setState((prevState) => ({
        //   matieres: [...prevState.matieres, { id: null, quantite : 0, unite : "", cout: 0}],
        // }));

      }

      // Activer la mise a jour de la structure en cours
      updateStructureMatiere = (index, data, key) => {
          let newState =  Object.assign({}, this.state);
          newState.structureItem[index][key] =  data
          this.setState(newState, () => {
            if(this.state.structureItem[0].id !== null){
              if(parseFloat(this.state.structureItem[0].quantite) !== 0){
                this.setState({
                  structureUpdated : true
                })
              }else{
                this.setState({
                  structureUpdated : false
                })
              }
            }else{
              this.setState({
                structureUpdated : false
              })
            }
          })
      }

      // Validation de la structure a enregistrer
      validStructureMatiere = (e) => {
        e.preventDefault();
        let newState =  Object.assign({}, this.state);
        newState.matieres.push(newState.structureItem[0])
        newState.currentSelect.push(newState.structureItem[0].id)
        newState.structureItem.splice(0, 1)
        newState.structureUpdated = false
        this.setState(newState, () => {
          const ligne_data = document.getElementById('matiere_premiere');
          $(ligne_data).val(JSON.stringify(this.state.matieres));
        })
        this.handleHideAdd();
      }

      /*
        Section pour les requetes dans la base de donnee
      */
      fetchAllMatiere = () => {

        fetch(this.props.urlAllMatiere)
            .then(results => {
                return results.json()
            })
            .then(data => {
                this.setState({
                  allMatiere : data.data
                })
            });
      }

      fetchCheck = (datajson, index) => {

        const options = {
          method : 'POST',
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json',},
          body : JSON.stringify(datajson)
        }

        fetch(this.props.urlCheck, options)
        .then(results => {
            return results.json()
        })
        .then(data => {
          let newState =  Object.assign({}, this.state);
          newState.matieres[index].name = data.name
          newState.matieres[index].id = data.id
          newState.matieres[index].quantite = data.quantite
          this.setState(newState, () => {

            const ligne_data = document.getElementById('matiere_premiere');
            $(ligne_data).val(JSON.stringify(this.state.matieres));


          })
        });

      }

      fetchMatiere = ()  => {

        fetch(this.props.urlVariante)
            .then(results => {
                return results.json()
            })
            .then(data => {
                this.setState({
                  matieres: data.data,
                  loading: false,
                  currentSelect: data.currentSelect
                }, () => {

                  const ligne_data = document.getElementById('matiere_premiere');
                  $(ligne_data).val(JSON.stringify(this.state.matieres));


                })
          });

      }

      checked = (e) => {

        const semi_fini_change = document.getElementById('semi_fini_change');
        const a_vendre = document.getElementById('a_vendre');

        if (e.target.checked === false){
          let newState =  Object.assign({}, this.state);
          newState.matieres = []
          newState.structureItem = []
          newState.typeArticle = 'false'
          this.setState(newState, () => {
            const ligne_data = document.getElementById('matiere_premiere');
            $(ligne_data).val(JSON.stringify(this.state.matieres));
          })
          $(semi_fini_change).val('0').trigger('change')
        }else{
          this.setState({
            typeArticle : 'true'
          })

          $(semi_fini_change).val('1').trigger('change')
          $(a_vendre).prop('checked', false);
        }
      }


      listMatiere = (data, index) => {
        return (
          <table className="table table-line table-condensed articles-lines" id={index}>
            <tbody>
                <tr>
                  <td style={{ width:'100%' }} onClick={() => this.showUpdatedMatiere(index)}>
                      {data.name}
                  </td>
                  <td className='head-position-absolute'>

                        <a href='' className="text-primary" onClick={(event) => this.deleteMatiere(event, index)}><i className="fa fa-trash"> </i></a>

                  </td>
                </tr>
            </tbody>
        </table>
        )
      }

      render(){

        return (
          <div>

              {this.state.typeArticle && this.state.matieres.length === 0 && this.state.structureItem.length === 0 && (
                <div className="no-data sm-p-t-30">
                    <div className="d-flex justify-content-center flex-column m-t-50 m-b-50">
                        <div className="dz-default dz-message">
                            <i className="fa fa-database"></i>
                            <h3>Aucun article associe</h3>
                        </div>
                        <div className="text-center m-t-10">
                          <button className="btn btn-primary" type="button" onClick={(event) => this.addMatiere(event)}>Ajouter un article </button>
                        </div>
                    </div>
                </div>
              )}

              {this.state.typeArticle && (this.state.matieres.length !== 0 || this.state.structureItem.length !== 0) && (

                <div className="mh-370">
                      <table className="table table-condensed">
                        <thead>
                          <tr>
                            <th style={{width:'50%'}}>Articles</th>
                            <th style={{width:'25%'}}>Prix de vente</th>
                            <th style={{width:'25%'}}>Quantite</th>
                            <th className='head-position-absolute'></th>
                          </tr>
                        </thead>
                      </table>

                        {this.state.matieres.map((head, index) => {
                            return(
                              <div key={index}>
                                {this.state.currentUpdateItem === index ?  <LigneItem
                                      index={index}
                                      key={index}
                                      data={head}
                                      allMatiere={this.state.allMatiere}
                                      deleteButton={this.updatedMatiere}
                                      action='update'
                                      updateMatiere={this.updateMatiere}
                                      check={this.props.urlCheck}
                                      currentSelect={this.state.currentSelect}
                                  /> : null}
                              {this.state.currentUpdateItem !== index ?  this.listMatiere(head, index) : null}
                              </div>
                            )
                        })}

                        {this.state.showAdd ? <LigneItem
                            index={0}
                            data={this.state.structureItem[0]}
                            allMatiere={this.state.allMatiere}
                            deleteButton={this.emptyStructureMatiere}
                            action='add'
                            updateMatiere={this.updateStructureMatiere}
                            check={this.props.urlCheck}
                            currentSelect={this.state.currentSelect}
                        /> : null}

                        <div className="form-group row">
                            <div className="col-md-12 form-field__content" >
                                  <a className="form-link--with-spacing" hidden={this.state.structureUpdated === true} href="#" onClick={(event) => this.addMatiere(event)}>Ajouter un aticle</a>
                                  <a className="btn btn-danger m-t-10 m-b-10" hidden={this.state.structureUpdated === false} href="#" onClick={(event) => this.validStructureMatiere(event)}>Valider les modifications</a>
                            </div>

                        </div>


                </div>
              )}



          </div>
        )


      }

}


const domContainer = document.getElementById('card_articleCompose');

if (domContainer){

    const id = domContainer.getAttribute('data-id');
    domContainer.removeAttribute('data-id');

    const setContent = domContainer.getAttribute('setContent');
    domContainer.removeAttribute('setContent')

    const urlAllMatiere = domContainer.getAttribute('allMatiere');
    domContainer.removeAttribute('allMatiere')

    render(
        <ProduitCompose id={id} setContent = {setContent} urlAllMatiere = {urlAllMatiere}/>,
        domContainer
    );

}
