import React, { Component } from "react";

class LigneItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data : {...this.props.data},
      showAlertExist: false,
      oldValueSelectSemi : null,
      oldValueSelectFini : null
    }

  }

  componentWillMount = () => {

  }

  componentDidMount = () => {

    const react = this
    this.$select = $(this.select);
    this.$select_fini = $(this.select_fini);
    this.$qte = $(this.quantite);

    const magasin = document.getElementById('magasin_origine')

    this.$select.select2();
    this.$select_fini.select2();

    this.$qte.autoNumeric('init', {
      wEmpty: 'zero',
      lZero: 'deny'
    });

    this.setState({
      oldValueSelectSemi : this.$select.val(),
      oldValueSelectFini : this.$select_fini.val()
    })

    this.$select.on('change', function(){

        let valeur = $(this).val().length !== 0 ? $(this).val() : null;

        if(valeur){

          let $curVal = react.$qte.val();
          $curVal = $curVal.split(' ');
          $curVal = $curVal.join('');

          const data = {
            'id' : valeur,
            'quantite' : $curVal
          }

          react.fetchCheck(data)

        }else{

          if(react.state.data.id){

            swal({
                title: 'Articles Semi vide.',
                text: 'Les informations de l\'article ne doivent pas etre vide',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'OK'

            }, function(){
              react.$select.val(react.state.oldValueSelectSemi);
              react.$select.trigger('change')
            })

          }

        }

    })

    this.$select_fini.on('change', function () {

      let valeur = $(this).val().length !== 0 ? $(this).val() : null;

      if(react.props.currentSelect.length > 0){

        if(valeur){

          let existing = false;

          react.props.currentSelect.map((data) => {
            if (data.id_semi == react.$select.val() && data.id_fini == valeur){
              existing = true;
            }
          });

          if(existing){

            swal({
                title: 'Articles/Combinaisons existant(e)s.',
                text: 'la combinaison existe deja. Vous ne pouvez plus l\'utiliser.',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'OK'

            }, function(){
              react.$select_fini.val(react.state.data.id_fini);
              react.$select_fini.trigger('change')
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
              react.props.currentSelect.map((head, index) => {
                if (head.id_semi == react.state.oldValueSelectSemi && head.id_fini == react.state.oldValueSelectFini){
                    react.props.currentSelect.splice(index, 1);
                }
              });

              const select = {
                id_semi : this.$select.val(),
                id_fini : valeur
              }
              react.props.currentSelect.push(select)
            }

            react.fetchCheck_fini(data)

          }

        }else{

          if(react.state.data.id){
            swal({
                title: 'Articles Fini vide.',
                text: 'Les informations de l\'article ne doivent pas etre vide',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'OK'

            }, function(){
              react.$select.val(react.state.oldValueSelectFini);
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

        react.fetchCheck_fini(data)

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

    const magasin_origine = document.getElementById('magasin_origine');
    const magasin = document.getElementById('magasin_destina');

    fetch(this.props.check+'?magasin_destina='+$(magasin).val()+'&magasin_origine='+$(magasin_origine).val(), options)
    .then(results => {
        return results.json()
    })
    .then(data => {

      let newState =  Object.assign({}, this.state);

      let stock = 0

      if($.isEmptyObject(data)){
        newState.data_fini = []

        newState.data.name_semi = null
        newState.data.id_semi = null
        newState.data.quantite = 0
        newState.data.stock = 0
        newState.data.global_stock = 0
        newState.data.magasin_semi = []
        newState.data.data_fini = []

      }else{

        newState.data.global_stock = data.stock

        stock = data.stock
        this.props.allData.map((head) => {
          if(head.id_semi == data.id_semi){
            stock = head.stock - head.quantite
          }
        })

        newState.data.data_fini = data.data_fini
        newState.data.name_semi = data.name_semi
        newState.data.id_semi = data.id_semi
        newState.data.quantite = data.quantite
        newState.data.stock = stock
        newState.data.magasin_semi = data.magasin_semi

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
          this.props.updateData(this.props.index, data.name_semi, 'name_semi')
          this.props.updateData(this.props.index, data.id_semi, 'id_semi')
          this.props.updateData(this.props.index, data.quantite, 'quantite')
          this.props.updateData(this.props.index, stock, 'stock')
          this.props.updateData(this.props.index, data.magasin_semi, 'magasin_semi')
          this.props.updateData(this.props.index, data.data_fini, 'data_fini')
          this.props.updateData(this.props.index, data.stock, 'global_stock')
        }
      })

      this.$qte.autoNumeric('update', {
                                        vMax : stock
                                    });


    });

  }

  fetchCheck_fini = (datajson) => {

    const options = {
      method : 'POST',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json',},
      body : JSON.stringify(datajson)
    }

    fetch(this.props.check, options)
    .then(results => {
        return results.json()
    })
    .then(data => {

      let newState =  Object.assign({}, this.state);

      if(!$.isEmptyObject(data)){
        newState.data.name_fini = data.name_fini
        newState.data.id_fini = data.id_fini
        newState.data.quantite = data.quantite
        newState.data.magasin_fini = data.magasin_fini
      }else{
        newState.data.name_fini = null
        newState.data.id_fini = null
        newState.data.quantite = 0
        newState.data.magasin_fini = []
      }

      this.setState(newState, () => {
        if (!$.isEmptyObject(data)){
          this.props.updateData(this.props.index, data.name_fini, 'name_fini')
          this.props.updateData(this.props.index, data.id_fini, 'id_fini')
          this.props.updateData(this.props.index, data.quantite, 'quantite')
          this.props.updateData(this.props.index, data.magasin_fini, 'magasin_fini')
        }
      })


    });


  }

  update = (e, index) => {
    e.preventDefault();
    if(this.state.data.id_fini === null || this.state.data.id_semi === null){
      swal({
          title: 'Information article '+ this.state.data.id_fini ? 'fini' : 'semi fini' +' vide.',
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
        this.props.deleteButton(index, this.state.data)
      }
    }
  }

  render = () => {

    return (
            <table className="table table-line table-condensed articles-lines" id={this.props.index}>
              <tbody>
                  <tr>
                    <td style={{ width:'30%' }} className="no-padding-lr fieldSelect">
                        <select name="item" className="form-control" ref={el => this.select = el} defaultValue={this.state.data.id_semi}>
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
                    <td style={{ width:'30%' }} className="no-padding-r fieldSelect">
                        <select name="item" className="form-control" ref={el => this.select_fini = el} defaultValue={this.state.data.id_fini}>
                            <option value="">Choix de l'article</option>
                            {
                              this.state.data.data_fini.map((mat, index) => {
                                return(
                                  <option key={index} value={mat.id}>{mat.name_variante}</option>
                                )
                              })
                            }
                        </select>
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
