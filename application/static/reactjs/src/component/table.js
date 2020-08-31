import React, { Component } from 'react';

class DataTable extends Component{

    constructor(props) {
        super(props);

        this.state = {
            data : [],
            per: this.props.per ? this.props.per : 10,
            page: 1,
            total_pages: null,
            query : '',
            loading: true,
            defaultSort: '',
            order: 'asc',
            header : this.props.header,
            actionEdit : this.props.actionEdit ? this.props.actionEdit : false,
            actionView : this.props.actionView ? this.props.actionView : false
        };


    }

    componentWillMount(){
        this.fetchAll();
        window.addEventListener("scroll", e => {
            this.handleScroll(e);
        });
    };

    componentDidUpdate(oldProps, oldState) {
        const newProps = this.props.search;
        if(oldProps.search !== newProps){
            oldState.query = newProps ? newProps : '';
            oldState.page = 1;
            oldState.order = 'asc';
            oldState.header = this.props.header
            // oldState.loading = true;
            this.fetchAll();
        }
    }

    handleScroll = () => {
      let lastLi = document.querySelector("table > tr:last-child");
      let lastLiOffset = lastLi.offsetTop + lastLi.clientHeight;
      let pageOffset = window.pageYOffset + window.innerHeight;

      if (pageOffset > lastLiOffset){
          this.loadMore();
      }
    };

    loadMore = () => {
        this.setState(
            prevState => (
                {
                    page: prevState.page + 1,
                    scrolling: true
                }
            ),
            this.fetchAll()
        )
    };

    fetchAll = () => {

        let load = false;
        let index = null;

        this.state.header.map(head =>
            {
                if(head.showDefault){
                    if(head.sortable && head.sortDefault){
                        index = head.index;
                        load = true;
                    }
                }

            }

        );

        if (load){
            this.setState({
                defaultSort : index
            },() => {
                this.queryFetch(this.state)
            });
        }else{
            this.queryFetch(this.state)
        }
    };

    queryFetch = (state) => {
        const { per, page, query, defaultSort, order } = state;

        fetch(this.props.linkList+"?per="+per+"&page="+page+"&q="+query+"&sort="+defaultSort+"&order="+order)
            .then(results => {
                return results.json()
            })
            .then(data => {
                this.setState({
                    data : [...data, ...data.data],
                    scrolling: false,
                    total_page : data.total_page,
                    loading: false,
                    defaultSort : data.sort,
                    order: data.order
                });
                console.log(this.state.data);
            });
    };

    sortable = (e, index) => {

        let newsHeader = this.state.header;
        newsHeader.map(head =>
            {
                if(head.showDefault){
                    if(head.index === index){
                        head.sortDefault = true
                    }else{
                        head.sortDefault = false
                    }
                }

            }

        );


        if(e.target.classList.contains('sorting_asc')){
            let th = e.currentTarget.parentElement.getElementsByTagName('th');
            for (let i = 0; i < th.length; i++) {
                if(th[i].classList.contains('sorting_desc') || th[i].classList.contains('sorting_asc')){
                    th[i].classList.remove('sorting_desc');
                    th[i].classList.remove('sorting_asc');
                    th[i].classList.add('sorting');
                }

            }
            e.target.classList.remove('sorting');
            e.target.classList.add('sorting_desc');

            this.setState({
                header : newsHeader,
                order: 'desc'
            }, this.fetchAll())


        }
        else{

            if(e.target.classList.contains('sorting_desc')){

                let th = e.currentTarget.parentElement.getElementsByTagName('th');
                for (let i = 0; i < th.length; i++) {
                    if(th[i].classList.contains('sorting_desc') || th[i].classList.contains('sorting_asc')){
                        th[i].classList.remove('sorting_desc');
                        th[i].classList.remove('sorting_asc');
                        th[i].classList.add('sorting');
                    }
                }

                e.target.classList.remove('sorting');
                e.target.classList.add('sorting_asc');

                this.setState({
                    header : newsHeader,
                    order: 'asc'
                }, this.fetchAll())
            }

            if(e.target.classList.contains('sorting')){

                let th = e.currentTarget.parentElement.getElementsByTagName('th');
                for (let i = 0; i < th.length; i++) {
                    if(th[i].classList.contains('sorting_desc') || th[i].classList.contains('sorting_asc')){
                        th[i].classList.remove('sorting_desc');
                        th[i].classList.remove('sorting_asc');
                        th[i].classList.add('sorting');
                    }
                }

                e.target.classList.remove('sorting');
                e.target.classList.add('sorting_asc');

                this.setState({
                    header : newsHeader,
                    order: 'asc'
                }, this.fetchAll())
            }
        }

    };

    emptyTable(){
        return(
            <div className="no-data sm-p-t-30">
                <div className="d-flex justify-content-center flex-column m-t-50 m-b-50">
                    <div className="dz-default dz-message">
                        <i className="fa fa-database"></i>
                        <h3>{this.props.emptyMessage ? this.props.emptyMessage : 'Aucune information'}</h3>
                    </div>
                </div>
            </div>
        )
    }

    contentTable = () => {
        let sortDefault = 0;

        if(this.state.loading){
          return (
            <div className="col-md-12 text-center">
              <div className="progress-circle-indeterminate m-t-45">
              </div>
            </div>

          )
        }

        return(
            <table className="table dataTable">
                <thead>
                    <tr>
                        {this.state.header.map((head, index) =>
                            {
                                if(head.showDefault){
                                    let className;
                                    head.sortable && head.sortDefault ? sortDefault += 1 : sortDefault;
                                    className = head.className ? head.className : '';
                                    className += head.sortDefault && sortDefault === 1 ? ' sorting_asc' : '';
                                    className += head.sortable && !head.sortDefault ? ' sorting' : '';
                                    className += head.sortable && head.sortDefault && sortDefault !== 1? ' sorting' : '';

                                    return (
                                        <th className={className} key={index} onClick={(event) => this.sortable(event, head.index)}>{head.name ? head.name : head.index}</th>
                                    )
                                }

                            }

                        )}
                        <th style={{ width: "13%", textAlign: 'center'}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                {this.state.data.map((data, index_data) =>
                    {
                        let color_active;
                        if(data.active){
                           color_active = 'dropdown-item text-danger'
                        }else{
                           color_active = 'dropdown-item text-success'
                        }
                        return (
                            <tr key={index_data}>

                                {this.props.header.map((head, index) =>
                                    {
                                        if(head.showDefault){
                                            let className;
                                            let value;
                                            className = head.className ? head.className : '';
                                            value  = typeof data[head.index]  === 'object' && data[head.index] ? data[head.index][head.subIndex] : data[head.index];
                                            return (
                                                <td key={index} className={className}>{value}</td>
                                            )
                                        }
                                    }

                                )}
                                <td>
                                  <div className="dropdown dropdown-default" style={{width: '100%'}}>
                                          <button className="btn btn-dropdown btn-sm btn-block" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{width: '100%', border: 'none'}}>
                                                <i className='pg-more'></i>
                                          </button>
                                          <div className="dropdown-menu" x-placement="bottom-start">
                                              {this.state.actionEdit ? <a href={data.uri_edit} className='dropdown-item'>Modifier</a> : ''}
                                              {this.state.actionView ? <a href={data.uri_view} className='dropdown-item'>Consulter</a> : ''}
                                              {data.uri_active ? <a href={data.uri_active} className={color_active}>{data.active ? 'Desactiver' : 'Activer'}</a> : ''}
                                          </div>
                                  </div>
                                </td>
                            </tr>
                        )
                    }
                )}
                </tbody>
            </table>
        )
    };

    render() {

        let tableContent;

        if(!this.state.loading){
            if(this.state.data.length){
                tableContent = this.contentTable();
            }else{
                tableContent = this.emptyTable();
            }
        }

        return (
            <div className="m-t-20">
                {tableContent}
            </div>
        )
    }
}

export default DataTable;
