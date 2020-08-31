import React, { Component } from "react";

class LigneItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data : {...this.props.data},
      showAlertExist: false,
      oldValueSelect: null
    }

  }

  componentDidMount = () => {

    const react = this
    this.$select = $(this.select);
    this.$qte = $(this.quantite);

    const magasin = document.getElementById('magasin_origine')

    this.$select.select2();

    this.$qte.autoNumeric('init', {
      wEmpty: 'zero',
      lZero: 'deny'
    });

    this.setState({
      oldValueSelect : this.$select.val()
    })

    this.$select.on('change', function(){
        let valeur = $(this).val().length !== 0 ? $(this).val() : null;

        if(react.props.currentSelect.length > 0){

          if(valeur){

            if(react.props.currentSelect.includes(valeur)){

              swal({
                  title: 'Articles existant.',
                  text: 'Le produit se existe deja. Vous ne pouvez plus l\'utiliser.',
                  type: 'error',
                  showConfirmButton: true,
                  confirmButtonText: 'OK'

              }, function(){
                react.$select.val(react.state.data.id);
                react.$select.trigger('change')
              })

            }else{

              let $curVal = react.$qte.val();
              $curVal = $curVal.split(' ');
              $curVal = $curVal.join('');

              const data = {
                'id' : valeur,
                'quantite' : $curVal
              }

              if(react.state.data.id){
                const index = react.props.currentSelect.indexOf(react.state.oldValueSelect);
                react.props.currentSelect.splice(index, 1);
                react.props.currentSelect.push(valeur)
              }

              react.fetchCheck(data)

            }

          }else{

            if(react.state.data.id){

              swal({
                  title: 'Articles vide.',
                  text: 'Les informations de l\'article ne doivent pas etre vide',
                  type: 'error',
                  showConfirmButton: true,
                  confirmButtonText: 'OK'

              }, function(){
                react.$select.val(react.state.oldValueSelect);
                react.$select.trigger('change')
              })

            }
          }


        }else{

          let $curVal = react.$qte.val();
          $curVal = $curVal.split(' ');
          $curVal = $curVal.join('');

          const data = {
            'id' : valeur,
            'quantite' : $curVal
          }

          react.fetchCheck(data)
        }


    })

    this.$qte.on('keyup', function(){
        let valeur = $(this).val().length !== 0 ? $(this).val() : 0;

        let $curVal = valeur;
        $curVal = $curVal.split(' ');
        $curVal = $curVal.join('');

        const data = {
          'id' : react.$select.val(),
          'quantite' : $curVal
        }

        react.fetchCheck(data)
    })

  }

  fetchCheck = (datajson) => {

    const options = {
      method : 'POST',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json',},
      body : JSON.stringify(datajson)
    }

    const magasin = document.getElementById('magasin_origine');

    fetch(this.props.check+'?magasin_origine='+$(magasin).val(), options)
    .then(results => {
        return results.json()
    })
    .then(data => {

      let newState =  Object.assign({}, this.state);

      if(!$.isEmptyObject(data)){
        newState.data.name = data.name
        newState.data.id = data.id
        newState.data.quantite = data.quantite
        newState.data.stock = data.stock
        newState.data.magasin = data.magasin
      }else{
        newState.data.name = null
        newState.data.id = null
        newState.data.quantite = 0
        newState.data.stock = 0
        newState.data.magasin = []
      }

      if(data.stock < 0){
        data.stock = 0
      }

      if(newState.data.quantite > data.stock){
        this.$qte.val(data.stock)
        newState.data.quantite = data.stock
        data.quantite = data.stock
      }

      this.setState(newState, () => {
        if (this.props.action === 'add' && !$.isEmptyObject(data)){
          console.log(this.state.data);
          this.props.updateData(this.props.index, data.id, 'id')
          this.props.updateData(this.props.index, data.name, 'name')
          this.props.updateData(this.props.index, data.quantite, 'quantite')
          this.props.updateData(this.props.index, data.stock, 'stock')
          this.props.updateData(this.props.index, data.magasin, 'magasin')
        }
      })

      this.$qte.autoNumeric('update', {
                                        vMax : data.stock
                                    });


    });

  }

  update = (e, index) => {
    e.preventDefault();
    if(this.state.data.id === null || this.state.data.name === null){
      swal({
          title: 'Information article vide.',
          text: 'Les modifications ne peuvent pas etre prise en compte',
          type: 'error'
      });
    }else{
      if(this.state.data.quantite == 0){
        swal({
            title: 'Quantite indefinie.',
            text: 'La valeur doit etre superieur a zero ',
            type: 'error'
        });
      }else{
        this.props.deleteButton(index, this.state.data)
      }

    }
  }

  render = () => {

    return (
            <table className="table table-line table-condensed articles-lines" id={this.props.index}>
              <tbody>
                  <tr>
                    <td style={{ width:'60%' }} className="no-padding fieldSelect">
                        <select name="item" className="form-control" ref={el => this.select = el} defaultValue={this.state.data.id}>
                            <option value="">Choix de l'article</option>
                            {
                              this.props.allMatiere.map((mat, index) => {
                                return(
                                  <option key={index} value={mat.id}>{mat.name_variante}</option>
                                )
                              })
                            }
                        </select>
                    </td>
                    <td className="text-right" style={{ width:'20%' }}>

                          { this.state.data.stock }


                    </td>
                    <td className="text-right" style={{ width:'20%' }}>

                          <input type="text" name="prix_achat" ref={el => this.quantite = el} defaultValue={this.state.data.quantite} className="form-control text-right" data-a-sep=" " data-v-min="0" data-v-max="999999999999" />


                    </td>
                    <td className='head-position-absolute'>
                        {this.props.action === 'update' ? <a href='' className="text-success" onClick={(event) => this.update(event, this.props.index)}><i className="fa fa-check"> </i> </a> : null}
                        {this.props.action === 'add' ? <a href='' className='text-primary' onClick={(event) => this.props.deleteButton(event, this.props.index)}><i className="fa fa-trash"> </i> </a> : null}
                    </td>
                  </tr>
              </tbody>
          </table>

      )
  }
}


export default LigneItem;
