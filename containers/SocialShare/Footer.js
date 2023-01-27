import React, { Component } from 'react';
import { connect } from 'react-redux';
import Links from "./Links"
import config from "../../config"
import action from '../../store/actions/general'
import CensorWord from "../CensoredWords/Index"

class Index extends Component {
  constructor(props){
      super(props)
      this.state = {
          ...props.shareData
      }
      this.closeEditPopup = this.closeEditPopup.bind(this)
  }
 
  closeEditPopup(){
    this.props.openSharePopup(false,{})
  }
  onClickCopy = (value,e) => {
    e.preventDefault();
    var textField = document.createElement('textarea')
    textField.innerText = value
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
    this.setState({copied:true})
    var _ = this
    setTimeout(() => {
        _.setState({copied:false})
    },2000)
    
  }
  render() {
    let isS3 = true
    
    let shareUrl = config.app_server+this.state.url;
    const title = this.state.title;
    if(this.props.pageData.loggedInUserDetails){
        shareUrl = shareUrl+"?ref="+this.props.pageData.loggedInUserDetails.user_id
    }
    
    let media = this.state.media
    if(this.props.pageData.livestreamingtype == 0  &&  this.state.media && this.state.media.indexOf(`${this.props.pageData.streamingAppName}/previews`) > 0){
        if(this.props.pageData.liveStreamingCDNURL){
            media = this.props.pageData.liveStreamingCDNURL+this.state.media.replace(`/LiveApp`,'').replace(`/WebRTCAppEE`,'')
        }else
            media = this.props.pageData.liveStreamingServerURL+":5443"+this.state.media
    }
    if (this.state.media) {
        const splitVal = media.split('/')
         if (splitVal[0] == "http:" || splitVal[0] == "https:") {
            isS3 = false
        }
    }
    media = (isS3 ? this.state.imageSuffix : "")+media
    const emailTitle = title
    const emailBody = "Email Body"
    return (
            <div className="popup_wrapper_cnt">
                <div className="popup_cnt">
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{this.props.t("Share")}</h2>
                                <a onClick={this.closeEditPopup}  className="_close"><i></i></a>
                            </div>
                            <div className="shareVdoInfo">
                                <div className="thumb">
                                    <img className="" src={media} />
                                </div>
                                <div className="name">
                                    <h3>{<CensorWord {...this.props} text={this.state.title} />}</h3>
                                    <div className="share-input">
                                        <input type="text" className="form-control" value={shareUrl} readOnly />
                                        <a href="#" onClick={(e) => this.onClickCopy(shareUrl,e)}>{this.props.t("Copy")}</a>
                                    </div>
                                    {
                                        this.state.copied ?
                                        <p className="success">
                                            {
                                                this.props.t("Copied!")
                                            }
                                        </p>
                                        : null
                                    }
                                </div>
                            </div>
                            <Links tags={this.state.tags}  countItems="all" url={shareUrl} title={title} media={media} emailTitle={emailTitle} emailBody={emailBody} />
                        </div>
                    </div>
                </div>
            </div>
        );
  } 
}

const mapDispatchToProps = dispatch => {
    return {
        openSharePopup: (status,data) => dispatch(action.openSharePopup(status,data)),
    };
};



export default connect(null, mapDispatchToProps)(Index)