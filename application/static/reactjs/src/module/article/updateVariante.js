import React, { Component } from "react";
import { render } from "react-dom";
import Switch from 'react-switchery';

class UpdateVariante extends Component {

  constructor(props) {

    super(props)

    this.state = {
      currentVariante : {...this.props.variante},
      emptyName : true
    }

    this.prixVenteMagasin = [];
    this.notification = [];

  }

  componentWillMount = () => {

    if(this.state.currentVariante.name.length !== 0){
      this.setState({
        emptyName : false
      })
    }else {
      this.setState({
        emptyName : true
      })
    }

  }

  componentDidMount = () => {

    const compose = document.getElementById('compose');
    console.log(compose);

    this.$prix_vente_variante = $(this.prix_vente_variante);
    this.$prixVenteMagasin = $(this.prixVenteMagasin);
    this.$notification = $(this.notification);

    const numeric_element = document.getElementsByClassName('numeric_dec');
    $(numeric_element).autoNumeric('init', {
      wEmpty: 'zero',
      lZero: 'deny',
      mDec : 1
    });

    const react = this

    /// update prix globale
    this.$prix_vente_variante.on('change', function(){

      let $curVal = $(this).val();;

      const  key = 'prix_vente';
      const  valeur = $curVal;
      react.updateCurrentVariante(key, valeur);

    })

    $.each(this.$prixVenteMagasin, function(index){
      $(this).on('change', function(){
        const value = $(this).val();

        let $curVal = value;

        const  key = 'prix_vente';
        const  valeur = $curVal;
        react.updateMagasin(index, key, valeur);
      })
    })

    $.each(this.$notification, function(index){
      $(this).on('change', function(){
        const value = $(this).val();

        let $curVal = value;

        const  key = 'stock_alert';
        const  valeur = $curVal;
        react.updateMagasin(index, key, valeur);
      })
    })

  }

  updateCurrentVariante = (key, value) => {

    let newState =  Object.assign({}, this.state);
    newState.currentVariante[key] =  value
    this.setState(newState)
  }

  updateMagasin = (index, key, value) => {
    let newState =  Object.assign({}, this.state);
    newState.currentVariante.magasin[index][key] =  value
    this.setState(newState)
  }

  updateNameVariante = (e) => {
    const valeur = e.target.value;

    this.updateCurrentVariante('name', valeur);

    if (valeur.length !== 0){
      this.setState({
        emptyName : false
      })
    }else {
      this.setState({
        emptyName : true
      })
    }

    console.log(this.state);
  }

  updateDisponibleMagasin = (e, index) => {
    this.updateMagasin(index, 'active', e.target.checked);
  }

  activeNotification = (e, index) => {
      const disable = e === true ? false : true;
      const update = e === true ? true : false;

      const react = this
      this.$checkboxInput = $(this.notification[index]);
      this.$checkboxInput.prop('disabled', disable)
      this.updateMagasin(index, 'alert', update);


      let elementUndisabled = 0
      $.each($(this.notification), function(index){
        if($(this).is(':disabled') === false){
          elementUndisabled += 1
        }
      })

      if(elementUndisabled === 0){
        this.updateCurrentVariante('alert', false);
      }else{
        this.updateCurrentVariante('alert', true);
      }
  }

  activePrice = (e, index) => {
      const disable = e === true ? false : true;
      const update = e === true ? true : false;
      this.$checkboxInput = $(this.prixVenteMagasin[index]);
      this.$checkboxInput.prop('disabled', disable)
      this.updateMagasin(index, 'alone_price', update);
  }

  onUpdate = () => {

    this.$nameVariante = $(this.nameVariante);

    if(this.state.emptyName === false){
      close =  document.getElementsByClassName('close');
      this.props.updateVariante(this.props.indexVariante, this.state.currentVariante);
      this.$nameVariante.parent().parent().removeClass('has-error')
      $(close).trigger('click');
    }else{
      this.$nameVariante.parent().parent().addClass('has-error')
    }
  }

  onSave = () => {

    this.$nameVariante = $(this.nameVariante);

    if(this.state.emptyName === false){
      close =  document.getElementsByClassName('close');
      this.$nameVariante.parent().parent().removeClass('has-error')
      this.props.updateVariante(this.state.currentVariante);
      $(close).trigger('click');
    }else{
      this.$nameVariante.parent().parent().addClass('has-error')
    }

  }


  render(){
    return (
      <div>
          <div className="modal-header clearfix text-left">
            <button type="button" className="close" data-dismiss="modal" aria-hidden='true'><i className='pg-close fs-14'></i></button>
            <h5 className="modal-title">Editer la variante</h5>
            <p>

            </p>
          </div>
          <div className="modal-body height-fixed" >

                <div className='col-md-10' style={{ margin: 'auto'}}>

                      <div className='d-flex justify-content-center flex-column m-t-40'>

                            <div className='form-table form-table--with-spacing'>
                                <div className="form-group row">
                                    <label className='col-md-3 control-label form-field__label'>Nom de la variante</label>
                                    <div className="col-md-9 form-field__content">
                                          <input type='text' className='form-control form-field__input' defaultValue={this.state.currentVariante.name} onChange={(event) => this.updateNameVariante(event)} ref={el => this.nameVariante = el}/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className='col-md-3 control-label form-field__label'>Prix standard</label>
                                    <div className="col-md-9">
                                      <input type='text' className='form-control form-field__input numeric_dec' defaultValue={this.state.currentVariante.prix_vente}  ref={el => this.prix_vente_variante = el}  data-a-sep=" " data-v-min="0"  data-v-max="999999999999"/>
                                    </div>
                                </div>
                            </div>

                            {this.state.currentVariante.magasin.map((magSyst, index_data) => {

                              if(magSyst.show){
                                return (

                                  <div key={index_data}>

                                        <hr />
                                        <div className="checkbox check-success">
                                            <input type="checkbox" id={index_data} defaultValue={magSyst.id} defaultChecked={magSyst.active} onChange={(event) => this.updateDisponibleMagasin(event, index_data)}/>
                                            <label htmlFor={index_data}>Suivi du stock dans { magSyst.mag_name }</label>
                                        </div>

                                        <div className='form-table form-table--with-spacing'>
                                            <div className="form-group row">
                                                <label className='col-md-3 control-label form-field__label'>Prix de vente</label>
                                                <div className="col-md-7 no-padding">
                                                  <input type='text' className='form-control form-field__input numeric_dec' defaultValue={magSyst.prix_vente} disabled={!magSyst.alone_price} data-a-sep=" " data-v-min="0"  data-v-max="999999999999" ref={el => this.prixVenteMagasin[index_data] = el}/>
                                                </div>
                                                <div className="col-md-2 form-field__content">
                                                    <div className="form-link--with-spacing">
                                                        <Switch
                                                                className="switch-class"
                                                                onChange={(event) => this.activePrice(event, index_data)}
                                                                options={
                                                                  {
                                                                    color: '#10CFBD',
                                                                    size: 'medium'
                                                                  }
                                                                }
                                                                checked={magSyst.alone_price}

                                                          />

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className='col-md-3 control-label form-field__label'>Stock actuel</label>
                                                <div className="col-md-9 form-field__content">
                                                        <span className="form-link--with-spacing">{magSyst.stock}</span>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className='col-md-3 control-label form-field__label'>Notification de stock réduit</label>
                                                <div className="col-md-7 no-padding">
                                                  <input type='text' className='form-control form-field__input numeric_dec' defaultValue={magSyst.stock_alert} disabled={!magSyst.alert} data-a-sep=" " data-v-min="0"  data-v-max="999999999999" ref={el => this.notification[index_data] = el}/>
                                                </div>
                                                <div className="col-md-2 form-field__content">
                                                    <div className="form-link--with-spacing">
                                                        <Switch
                                                                className="switch-class"
                                                                onChange={(event) => this.activeNotification(event, index_data)}
                                                                options={
                                                                  {
                                                                    color: '#10CFBD',
                                                                    size: 'medium'
                                                                  }
                                                                }
                                                                checked={magSyst.alert}

                                                          />

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                  </div>

                                )
                              }


                            }

                            )}


                      </div>

                </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default float-left" data-dismiss="modal">Close</button>
            <button type="button" hidden={this.props.buttonSave === 'save'} className="btn btn-primary" onClick={this.onUpdate}>Modifier</button>
            <button type="button" hidden={this.props.buttonSave === 'update'} className="btn btn-primary" onClick={this.onSave}>Enregistrer</button>
          </div>
      </div>
    )
  }
}

export default UpdateVariante
