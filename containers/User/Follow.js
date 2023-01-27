import React from "react"
import axios from "../../axios-orders"

class Follow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            item: props.user
        }
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.user.follower_id != prevState.item.follower_id) {
            return { item: nextProps.user }
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
            if (!this.props.user.channel_id)
                formData.append('id', this.props.user.user_id)
            else if (this.props.user.channel_id)
                formData.append('id', this.props.user.channel_id)
            formData.append('type', this.props.type)
            let url = '/follow'
            axios.post(url, formData)
                .then(response => {
                    if (response.data.error) {

                    } else {

                    }
                }).catch(err => {
                    //this.setState({submitting:false,error:err});
                });
        }
    }
    render() {
        if(this.props.pageData.appSettings['user_follow'] != 1 && this.props.type != "channels"){
           return null;
        }
        let onChange = this.onChange
        if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == (this.state.item.user_id ? this.state.item.user_id : this.state.item.owner_id)) {
            onChange = null
            if(!this.props.fromView){
                return  <a className={this.props.className ? this.props.className : "follow"} style={{ opacity: "0",display:this.props.hideButton ? "none" : "" }}  href="#">{this.props.title ? this.props.title : this.props.t("Following")}</a>
            }else{
                return null
            }
        }
        

        
            

        return (
            this.props.pageData.loggedInUserDetails && this.state.item.follower_id ?
                this.props.nolink ?
                    <span className={"follow-member"} onClick={onChange}  href="#">{this.props.title ? this.props.title : this.props.t("Following")}</span>
                :
                !this.props.button ?
                    <a className={this.props.className ? this.props.className + " active" : "follow active"} onClick={onChange}  href="#">{this.props.title ? this.props.title : this.props.t("Following")}</a>
                    :
                    <a className="follow active" onClick={onChange} href="#">{this.props.title ? this.props.title : this.props.t("Following")}</a>
            :
                this.props.nolink ?
                    <span className={"follow-member"} onClick={onChange}  href="#">{this.props.title ? this.props.title : this.props.t("Follow")}</span>
                :
                !this.props.button ?
                    <a className={this.props.className ? this.props.className : "follow"} onClick={onChange} href="#">{this.props.title ? this.props.title : this.props.t("Follow")}</a>
                    :
                    <a className="follow" onClick={onChange} href="#">{this.props.title ? this.props.title : this.props.t("Follow")}</a>
        )
    }
}


export default Follow