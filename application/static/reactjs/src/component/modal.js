import React, { Component } from "react";
import { render } from "react-dom";
import PropTypes from 'prop-types';


class Modal extends Component {
  constructor(props) {
      super(props);
  }

  componentDidMount = () => {
      this.$modal = $(this.modal);
      $(this.$modal).modal('show');
      $(this.$modal).on('hidden.bs.modal', this.props.handleHideModal);
  }

  render(){
    return (
      <div className="modal disable-scroll" ref={el => this.modal = el} tabIndex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content">
                {this.props.body()}
              </div>
        </div>
      </div>
    );
  }
}

export default Modal;
