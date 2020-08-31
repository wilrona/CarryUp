import React, { Component } from "react";
import { render } from "react-dom";
import Modal from '../../component/modal';
import LigneItem from './ligneItem';


class MatiereRecette extends Component {

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
              qte_aproduire : 0,
              allMatiere : [],
              currentSelect : []
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

      componentDidUpdate = (oldProps, oldState) => {
        const newState = this.state

        if(oldState.loading !== newState.loading){

          const react = this;
          this.$a_produire = $(this.a_produire);

          this.$a_produire.autoNumeric('init', {
            wEmpty: 'zero',
            lZero: 'deny',
            mDec : 1
          });

          /*
              Mise a jour des couts de la liste des matieres premieres
              en modifiant la valeur de la quantite a produire
          */
          this.$a_produire.on('keyup', function(){
            let matieres = react.state.matieres

            let $curVal = $(this).val();
            $curVal = $curVal.split(' ');
            $curVal = $curVal.join('');

            matieres.map((head, index) => {
                const data = {
                  'id' : head.id,
                  'a_produire' : $curVal,
                  'quantite' : head.quantite
                }
                react.fetchCheck(data, index)
            })

          });

        }

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
          $(ligne_data).val(JSON.stringify(this.state.matieres));
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
            $(ligne_data).val(JSON.stringify(this.state.matieres));
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
          $(ligne_data).val(JSON.stringify(this.state.matieres));
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
        this.setState(newState)
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
        newState.structureItem = [{ id: null, quantite : 0, unite : "", cout: 0, name: ""}]
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
          this.chechCoutMatiere()
          // mise a jour de l'inpout matiere premiere
          const ligne_data = document.getElementById('matiere_premiere');
          $(ligne_data).val(JSON.stringify(this.state.matieres));
        })
        this.handleHideAdd();


      }

      /*
        Calcul du cout de la matiere premiere
      */
      chechCoutMatiere = () => {

        const a_produire = document.getElementById('a_produire');

        let matieres = this.state.matieres

        let $curVal = $(a_produire).val();
        $curVal = $curVal.split(' ');
        $curVal = $curVal.join('');

        matieres.map((head, index) => {
            const data = {
              'id' : head.id,
              'a_produire' : $curVal,
              'quantite' : head.quantite
            }
            this.fetchCheck(data, index)
        })
      }

      /*
      Calul du cout total des matieres premieres
      */
      totalCout = () => {

        let matieres = this.state.matieres
        let total = 0

        matieres.map((head, index) => {
          total += head.cout
        })

        return total

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
          newState.matieres[index].cout = data.cout
          newState.matieres[index].id = data.id
          newState.matieres[index].quantite = data.quantite
          this.setState(newState, () => {
              // mise a jour de l'inpout matiere premiere
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


      listMatiere = (data, index) => {
        return (
          <table className="table table-line table-condensed articles-lines" id={index}>
            <tbody>
                <tr>
                  <td style={{ width:'50%' }} onClick={() => this.showUpdatedMatiere(index)}>
                      {data.name}
                  </td>
                  <td className="text-right" style={{ width:'30%' }} onClick={() => this.showUpdatedMatiere(index)}>
                      {data.quantite} {data.unite}
                  </td>
                  <td className=" text-right" style={{ width: "30%" }} onClick={() => this.showUpdatedMatiere(index)}>
                    {data.cout}
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

        if(this.state.loading){
          return (
            <div className="col-md-12 text-center">
              <div className="progress-circle-indeterminate m-t-45">
              </div>
            </div>

          )
        }

        const error = this.props.errorAproduire === 'false' ? '' : 'has-error'
        const a_produire = 'form-group row '+error


        return (
          <div>
              <div className="lead m-b-20 m-t-30">
                  Elements de recette
              </div>
              <div className='form-table form-table--with-spacing'>
                  <div className={a_produire}>
                      <label className='col-md-3 control-label form-field__label'>Quantite a produire</label>
                      <div className="col-md-9">
                        <input type='text' className='form-control form-field__input numeric_dec'
                          ref={el => this.a_produire = el}
                          data-a-sep= " "
                          data-v-min = "0"
                          data-v-max = "999999999999"
                          defaultValue={this.props.Aproduire ? this.props.Aproduire : this.state.qte_aproduire}
                          id='a_produire'
                          name='a_produire'
                        />
                      </div>
                  </div>
              </div>
              {this.state.loading && (
                <div className="col-md-12 text-center">
                  <div className="progress-circle-indeterminate m-t-45">
                  </div>
                </div>
              )}

              {this.state.loading === false && this.state.matieres.length === 0 && this.state.structureItem.length === 0 && (
                <div className="no-data sm-p-t-30">
                    <div className="d-flex justify-content-center flex-column m-t-50 m-b-50">
                        <div className="dz-default dz-message">
                            <i className="fa fa-database"></i>
                            <h3>Aucune matiere premiere associe</h3>
                        </div>
                        <div className="text-center m-t-10">
                          <button className="btn btn-primary" type="button" onClick={(event) => this.addMatiere(event)}>Ajouter une matiere premiere</button>
                        </div>
                    </div>
                </div>
              )}

              {(this.state.matieres.length !== 0 || this.state.structureItem.length !== 0) && this.state.loading === false && (

                <div className="mh-370">
                      <table className="table table-condensed">
                        <thead>
                          <tr>
                            <th style={{width:'42%'}}>Matiere premiere</th>
                            <th className="text-right" style={{ width: '30%' }}>Quantite</th>
                            <th className="text-right" style={{ width: '30%' }}>Cout</th>
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
                                  <a className="form-link--with-spacing" hidden={this.state.structureUpdated === true} href="#" onClick={(event) => this.addMatiere(event)}>Ajouter une matiere premiere</a>
                                  <a className="btn btn-danger m-t-10 m-b-10" hidden={this.state.structureUpdated === false} href="#" onClick={(event) => this.validStructureMatiere(event)}>Valider les modifications</a>
                            </div>

                        </div>

                       <table className="table" style={{ border: 'none'}}>
                          <tfoot style={{ border: 'none' }}>
                            <tr>
                              <th colSpan="2" className="text-right" style={{ width:'70%'}}><b>Montant total</b></th>
                              <th className="text-right" style={{ width:'30%' }}>{this.totalCout()}</th>

                            </tr>
                          </tfoot>
                      </table>


                </div>
              )}

          </div>
        )


      }

}


const domContainer = document.getElementById('card_recetteMatiere');

if (domContainer){

    const id = domContainer.getAttribute('data-id');
    domContainer.removeAttribute('data-id');

    const urlVariante = domContainer.getAttribute('urlVariante');
    domContainer.removeAttribute('urlVariante');

    const urlAllMatiere = domContainer.getAttribute('allMatiere');
    domContainer.removeAttribute('allMatiere')

    const urlCheck = domContainer.getAttribute('checkMatiere');
    domContainer.removeAttribute('checkMatiere')

    const a_produire = domContainer.getAttribute('a_produire');
    domContainer.removeAttribute('a_produire')

    const errorAproduire = domContainer.getAttribute('erroraproduire');
    domContainer.removeAttribute('erroraproduire')

    const setContent = domContainer.getAttribute('setContent');
    domContainer.removeAttribute('setContent')

    render(
        <MatiereRecette id={id} urlVariante={urlVariante} urlAllMatiere={urlAllMatiere} urlCheck={urlCheck} Aproduire={a_produire} errorAproduire={errorAproduire} setContent={setContent}/>,
        domContainer
    );

}
