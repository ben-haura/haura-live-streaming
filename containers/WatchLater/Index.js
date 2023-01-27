import React from "react"
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index";

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            item: props.item
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if (nextProps.item.watchlater_id != prevState.item.watchlater_id) {
            return { item: nextProps.item }
        } else{
            return null
        }
    }
    onChange = (e) => {
        e.preventDefault()
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            const formData = new FormData()
            formData.append('id', this.props.id)
            let url = '/watch-later'
            if(this.props.typeWatchLater == "movie-series"){
                formData.append("type",'movie-series');
            }
            axios.post(url, formData)
                .then(response => {

                }).catch(err => {
                    //this.setState({submitting:false,error:err});
                });
        }
    }
    render() {
        if (this.props.pageData.appSettings[`video_watchlater`] != 1 && this.props.typeWatchLater != "movie-series") {
            return null
        }
        return (
            this.props.pageData.loggedInUserDetails && this.state.item.watchlater_id ?
                this.props.icon ?
                    <a onClick={this.onChange} title={Translate(this.props, "Watch Later")} className={`active${this.props.className ? " " + this.props.className : ""}`}><span className="material-icons-outlined" data-icon="watch_later"></span></a>
                    :
                    <button onClick={this.onChange} type="button" title={Translate(this.props, "Watch Later")} className="btn btn-outline-secondary btn-sm watchlater active"><span className="material-icons-outlined" data-icon="watch_later"></span>
                        {this.props.t("Watch Later")}
                    </button>
                :
                this.props.icon ?
                    <a className={`${this.props.className ? this.props.className : ""}`} title={Translate(this.props, "Watch Later")} onClick={this.onChange}><span className="material-icons-outlined" data-icon="watch_later"></span></a>
                    :
                    <button onClick={this.onChange} type="button" title={Translate(this.props, "Watch Later")} className="btn btn-outline-secondary btn-sm watchlater"><span className="material-icons-outlined" data-icon="watch_later"></span>
                        {this.props.t("Watch Later")}
                    </button>
        )
    }
}


export default Index