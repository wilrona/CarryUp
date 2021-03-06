import React, { Component } from "react";
import { render } from "react-dom";
import LigneItem from './ligneRecetteComp';


class RecetteComplement extends Component {

      constructor(props){
          super(props);

          this.state = {
              id :  this.props.id ?  this.props.id : null,
              loading: false,
              showAdd: false,
              structureUpdated : false,
              structureItem : [],
              currentUpdateItem : null,
              matieres : [],
              allMatiere : [],
              currentSelect : [],
              typeRecette : this.props.typeRecette

          }
      }

      componentWillMount = () => {
        if(this.state.id == null){

          let current = []

          if(this.props.setContent != 'None'){
            const content = JSON.parse(this.props.setContent)
            content.map((head) => {
              current.push(head.id)
            })
          }

          this.setState({
            matieres : this.props.setContent != 'None' ? JSON.parse(this.props.setContent) : [],
            currentSelect: current
          })

        }

        this.fetchAllMatiere();

        if(this.state.id){
          this.fetchMatiere();
        }
      }

      componentDidMount = () => {

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
            const ligne_data = document.getElementById('recette_complement');
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
              const ligne_data = document.getElementById('recette_complement');
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
            const ligne_data = document.getElementById('recette_complement');
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
            const ligne_data = document.getElementById('recette_complement');
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
        newState.structureItem = [{ id: null, quantite : 0, unite : "", name: ""}]
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
          const ligne_data = document.getElementById('recette_complement');
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
          newState.matieres[index].unite = data.unite
          newState.matieres[index].id = data.id
          newState.matieres[index].quantite = data.quantite
          this.setState(newState, () => {

            const ligne_data = document.getElementById('recette_complement');
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

                  const ligne_data = document.getElementById('recette_complement');
                  $(ligne_data).val(JSON.stringify(this.state.matieres));


                })
          });

      }

      checked = (e) => {
        if (e.target.checked === true){
          let newState =  Object.assign({}, this.state);
          newState.matieres = []
          newState.structureItem = []
          newState.typeRecette = 'true'
          this.setState(newState, () => {
            const ligne_data = document.getElementById('recette_complement');
            $(ligne_data).val(JSON.stringify(this.state.matieres));
          })
        }else{
          this.setState({
            typeRecette : 'false'
          })
        }
      }


      listMatiere = (data, index) => {
        return (
          <table className="table table-line table-condensed articles-lines" id={index}>
            <tbody>
                <tr>
                  <td style={{ width:'72%' }} onClick={() => this.showUpdatedMatiere(index)}>
                      {data.name}
                  </td>
                  <td className="text-right" style={{ width:'30%' }} onClick={() => this.showUpdatedMatiere(index)}>
                      {data.quantite}  {data.unite}
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
              <div className="lead m-b-20 m-t-30">
                  Recette Complementaires
              </div>

              <div className="checkbox check-success">
                  <input type="checkbox" name="type_recette" onChange={(event) => this.checked(event)} defaultChecked={this.state.typeRecette === 'false' ? false : true} defaultValue="1" id="checkbox_recette" ref={el => this.type_recette = el} />
                  <label htmlFor="checkbox_recette">Cette recette est une recette complementaire</label>
                  <p>
                    <small>Une recette complementaire est une recette qui peut etre utilise dans la constitution d'une autre recette uniquement.</small><br />
                    <small>si la case est coche, les recettes complementaires associe ne seront pas pris en compte a l'enregistrement.</small>


                  </p>
              </div>


              {this.state.typeRecette === 'false' && this.state.matieres.length === 0 && this.state.structureItem.length === 0 && (
                <div className="no-data sm-p-t-30">
                    <div className="d-flex justify-content-center flex-column m-t-50 m-b-50">
                        <div className="dz-default dz-message">
                            <i className="fa fa-database"></i>
                            <h3>Aucune recette complementaire associe</h3>
                        </div>
                        <div className="text-center m-t-10">
                          <button className="btn btn-primary" type="button" onClick={(event) => this.addMatiere(event)}>Ajouter une recette complementaire</button>
                        </div>
                    </div>
                </div>
              )}

              {this.state.typeRecette === 'false' && (this.state.matieres.length !== 0 || this.state.structureItem.length !== 0) && (

                <div className="mh-370">
                      <table className="table table-condensed">
                        <thead>
                          <tr>
                            <th style={{width:'72%'}}>Recettes</th>
                            <th className="text-right" style={{ width: '30%' }}>Quantite</th>
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
                                  <a className="form-link--with-spacing" hidden={this.state.structureUpdated === true} href="#" onClick={(event) => this.addMatiere(event)}>Ajouter une recette complementaire</a>
                                  <a className="btn btn-danger m-t-10 m-b-10" hidden={this.state.structureUpdated === false} href="#" onClick={(event) => this.validStructureMatiere(event)}>Valider les modifications</a>
                            </div>

                        </div>


                </div>
              )}



          </div>
        )


      }

}


const domContainer = document.getElementById('card_recetteComp');

if (domContainer){

    const id = domContainer.getAttribute('data-id');
    domContainer.removeAttribute('data-id');

    const urlVariante = domContainer.getAttribute('urlVariante');
    domContainer.removeAttribute('urlVariante');

    const urlAllMatiere = domContainer.getAttribute('allMatiere');
    domContainer.removeAttribute('allMatiere')

    const type_recette = domContainer.getAttribute('type_recette');
    domContainer.removeAttribute('type_recette')

    const urlCheck = domContainer.getAttribute('checkMatiere');
    domContainer.removeAttribute('checkMatiere')

    const setContent = domContainer.getAttribute('setContent');
    domContainer.removeAttribute('setContent')

    render(
        <RecetteComplement id={id} urlVariante={urlVariante} urlAllMatiere={urlAllMatiere} urlCheck={urlCheck} typeRecette={type_recette} setContent={setContent}/>,
        domContainer
    );

}
