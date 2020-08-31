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
    this.$qte = $(this.qte);


    this.$select.select2();

    this.$qte.autoNumeric('init', {
      wEmpty: 'zero',
      lZero: 'deny',
      mDec : 1
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
                  title: 'Recette complementaire existante.',
                  text: 'Le produit se trouve deja les recettes complementaires. Vous ne pouvez plus l\'utiliser.',
                  type: 'error',
                  showConfirmButton: true,
                  confirmButtonText: 'OK'

              }, function(){
                react.$select.val(react.state.data.id);
                react.$select.trigger('change')
              })
            }else {

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

    fetch(this.props.check, options)
    .then(results => {
        return results.json()
    })
    .then(data => {
      let newState =  Object.assign({}, this.state);

      if(!$.isEmptyObject(data)){
        newState.data.name = data.name
        newState.data.id = data.id
        newState.data.unite = data.unite
        newState.data.quantite = data.quantite
      }else{
        newState.data.name = null
        newState.data.id = null
        newState.data.unite = null
        newState.data.quantite = 0
      }


      this.setState(newState, () => {
        if (this.props.action === 'add' && !$.isEmptyObject(data)){
          this.props.updateMatiere(this.props.index, data.id, 'id')
          this.props.updateMatiere(this.props.index, data.name, 'name')
          this.props.updateMatiere(this.props.index, data.unite, 'unite')
        	this.props.updateMatiere(this.props.index, data.quantite, 'quantite')
        }
      })
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
                    <td style={{ width:'72%' }} className="no-padding fieldSelect">
                        <select name="item" className="form-control" ref={el => this.select = el} defaultValue={this.state.data.id}>
                            <option value="">Choix de l'article</option>
                            {
                              this.props.allMatiere.map((mat, index) => {
                                return(
                                  <option key={index} value={mat.id}>{mat.name}</option>
                                )
                              })
                            }
                        </select>
                    </td>
                    <td className="text-right" style={{ width:'30%' }}>
                        <div className="input-group">
                          <input type="text" name="quantite" ref={el => this.qte = el} defaultValue={this.state.data.quantite} className="form-control text-right" data-a-sep=" " data-v-min="0" data-v-max="999999999999" />
                          <div className="input-group-append">
                            <div className="input-group-text">{this.state.data.unite ? this.state.data.unite : '?'}</div>
                          </div>
                        </div>
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
