import React, { Component } from "react";
import { render } from "react-dom";
import LigneItem from './Ligne';
import Modal from '../../component/modal';
import ListeCourse from './ListeCourse.js';


class ListeLigne extends Component {

      constructor(props){
          super(props);

          this.state = {
              id :  this.props.id ?  this.props.id : null,
              loading: true,
              showAdd: false,
              structureUpdated : false,
              structureItem : [],
              currentUpdateItem : null,
              datas : [],
              currentSelect: [],
              dataSelect : [],
              dataCourse : []

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
              datas : this.props.setContent != 'None' ? JSON.parse(this.props.setContent) : [],
              currentSelect: current
            });

          }

          this.fetchDataSelect();

          // if(this.state.id){
          //   this.fetchDataCurrent();
          // }

      }

      componentDidMount = () => {

        const click_course = document.getElementById('calCourse');
        const react = this;

        $(click_course).on('click', function(e){
          e.preventDefault();
          e.stopImmediatePropagation();
          if(react.state.datas.length > 0){
            // effectuer la requete de calcaul de course avant l'ouverture du modale
            react.fetchCourse()
            react.handleShowModal(e)
          }else{
            swal({
                title: 'Aucun element defini.',
                text: 'Aucun element defini pour fournir un resultat de course',
                type: 'error'

            })
          }

        });

      }

      handleHideModal = () => {
        this.setState({
          showModal : false
        })
      }

      handleShowModal = (e) => {
        e.preventDefault();
        this.setState({
          showModal : true
        })
      }

      /*
        Suppression d'une matiere premiere de la liste
      */
      deleteData = (e, index) => {
        e.preventDefault();
        let newState =  Object.assign({}, this.state);
        newState.datas.splice(index, 1)
        newState.currentSelect.splice(index, 1)
        this.setState(newState, () => {
            // mise a jour de l'inpout matiere premiere
            const ligne_data = document.getElementById('ligne_data');
            $(ligne_data).val(JSON.stringify(this.state.datas))
          })

      }

      /*
        Modification d'une matiere premiere de la liste
      */
      updateData = (index, data, key) => {
          let newState =  Object.assign({}, this.state);
          newState.datas[index][key] =  data
          this.setState(newState, () => {
              // mise a jour de l'inpout matiere premiere
              const ligne_data = document.getElementById('ligne_data');
              $(ligne_data).val(JSON.stringify(this.state.datas))
            })
      }

      /*
        Prise en compte de la modification d'une matiere premieres
      */
      updatedData = (index, data) => {
        let newState =  Object.assign({}, this.state);
        newState.datas[index] =  data
        newState.currentUpdateItem =  null

        this.setState(newState, () => {
            // mise a jour de l'inpout matiere premiere
            const ligne_data = document.getElementById('ligne_data');
            $(ligne_data).val(JSON.stringify(this.state.datas))
          })
      }

      /*
        Affichage du formulaire de modification d'une matiere premiere
      */
      showUpdatedData = (index) => {
        let newState =  Object.assign({}, this.state);
        newState.structureItem.splice(0, 1)
        newState.structureUpdated = false
        newState.currentUpdateItem = index
        this.setState(newState, () => {
            // mise a jour de l'inpout matiere premiere
            const ligne_data = document.getElementById('ligne_data');
            $(ligne_data).val(JSON.stringify(this.state.datas))
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
      emptyStructureData = (e, index) => {
        e.preventDefault();
        let newState =  Object.assign({}, this.state);
        newState.structureItem.splice(index, 1)
        newState.structureUpdated = false
        this.setState(newState)
        this.handleHideAdd();
      }

      // afficher le formulaire de l'ajout d'une nouvelle matiere premiere
      addData = (e) => {

        e.preventDefault()

        let newState =  Object.assign({}, this.state);
        newState.structureItem = [{ id: null, name: "", quantite : 0 }]
        newState.currentUpdateItem = null
        this.setState(newState)
        this.handleShowAdd(e);



        // this.setState((prevState) => ({
        //   datas: [...prevState.datas, { id: null, quantite : 0, unite : "", cout: 0}],
        // }));

      }

      // Activer la mise a jour de la structure en cours
      updateStructureData = (index, data, key) => {
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
      validStructureData = (e) => {
        e.preventDefault();
        let newState =  Object.assign({}, this.state);
        newState.datas.push(newState.structureItem[0])
        newState.currentSelect.push(newState.structureItem[0].id)
        newState.structureItem.splice(0, 1)
        newState.structureUpdated = false
        this.setState(newState, () => {
          const fieldVariante = document.getElementById('ligne_data');
          $(fieldVariante).val(JSON.stringify(this.state.datas));
        })
        this.handleHideAdd();
      }

      /*
        Section pour les requetes dans la base de donnee
      */
      fetchDataSelect = () => {

        fetch(this.props.dataSelect)
            .then(results => {
                return results.json()
            })
            .then(data => {
                this.setState({
                  dataSelect : data.data
                })
                console.log(data.data);
            });
      }

      fetchCheck = (datajson, index) => {

        const options = {
          method : 'POST',
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json',},
          body : JSON.stringify(datajson)
        }

        fetch(this.props.dataCheck, options)
        .then(results => {
            return results.json()
        })
        .then(data => {
          let newState =  Object.assign({}, this.state);
          newState.datas[index].name = data.name
          newState.datas[index].id = data.id
          newState.datas[index].quantite = data.quantite
          this.setState(newState, () => {

            const fieldVariante = document.getElementById('ligne_data');
            $(fieldVariante).val(JSON.stringify(this.state.datas));


          })
        });

      }

      fetchDataCurrent = ()  => {

        fetch(this.props.dataCurrent)
            .then(results => {
                return results.json()
            })
            .then(data => {
                this.setState({
                  datas: data.data,
                  loading: false,
                  currentSelect: data.currentSelect
                }, () => {

                  const fieldVariante = document.getElementById('ligne_data');
                  $(fieldVariante).val(JSON.stringify(this.state.datas));


                })
          });

      }

      fetchCourse = () => {

        const datajson = {
          'data' : this.state.datas
        }

        const options = {
          method : 'POST',
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json',},
          body : JSON.stringify(datajson)
        }

        fetch(this.props.dataCalcul, options)
        .then(results => {
            return results.json()
        })
        .then(data => {

            this.setState({
              dataCourse :  data.data
            });

          })

      }

      contentModal = () => {
        return (
            <ListeCourse listeCourse={this.state.dataCourse}/>
        )
      }


      listData = (data, index) => {
        return (
          <table className="table table-line table-condensed articles-lines" id={index}>
            <tbody>
                <tr>
                  <td style={{ width:'60%' }} onClick={() => this.showUpdatedData(index)}>
                      {data.name}
                  </td>
                  <td className="text-right" style={{ width:'40%' }} onClick={() => this.showUpdatedData(index)}>
                      {data.quantite}
                  </td>
                  <td className='head-position-absolute'>

                        <a href='' className="text-primary" onClick={(event) => this.deleteData(event, index)}><i className="fa fa-trash"> </i></a>

                  </td>
                </tr>
            </tbody>
        </table>
        )
      }

      render(){

        return (
          <div className="m-b-50">

            <div className="lead m-b-20 m-t-50">
                Liste des elements a produire
            </div>

              {this.state.datas.length === 0 && this.state.structureItem.length === 0 && (
                <div className="no-data sm-p-t-30">
                    <div className="d-flex justify-content-center flex-column m-t-50 m-b-50">
                        <div className="dz-default dz-message">
                            <i className="fa fa-database"></i>
                            <h3>Aucune ligne </h3>
                        </div>
                        <div className="text-center m-t-10">
                          <button className="btn btn-primary" type="button" onClick={(event) => this.addData(event)}>Ajouter une ligne</button>
                        </div>
                    </div>
                </div>
              )}

              {(this.state.datas.length !== 0 || this.state.structureItem.length !== 0) && (

                <div className="mh-370">
                      <table className="table table-condensed">
                        <thead>
                          <tr>
                            <th style={{width:'60%'}}>Articles</th>
                            <th className="text-right"  style={{ width:'40%' }}>Quantite</th>
                            <th className='head-position-absolute'></th>
                          </tr>
                        </thead>
                      </table>

                        {this.state.datas.map((head, index) => {
                            return(
                              <div key={index}>
                                {this.state.currentUpdateItem === index ?  <LigneItem
                                      index={index}
                                      key={index}
                                      data={head}
                                      allMatiere={this.state.dataSelect}
                                      deleteButton={this.updatedData}
                                      action='update'
                                      updateData={this.updateData}
                                      check={this.props.dataCheck}
                                      currentSelect={this.state.currentSelect}
                                  /> : null}
                              {this.state.currentUpdateItem !== index ?  this.listData(head, index) : null}
                              </div>
                            )
                        })}

                        {this.state.showAdd ? <LigneItem
                            index={0}
                            data={this.state.structureItem[0]}
                            allMatiere={this.state.dataSelect}
                            deleteButton={this.emptyStructureData}
                            action='add'
                            updateData={this.updateStructureData}
                            check={this.props.dataCheck}
                            currentSelect={this.state.currentSelect}
                        /> : null}

                        <div className="form-group row">
                            <div className="col-md-12 form-field__content" >
                                  <a className="form-link--with-spacing" hidden={this.state.structureUpdated === true} href="#" onClick={(event) => this.addData(event)}>Ajouter une ligne</a>
                                  <a className="btn btn-danger m-t-10 m-b-10" hidden={this.state.structureUpdated === false} href="#" onClick={(event) => this.validStructureData(event)}>Valider les modifications</a>
                            </div>
                        </div>


                </div>
              )}


              {this.state.showModal ? <Modal handleHideModal={this.handleHideModal} body={() => this.contentModal()}/> : null}

          </div>
        )


      }

}


const domContainer = document.getElementById('card_editCourse');

if (domContainer){

    const id = domContainer.getAttribute('data-id');
    domContainer.removeAttribute('data-id');

    const dataCurrent = domContainer.getAttribute('dataCurrent');
    domContainer.removeAttribute('dataCurrent');

    const dataSelect = domContainer.getAttribute('dataSelect');
    domContainer.removeAttribute('dataSelect')

    const dataCheck = domContainer.getAttribute('dataCheck');
    domContainer.removeAttribute('dataCheck')

    const dataCalcul = domContainer.getAttribute('dataCalcul');
    domContainer.removeAttribute('dataCalcul')

    const setContent = domContainer.getAttribute('setContent');
    domContainer.removeAttribute('setContent')

    render(
        <ListeLigne id={id} dataCurrent={dataCurrent} dataSelect={dataSelect} dataCheck={dataCheck} dataCalcul={dataCalcul} setContent={setContent} />,
        domContainer
    );

}
