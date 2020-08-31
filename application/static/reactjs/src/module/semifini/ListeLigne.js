import React, { Component } from "react";
import { render } from "react-dom";
import LigneItem from './Ligne';


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
              dataSelect : [],
              currentSelect : [],
              oldPDV_dest : null,
              oldPDV_orig : null

          }
      }

      componentWillMount = () => {
        this.fetchDataCurrent();
      }

      componentDidMount = () => {

        const magasin_origine = document.getElementById('magasin_origine');
        const magasin_destina = document.getElementById('magasin_destina');
        const react = this;

        $(magasin_origine).on('change', function(e){

          if($(this).val() !== ''){

              let currentData = react.state.datas
              let alert = false;

              currentData.map((head, index) => {
                  if(!head.magasin_semi.includes($(this).val())){
                    alert = true
                  }
              })

              if(alert == true){

                const jquery = $(this)
                swal({
                    title: 'Ligne d\'articles a supprimer.',
                    text: 'Il existe des articles semi-finis selectionnes n\'appartenant pas au point de vente',
                    type: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'Annuler',
                    showConfirmButton: true,
                    confirmButtonText: 'Supprimer'

                }, function(input){
                  if(input === true){
                    currentData.map((head, index) => {
                        if(!head.magasin_semi.includes(jquery.val())){
                            react.deleteData(e, index)
                        }
                    })

                    react.setState({
                      oldPDV_orig : $(this).val()
                    })
                    react.fetchDataSelect()
                    react.emptyStructureData(e)

                  }else{
                    $(magasin_origine).val(react.state.oldPDV_orig);
                    $(magasin_origine).trigger('change')
                  }
                })

              }else{
                react.setState({
                  oldPDV_orig : $(this).val()
                })
                react.fetchDataSelect()
                react.emptyStructureData(e)
              }

          }else{
            swal({
                title: 'PDV d\'origine obligatoire.',
                type: 'warning',

            }, function(){
                $(magasin_origine).val(react.state.oldPDV_orig);
                $(magasin_origine).trigger('change')
            })

          }
        })

        $(magasin_destina).on('change', function(e){

          if($(this).val() !== ''){

              let currentData = react.state.datas
              let alert = false;

              currentData.map((head, index) => {
                  if(!head.magasin_fini.includes($(this).val())){
                    alert = true
                  }
              })

              if(alert == true){

                const jquery = $(this)
                swal({
                    title: 'Ligne d\'articles a supprimer.',
                    text: 'Il existe des articles finis selectionnes n\'appartenant pas au point de vente',
                    type: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'Annuler',
                    showConfirmButton: true,
                    confirmButtonText: 'Supprimer'

                }, function(input){
                  if(input === true){
                    currentData.map((head, index) => {
                        if(!head.magasin_fini.includes(jquery.val())){
                            react.deleteData(e, index)
                        }
                    })

                    react.setState({
                      oldPDV_dest : $(this).val()
                    })
                    react.fetchDataSelect()
                    react.emptyStructureData(e)

                  }else{
                    $(magasin_destina).val(react.state.oldPDV_dest);
                    $(magasin_destina).trigger('change')
                  }
                })

              }else{
                react.setState({
                  oldPDV_dest : $(this).val()
                })
                react.fetchDataSelect()
                react.emptyStructureData(e)
              }


          }else{
            swal({
                title: 'PDV destination obligatoire.',
                type: 'warning',

            }, function(){
                $(magasin_destina).val(react.state.oldPDV_dest);
                $(magasin_destina).trigger('change')
            })

          }
        })

        if(this.state.id){
          this.fetchDataSelect();
        }


      }

      /*
        Suppression d'une matiere premiere de la liste
      */
      deleteData = (e, index) => {
        e.preventDefault();
        let newState =  Object.assign({}, this.state);

        const oldData = newState.datas[index]
        newState.datas.splice(index, 1)

        let stock = oldData.global_stock
        let count = 0
        newState.datas.map((head, index) => {
          if(head.id_semi == oldData.id_semi){
              if (count == 0){
                head.stock = stock
              }else{
                head.stock = stock - head.quantite
                stock = head.stock
              }
              count += 1
          }
        });

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

        newState.currentSelect = []

        newState.datas.map((head) => {
          const currentSelect = {
            id_semi : head.id_semi,
            id_fini : head.id_fini
          }
          newState.currentSelect.push(currentSelect)
        })

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

        const event = e
        event.preventDefault()

        const magasin_origine = document.getElementById('magasin_origine')
        const magasin_destina = document.getElementById('magasin_destina')
        const react = this

        if($(magasin_origine).val().length == 0 || $(magasin_destina).val().length == 0 ){

          swal({
              title: 'Point de vente non defini.',
              text: 'Point de vente de destination et d\'origine obligatoires',
              type: 'warning'
          })

        }else{

              let newState =  Object.assign({}, this.state);
              newState.structureItem = [{ id_semi: null, name_semi: "", id_fini: null, name_fini: "", quantite : 0, stock: 0, magasin_semi: [], magasin_fini: [], data_fini: [], global_stock : 0}]
              newState.currentUpdateItem = null
              newState.oldPDV_orig = $(magasin_origine).val()
              newState.oldPDV_dest = $(magasin_destina).val()
              this.setState(newState)
              this.handleShowAdd(e);
        }

        // this.setState((prevState) => ({
        //   datas: [...prevState.datas, { id: null, quantite : 0, unite : "", cout: 0}],
        // }));

      }

      // Activer la mise a jour de la structure en cours
      updateStructureData = (index, data, key) => {
          let newState =  Object.assign({}, this.state);
          newState.structureItem[index][key] =  data
          this.setState(newState, () => {
            if(this.state.structureItem[0].id_semi !== null && this.state.structureItem[0].id_fini !== null){
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
        const currentSelect = {
          id_semi : newState.structureItem[0].id_semi,
          id_fini : newState.structureItem[0].id_fini
        }
        newState.currentSelect.push(currentSelect)
        newState.structureItem.splice(0, 1)
        newState.structureUpdated = false
        this.setState(newState, () => {
          const ligne_data = document.getElementById('ligne_data');
          $(ligne_data).val(JSON.stringify(this.state.datas));
        })
        this.handleHideAdd();
      }

      /*
        Section pour les requetes dans la base de donnee
      */
      fetchDataSelect = () => {

        const magasin_origine = document.getElementById('magasin_origine')

        const valMagOrig = $(magasin_origine).val();
        const valMagDest = $(magasin_destina).val();

        fetch(this.props.dataSelect+'?magasin_origine='+valMagOrig)
            .then(results => {
                return results.json()
            })
            .then(data => {
                this.setState({
                  dataSelect : data.data,
                  oldPDV_dest : valMagDest,
                  oldPDV_orig : valMagOrig
                });
            });
      }

      fetchDataCurrent = ()  => {

        fetch(this.props.dataCurrent)
            .then(results => {
                return results.json()
            })
            .then(data => {
              console.log(data.data);
                this.setState({
                  datas: data.data,
                  loading: false,
                  currentSelect: data.currentSelect
                }, () => {
                  const ligne_data = document.getElementById('ligne_data');
                  $(ligne_data).val(JSON.stringify(this.state.datas));
                })
          });

      }


      listData = (data, index) => {
        return (
          <table className="table table-line table-condensed articles-lines" id={index}>
            <tbody>
                <tr>
                  <td style={{ width:'30%' }} onClick={() => this.showUpdatedData(index)}>
                      {data.name_semi}
                  </td>
                  <td className="text-right" style={{ width:'20%' }} onClick={() => this.showUpdatedData(index)}>
                      {data.stock}
                  </td>
                  <td style={{ width:'30%' }} onClick={() => this.showUpdatedData(index)}>
                      {data.name_fini}
                  </td>
                  <td className="text-right" style={{ width:'20%' }} onClick={() => this.showUpdatedData(index)}>
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

        if(this.state.loading){
          return (
            <div className="col-md-12 text-center">
              <div className="progress-circle-indeterminate m-t-45">
              </div>
            </div>

          )
        }

        return (
          <div>
              <div className="lead m-b-20 m-t-50">
                  Liste des articles
              </div>


              {this.state.datas.length === 0 && this.state.structureItem.length === 0 && (
                <div className="no-data sm-p-t-30">
                    <div className="d-flex justify-content-center flex-column m-t-50 m-b-50">
                        <div className="dz-default dz-message">
                            <i className="fa fa-database"></i>
                            <h3>Aucun article associe </h3>
                        </div>
                        <div className="text-center m-t-10">
                          <button className="btn btn-primary" type="button" onClick={(event) => this.addData(event)}>Ajouter un article</button>
                        </div>
                    </div>
                </div>
              )}

              {(this.state.datas.length !== 0 || this.state.structureItem.length !== 0) && (

                <div className="mh-370">
                      <table className="table table-condensed">
                        <thead>
                          <tr>
                            <th style={{width:'30%'}}>Articles semi fini</th>
                            <th className="text-right"  style={{ width:'20%' }}>En stock</th>
                            <th style={{width:'30%'}}>Articles fini</th>
                            <th className="text-right"  style={{ width:'20%' }}>Quantite</th>
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
                                      allData={this.state.datas}
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
                            allData={this.state.datas}
                        /> : null}

                        <div className="form-group row">
                            <div className="col-md-12 form-field__content" >
                                  <a className="form-link--with-spacing" hidden={this.state.structureUpdated === true} href="#" onClick={(event) => this.addData(event)}>Ajouter un article</a>
                                  <a className="btn btn-danger m-t-10 m-b-10" hidden={this.state.structureUpdated === false} href="#" onClick={(event) => this.validStructureData(event)}>Valider les modifications</a>
                            </div>
                        </div>


                </div>
              )}


          </div>
        )


      }

}


const domContainer = document.getElementById('card_ligneSemifini');

if (domContainer){

    const id = domContainer.getAttribute('data-id');
    domContainer.removeAttribute('data-id');

    const dataCurrent = domContainer.getAttribute('dataCurrent');
    domContainer.removeAttribute('dataCurrent');

    const dataSelect = domContainer.getAttribute('dataSelect');
    domContainer.removeAttribute('dataSelect')

    const dataCheck = domContainer.getAttribute('dataCheck');
    domContainer.removeAttribute('dataCheck')

    render(
        <ListeLigne id={id} dataCurrent={dataCurrent} dataSelect={dataSelect} dataCheck={dataCheck} />,
        domContainer
    );

}
