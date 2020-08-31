import React, { Component } from "react";

class LigneItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data : {...this.props.data},
      showAlertExist: false
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

    this.$select.on('change', function(){
        let valeur = $(this).val().length !== 0 ? $(this).val() : null;

        if(react.props.currentSelect.length > 0){
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

            react.fetchCheck(data)

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
          newState.data.name = data.name
          newState.data.id = data.id
          newState.data.quantite = data.quantite

          this.setState(newState, () => {
            if (this.props.action === 'add' && !$.isEmptyObject(data)){
              console.log(this.state.data);
              this.props.updateData(this.props.index, data.id, 'id')
              this.props.updateData(this.props.index, data.name, 'name')
              this.props.updateData(this.props.index, data.quantite, 'quantite')
          }

        });

      })
  }

  update = (e, index) => {
    e.preventDefault();
    this.props.deleteButton(index, this.state.data)
  }

  render = () => {

    return (
            <table className="table table-line table-condensed articles-lines" id={this.props.index}>
              <tbody>
                  <tr>
                    <td style={{ width:'60%' }} className="fieldSelect">
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
                    <td className="text-right" style={{ width:'40%' }}>

                          <input type="text" name="quantite" ref={el => this.qte = el} defaultValue={this.state.data.quantite} className="form-control text-right" data-a-sep=" " data-v-min="0" data-v-max="999999999999" />


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
