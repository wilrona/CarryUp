
import React, { Component } from 'react';
import { render } from "react-dom";

class Pin extends Component{

  constructor(props) {
      super(props);

      this.state = {
          code : '',
          placeholders : '',
          hideSubmit: true
      };

  }

  componentWillMount(){

    this.setState({
      placeholder : this.props.pin
    });

  }

  componentDidMount(){

    this.$pincode = $(this.pincode);
    this.$submit = $(this.submit);
    this.$alert = $(this.alert);
    this.$alertContent = $(this.alertContent);

    this.initCodePin();

  }

  initCodePin = () => {

    const react = this;

    this.$pincode.pincodeInput({hidedigits:true, inputs:4,  placeholders: this.state.placeholder, complete:function(value, e, errorElement){
          react.fetchCheckPin(value)
    }, change : function(input, value, inputnumber){
        if (value === ''){
          react.$alert.addClass('hidden');
          react.setState({
            code : '',
            hideSubmit : true
          });
        }
    }});

  }

  fetchCheckPin = (value) => {

        this.setState({
          code : value
        });

        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');

        const data = {
          'pin' : value
        }

        const options = {
          method : 'POST',
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json',},
          body : JSON.stringify(data)
        }

        fetch(this.props.url, options)
        .then(results => {
            return results.json()
        })
        .then(data => {
            this.$alert.removeClass('alert-'+data['alertRemove']).addClass('alert-'+data['alert']);
            if(data['statut'] == 'OK'){
               this.$alert.removeClass('hidden').addClass('show');
               this.$alertContent.html(data['message']);
               this.setState({
                 hideSubmit : false
               })
            }else {
              this.$alert.removeClass('hidden').addClass('show');
              this.$alertContent.html(data['message']);
              this.setState({
                hideSubmit : true
              })
            }
        });

  }

  fetchSubmit = event => {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const data = {
        'pin' : this.state.code
      }

      const options = {
        method : 'POST',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json',},
        body : JSON.stringify(data)
      }

      fetch(this.props.urlSave, options)
      .then(results => {
          return results.json()
      })
      .then(data => {
           this.$alert.removeClass('alert-danger').addClass('alert-success');
           this.$alert.removeClass('hidden').addClass('show');
           this.$alertContent.html(data['message']);
           this.setState({
             hideSubmit : true,
             placeholder: data['code']
           }, this.initCodePin())

      });
  }

  render(){
    return (
      <div>
          <div className="form-fieldset" >
              <div className="form-horizontal">
                  <div className="alert alert-dismissible fade hidden" ref={el => this.alert = el} role="alert">
                    <span ref={el => this.alertContent = el}></span>
                  </div>
                  <div className="form-table form-table--with-spacing">

                    <div className="form-group row">
                        <label className="col-md-3 control-label form-field__label">Code PIN</label>
                        <div className="col-md-9 bordered">
                          <input type="text" ref={el => this.pincode = el}/>
                        </div>
                    </div>

                  </div>
                  <button className="btn btn-primary btn-sm col-md-3" ref={el => this.submit = el} hidden={this.state.hideSubmit} onClick={this.fetchSubmit}>Modifier le code pin</button>

              </div>
          </div>
      </div>
    )
  }

}

const domContainer = document.getElementById('card_pinUser');

if (domContainer){

    const pin = domContainer.getAttribute('data-pin');
    domContainer.removeAttribute('data-pin');

    const urlCheckPin = domContainer.getAttribute('data-urlCheckPin');
    domContainer.removeAttribute('data-urlCheckPin');

    const urlSavePin = domContainer.getAttribute('data-urlSavePin');
    domContainer.removeAttribute('data-urlSavePin');

    render(
        <Pin pin={pin} url={urlCheckPin} urlSave={urlSavePin}/>,
        domContainer
    );

}
