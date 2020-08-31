import React, { Component } from "react";
import { render } from "react-dom";

class ListeCourse extends Component {

  constructor(props) {

    super(props)



  }

  render(){
    let cout = 0;
    return (

      <div>
          <div className="modal-header clearfix text-left">
            <button type="button" className="close" data-dismiss="modal" aria-hidden='true'><i className='pg-close fs-14'></i></button>
            <h5 className="modal-title">Liste des courses</h5>
            <p>

            </p>
          </div>

          <div className="modal-body height-fixed" >

              <table className="table table-condensed m-t-20">
                <thead>
                  <tr>
                    <th style={{width:'40%'}}>Articles</th>
                    <th className="text-right"  style={{ width:'20%' }}>Qte(Piece)</th>
                    <th className="text-right"  style={{ width:'20%' }}>Qte(Gr)</th>
                    <th className="text-right"  style={{ width:'20%' }}>Cout</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.listeCourse.map((data, index) => {
                      cout += data.cout
                      return (
                        <tr key={index}>
                          <td>{data.article}</td>
                          <td className="text-right">{data.qte_piece}</td>
                          <td className="text-right">{data.qte_gr}</td>
                          <td className="text-right">{data.cout}</td>
                        </tr>
                      )
                  })}
                  <tr>
                      <td colSpan="3" className="text-right text-bold">Total</td>
                      <td className="text-right">{cout}</td>
                  </tr>
                </tbody>
              </table>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-default float-left" data-dismiss="modal">Fermer</button>
          </div>
      </div>


    )
  }


}

export default ListeCourse
