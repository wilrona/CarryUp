import React, { Component } from "react";

class LigneItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data : {...this.props.data},
      showAlertExist: false,
      oldValueSelect : null
    }

  }

  componentDidMount = () => {

    const react = this
    this.$select = $(this.select);
    this.$qte = $(this.qte);
    this.$achat = $(this.achat)

    const magasin = document.getElementById('magasin_origine')

    this.$select.select2();

    this.$qte.autoNumeric('init', {
      wEmpty: 'zero',
      lZero: 'deny'
    });

    this.$achat.autoNumeric('init', {
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
              });

            }else{

              let $curVal = react.$qte.val();
              $curVal = $curVal.split(' ');
              $curVal = $curVal.join('');

              let $valeurAchat = react.$achat.val()
              $valeurAchat = $valeurAchat.split(' ');
              $valeurAchat = $valeurAchat.join('');

              const data = {
                'id' : valeur,
                'quantite' : $curVal,
                'prix_vente' : $valeurAchat,
                'montant' :  parseFloat($curVal) * parseFloat($valeurAchat),
                'select' : true
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

          let $valeurAchat = react.$achat.val()
          $valeurAchat = $valeurAchat.split(' ');
          $valeurAchat = $valeurAchat.join('');

          const data = {
            'id' : valeur,
            'quantite' : $curVal,
            'prix_vente' : $valeurAchat,
            'montant' :  parseFloat($curVal) * parseFloat($valeurAchat),
            'select' : true
          }

          react.fetchCheck(data)
        }


    })

    this.$qte.on('keyup', function(){
        let valeur = $(this).val().length !== 0 ? $(this).val() : 0;

        let $curVal = valeur;
        $curVal = $curVal.split(' ');
        $curVal = $curVal.join('');

        let $valeurAchat = react.$achat.val()
        $valeurAchat = $valeurAchat.split(' ');
        $valeurAchat = $valeurAchat.join('');

        const data = {
          'id' : react.$select.val(),
          'quantite' : $curVal,
          'prix_vente' : $valeurAchat,
          'montant' :  parseFloat($curVal) * parseFloat($valeurAchat),
          'select' : false
        }

        react.fetchCheck(data)
    })

    this.$achat.on('keyup', function(){
        let valeur = $(this).val().length !== 0 ? $(this).val() : 0;

        let $curVal = valeur;
        $curVal = $curVal.split(' ');
        $curVal = $curVal.join('');

        let $valeurA = react.$qte.val()
        $valeurA = $valeurA.split(' ');
        $valeurA = $valeurA.join('');

        const data = {
          'id' : react.$select.val(),
          'quantite' : $valeurA,
          'prix_vente' : $curVal,
          'montant' :  parseFloat($curVal) * parseFloat($valeurA),
          'select' : false
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
        newState.data.prix_vente = data.prix_vente
        newState.data.montant = data.montant
        newState.data.magasin = data.magasin
      }else{
        newState.data.name = null
        newState.data.id = null
        newState.data.quantite = 0
        newState.data.prix_vente = 0
        newState.data.montant = 0
        newState.data.magasin = []
      }


      if(datajson.select === true){
        this.$achat.val(data.prix_vente)
      }

      this.setState(newState, () => {
        if (this.props.action === 'add' && !$.isEmptyObject(data)){
          console.log(this.state.data);
          this.props.updateData(this.props.index, data.id, 'id')
          this.props.updateData(this.props.index, data.name, 'name')
          this.props.updateData(this.props.index, data.quantite, 'quantite')
          this.props.updateData(this.props.index, data.prix_vente, 'prix_vente')
          this.props.updateData(this.props.index, data.montant, 'montant')
          this.props.updateData(this.props.index, data.magasin, 'magasin')
        }
      })


    });

  }

  update = (e, index) => {
    e.preventDefault();
    console.log(this.state.data);
    if(this.state.data.id === null || this.state.data.name === null){
      swal({
          title: 'Information article vide.',
          text: 'Les modifications ne peuvent pas etre prise en compte',
          type: 'error'
      });
    }else{
      if(this.state.data.quantite === 0){
        swal({
            title: 'Quantite indefinie.',
            text: 'La valeur doit etre superieur a zero ',
            type: 'error'
        });
      }else{
        if(this.state.data.prix_vente === 0){
          swal({
              title: 'Prix de vente indefini.',
              text: 'La valeur doit etre superieur a zero ',
              type: 'error'
          });
        }else{
          this.props.deleteButton(index, this.state.data)
        }
      }
    }
  }

  render = () => {

    return (
            <table className="table table-line table-condensed articles-lines" id={this.props.index}>
              <tbody>
                  <tr>
                    <td style={{ width:'40%' }} className="no-padding fieldSelect">
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

                          <input type="text" name="quantite" ref={el => this.qte = el} defaultValue={this.state.data.quantite} className="form-control text-right" data-a-sep=" " data-v-min="0" data-v-max="999999999999" />


                    </td>
                    <td className="text-right" style={{ width:'20%' }}>

                          <input type="text" name="prix_vente" ref={el => this.achat = el} defaultValue={this.state.data.prix_vente} className="form-control text-right" data-a-sep=" " data-v-min="0" data-v-max="999999999999" />


                    </td>
                    <td className="text-right" style={{ width:'20%' }}>
                          {this.state.data.montant}
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
