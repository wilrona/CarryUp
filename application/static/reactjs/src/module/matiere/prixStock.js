import React, { Component } from "react";
import { render } from "react-dom";
import Modal from '../../component/modal';
import UpdateVariante from './UpdateVariante';


class PrixStockMatiere extends Component {

      constructor(props){
          super(props);

          this.state = {
              id :  this.props.id ?  this.props.id : null,
              showModal: false,
              loading: true,
              variantes : [],
              pdv: [],
              structureVariantes : [],
              showModalAdd : false,
              indexModalOpen : 0
          }
      }


      componentWillMount = () => {
          this.fetchVariante();
      }

      handleHideModal = () => {
        this.setState({
          showModal : false
        })
      }

      handleHideModalAdd = () => {
        this.setState({
          showModalAdd : false
        })
      }

      handleShowModal = (e) => {
        e.preventDefault();
        this.setState({
          showModal : true
        })
      }

      handleShowModalAdd = (e) => {
        e.preventDefault();
        this.setState({
          showModalAdd : true
        })
      }


      componentDidMount = () => {

        // enregistrement des elements du dom qui seront utilise
        const submit = document.getElementById('card_stockItem_submit');
        const form = document.getElementById('submitForm');
        const pdv = document.getElementById('magasin');
        const name = document.getElementById('name');
        const numeric_element = document.getElementsByClassName('numeric_dec'); {

        }
        const react = this;

        // initialisation des points de vente deja enregistre
        let variante = react.state.variantes;
        let pdvChange = $(pdv).val();

        variante.map((variant) => {

            variant.magasin.map((mag) => {
              if(pdvChange.length > 0){
                if(pdvChange.some(item => mag.mag_id === item)){
                    mag.show = true
                }else{
                  mag.show = false
                }
              }else{
                mag.show = true;
              }

            })

        })

        this.setState({
          variantes : variante,
          pdv: $(pdv).val()
        });

        // prendre en compte les changements des points de vente
        $(pdv).on('change', function(){

          let variante = react.state.variantes;
          let pdvChange = $(this).val();

          variante.map((variant) => {

              variant.magasin.map((mag) => {
                if(pdvChange.length > 0){
                  if(pdvChange.some(item => mag.mag_id === item)){
                      mag.show = true
                  }else{
                    mag.show = false
                  }
                }else{
                  mag.show = true;
                }

              })

          })

          react.setState({
            variantes : variante,
            pdv : $(this).val()
          })
        });

      }

      updateFieldVariante = () => {

        let variante = this.state.variantes;

        variante.map((variant) => {

            let prixVente = variant.prix_vente+''
            prixVente = prixVente.split(' ');
            prixVente = prixVente.join('');
            variant.prix_vente = prixVente

            variant.magasin.map((mag) => {
              let prixVente = mag.prix_vente+''
              prixVente = prixVente.split(' ');
              prixVente = prixVente.join('');
              mag.prix_vente = prixVente

              let stockalert = mag.stock_alert+''
              stockalert = stockalert.split(' ');
              stockalert = stockalert.join('');
              mag.stock_alert = stockalert

            })

        })

        const pdv = document.getElementById('magasin');

        this.setState({
          variantes : variante,
          pdv: $(pdv).val()
        });

        const fieldVariante = document.getElementById('variantes');
        $(fieldVariante).val(JSON.stringify(this.state.variantes));

      }

      // fonction de mise a jour du state dans le composant enfant
      updatedVariante = (index, data, key=null) => {

        if (key){
          let newState =  Object.assign({}, this.state);
          newState.variantes[index][key] =  data
          this.setState(newState, this.updateFieldVariante())
        }else{
          let newState =  Object.assign({}, this.state);
          newState.variantes[index] =  data
          this.setState(newState, this.updateFieldVariante())
        }

        // uniquement lors de la creation
        if(this.state.variantes.length === 1) {        
          const textNotification = this.state.variantes[index].alert ? 'Modifier par point de vente' : 'Aucune'
          $(this.stock_alert).text(textNotification)
        }


      }

      addVariante = (variante) => {
        let newState =  Object.assign({}, this.state);
        newState.variantes.push(variante)
        this.setState(newState, this.updateFieldVariante())
      }

      deleteVariante = (e, index) => {
        e.preventDefault();
        let newState =  Object.assign({}, this.state);
        newState.variantes.splice(index, 1)
        this.setState(newState, () => {
          this.initAutoNumeric()
          this.updateFieldVariante()
        })
      }

      fetchVariante() {

        fetch(this.props.urlVariante)
            .then(results => {
                return results.json()
            })
            .then(data => {
                this.setState({
                  variantes: data.data,
                  loading: false
                }, () => {

                  const fieldVariante = document.getElementById('variantes');
                  $(fieldVariante).val(JSON.stringify(this.state.variantes));

                  this.initAutoNumeric()


                })
            });

      }

      initAutoNumeric = () => {
        if (this.state.variantes.length === 1){

              this.$prix_vente = $(this.prix_vente);
              this.$stock = $(this.stock);
              this.$stock_alerte = $(this.stock_alert);

              const textNotification = this.state.variantes[0].alert ? 'Modifier par point de vente' : 'Aucune'
              $(this.stock_alert).text(textNotification)

        }
      }

      openUpdateModal = (e, index) => {
        this.setState({
          indexModalOpen : index
        })
        this.handleShowModal(e);
      }

      contentModal = () => {
        const variante = this.state.variantes[this.state.indexModalOpen]
        return (
          <UpdateVariante
            variante={variante}
            indexVariante={this.state.indexModalOpen}
            buttonSave='update'
            updateVariante={this.updatedVariante}
          />
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

        if (this.state.variantes.length === 1){

                return (

                  <div>
                      <div className="lead m-b-20 m-t-50">
                          Gestion des stocks
                      </div>

                      <div className='form-table form-table--with-spacing'>
                          <div className="form-group row">
                              <label className='col-md-3 control-label form-field__label'>Stock</label>
                              <div className="col-md-9 form-field__content">
                                      <a className="form-link--with-spacing" href="#" onClick={(event) => this.openUpdateModal(event, 0)} ref={el => this.stock = el}>
                                          {this.state.variantes[0].stock ? this.state.variantes[0].stock : 0}
                                      </a>
                              </div>
                          </div>
                          <div className="form-group row">
                              <label className='col-md-3 control-label form-field__label'>Notification de stock réduit</label>
                              <div className="col-md-9 form-field__content">
                                      <a className="form-link--with-spacing" href="#" onClick={(event) => this.openUpdateModal(event, 0)} ref={el => this.stock_alert = el}>
                                        {this.state.variantes[0].alert ? 'Modifier par point de vente' : 'Aucune'}
                                      </a>
                              </div>
                          </div>

                          {this.state.showModal ? <Modal handleHideModal={this.handleHideModal} body={() => this.contentModal()}/> : null}

                      </div>
                  </div>
                )

        }






      }

}


const domContainer = document.getElementById('card_stockMatiere');

if (domContainer){

    const id = domContainer.getAttribute('data-id');
    domContainer.removeAttribute('data-id');

    const urlVariante = domContainer.getAttribute('urlVariante');
    domContainer.removeAttribute('urlVariante');

    render(
        <PrixStockMatiere id={id} urlVariante={urlVariante}/>,
        domContainer
    );

}
