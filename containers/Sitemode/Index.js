import React from "react"
import { connect } from "react-redux";
import * as actions from '../../store/actions/general';

import axios from "../../axios-orders"
import SendMessageToApps from "../../components/SendMessageToApps/Index"

class Sitemode extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            modeChecked:props.pageData.themeMode == "dark"
        }
        
    }
   
    changeSiteMode = (e) => {
        e.preventDefault();
        let theme = this.props.themeType == "dark" ? "white" : (this.props.themeType ? "dark" : (this.props.pageData.themeMode == "dark" ? "white" : "dark"))
        this.props.setTheme(theme)
        //set site mode
        const data = { ...this.props.pageData }
        data.themeMode = theme
        const formData = new FormData()
        formData.append('mode', theme)
        
        SendMessageToApps({props:this.props,type:"themeModeChanged",theme:theme});

        if(theme == "dark"){
            let link = `<link id="custom-color-dark-css" href="/static/css/variable_dark.css?v=1656355657112" rel="stylesheet">`
            $(link).insertAfter("#custom-color-white-css");
        }else{
            $("#custom-color-dark-css").remove();
        }

        let url = '/members/theme-mode'
        axios.post(url, formData)
            .then(response => { 
                
        })
    }
    
    
    render(){

            if(!this.props.pageData.toogleMode){
                return false
            }
            return (
                <li>
                    <a className="dropdown-item iconmenu parent" style={{cursor:"pointer"}} href="#" onClick={this.changeSiteMode}>
                        {
                            !this.props.iconLast ? 
                                <span className="material-icons parent" data-icon="nights_stay"></span>
                        : null
                        }
                        {this.props.t("Mode")}
                        {
                            this.props.iconLast ? 
                                <span className="material-icons parent ml-2" data-icon="nights_stay"></span>
                            : null
                        }
                    </a>
                </li>
            )
    }
}



const mapStateToProps = state => {
    return {
        themeType: state.search.themeType
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setTheme: (status) => dispatch(actions.setTheme(status)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sitemode);