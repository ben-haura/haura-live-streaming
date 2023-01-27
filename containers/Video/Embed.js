import React, { Component } from "react"
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators'
import axios from "../../axios-orders"
import dynamic from 'next/dynamic'

const Player = dynamic(() => import("./Player"), {
    ssr: false
  });
const OutsidePlayer = dynamic(() => import("./OutsidePlayer"), {
    ssr: false
  });
const StartLiveStreaming = dynamic(() => import("../LiveStreaming/StartLiveStreaming"), {
    ssr: false
  });
const MediaStreaming = dynamic(() => import("../LiveStreaming/MediaLiveStreaming"), {
    ssr: false
  });
import Router from 'next/router';
import Translate from "../../components/Translate/Index"
const MediaElementPlayer = dynamic(() => import("./MediaElementPlayer"), {
    ssr: false
  });
import Date from "../Date"
import Currency from "../Upgrade/Currency"

class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            styles: {
                visibility: "hidden",
                overflow: "hidden"
            }, 
            fullWidth: false,
            playlist: this.props.pageData.playlist,
            playlistVideos: this.props.pageData.playlistVideos,
            submitting: false,
            relatedVideos: this.props.pageData.relatedVideos,
            showMore: false,
            showMoreText: "See more",
            collapse: true,
            width:props.isMobile ? props.isMobile : 993,
            height:"-550px",
            adult: this.props.pageData.adultVideo,
            video: this.props.pageData.video,
            userAdVideo: this.props.pageData.userAdVideo,
            adminAdVideo: this.props.pageData.adminAdVideo,
            password: this.props.pageData.password,
            logout:false
        }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.getHeight = this.getHeight.bind(this)
    }
    updateWindowDimensions() {
        this.setState({localUpdate:true, width: window.innerWidth },() => {
            this.getHeight();
        });
    }
    getHeight(){
        if($('.videoPlayer').length && $(".videoPlayerHeight").length){
            let heightContainer = $(".videoPlayerHeight").outerWidth(true) - $(".lsVideoTop").height() - 30;
            let height = ((heightContainer /  1.77176216)) + "px";
            $(".player-wrapper, .video-js").css("height",height);
            $('video, iframe').css('height', height);
        }
        
    } 

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.pageData.video != prevState.video || (prevState.video && nextProps.pageData.video.status != prevState.video.status) || 
        (nextProps.pageData.password != prevState.password) || nextProps.pageData.adultVideo != prevState.adult) {
           return {
                video: nextProps.pageData.video, 
                relatedVideos: nextProps.pageData.relatedVideos, 
                userAdVideo: nextProps.pageData.userAdVideo,
                adminAdVideo: nextProps.pageData.adminAdVideo, 
                playlist: nextProps.pageData.playlist, 
                playlistVideos: nextProps.pageData.playlistVideos,
                password: nextProps.pageData.password,
                adult: nextProps.pageData.adultVideo,
                logout:false,
                changeHeight:true
            }
        } else{
            return null
        }

    }
    componentDidUpdate(prevProps,prevState){
        if(this.state.changeHeight){
            this.getHeight();
            this.setState({changeHeight:false,localUpdate:true})
        }
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.getHeight();
        var _ = this
    }
    
    checkPassword = model => {
        if (this.state.submitting) {
            return
        }
        const formData = new FormData();
        for (var key in model) {
            formData.append(key, model[key]);
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/videos/password/' + this.props.pageData.id;
        this.setState({localUpdate:true, submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    this.setState({localUpdate:true, error: response.data.error, submitting: false });
                } else {
                    this.setState({localUpdate:true, submitting: false, error: null })
                    Router.push(`/embed?id=${this.props.pageData.id}`, `/embed/${this.props.pageData.id}`)
                }
            }).catch(err => {
                this.setState({localUpdate:true, submitting: false, error: err });
            });
    }
    mouseOut = () => {
        $(".watermarkLogo").hide()
    }
    mouseEnter = () => {
        if(this.state.video && this.state.video.status == 1){
            $(".watermarkLogo").show()
        }
    }
    goLive = () => {
        let url = `${this.props.pageData.siteURL}/live-streaming/${this.state.video.custom_url}`;
        window.open(url, '_blank').focus();
    }
    purchaseClicked = () => {
        let url = `${this.props.pageData.siteURL}/watch/${this.state.video.custom_url}`;
        window.open(url, '_blank').focus();
    }
    render() {
       
        let validatorUploadImport = []
        let fieldUploadImport = []
        validatorUploadImport.push({
            key: "password",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Password is required field"
                }
            ]
        })
        fieldUploadImport.push({ key: "password", label: "", type: "password" })

        let videoImage = this.state.video ? this.state.video.image : ""
        
        if(this.state.video){
            if(this.props.pageData.livestreamingtype == 0 && this.state.video.mediaserver_stream_id &&  !this.state.video.orgImage && this.state.video.is_livestreaming == 1 && parseInt(this.props.pageData.appSettings['antserver_media_hlssupported']) == 1){
                if(this.props.pageData.liveStreamingCDNServerURL){
                    videoImage = `${this.props.pageData.liveStreamingCDNServerURL}/${this.props.pageData.streamingAppName}/previews/${this.state.video.mediaserver_stream_id}.png`
                }else
                    videoImage = `${this.props.pageData.liveStreamingServerURL}:5443/${this.props.pageData.streamingAppName}/previews/${this.state.video.mediaserver_stream_id}.png`
            }else  if(this.state.video.mediaserver_stream_id &&  this.state.video.image && (this.state.video.image.indexOf(`WebRTCAppEE/previews`) > -1 || this.state.video.image.indexOf(`LiveApp/previews`) > -1)){
                if(this.props.pageData.liveStreamingCDNURL){
                    videoImage = `${this.props.pageData.liveStreamingCDNURL}${this.state.video.image.replace(`/LiveApp`,'').replace(`/WebRTCAppEE`,'')}`
                }else
                    videoImage = `${this.props.pageData.liveStreamingServerURL}:5443${this.state.video.image}`
            }
        }
        let userBalance = {}
        userBalance['package'] = { price: parseInt(this.state.video ? this.state.video.price : 0) } 
        return (
            this.state.password ?
                    <Form
                        className="form password-mandatory"
                        generalError={this.state.error}
                        title={"Enter Password"}
                        validators={validatorUploadImport}
                        model={fieldUploadImport}
                        {...this.props}
                        submitText={this.state.submitting ? "Submit..." : "Submit"}
                        onSubmit={model => {
                            this.checkPassword(model);
                        }}
                    />
                :
                this.state.adult ?
                        <div className="adult-wrapper">
                            {Translate(this.props, 'This video contains adult content.To view this video, Turn on adult content setting from site footer.')}
                        </div>
                    :
                    <React.Fragment>
                        {
                            this.state.video && this.state.video.approve != 1 ? 
                                    <div className="generalErrors  approval-pending">
                                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                            {Translate(this.props,'This video still waiting for admin approval.')}
                                        </div>
                                </div>
                        : null
                        }
                        <div className="videoPlayerHeight embed-videos">
                            <div className="videoPlayer" onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseOut} >
                                <React.Fragment>
                                {
                                    this.state.video && (this.state.video.type == 10 || this.state.video.type == 11) && parseFloat(this.state.video.price) > 0 && !this.state.video.videoPurchased ?

                                    <div key="purchasevideo_purchase" >
                                        <div data-vjs-player className="video_player_cnt player-wrapper" style={{ width: "100%", position: "relative" }} >
                                            <div className="purchase_video_content video_purchase" style={{ width: "100%", "height":"100%"}}>
                                                <div className="purchase_video_content_background"></div>
                                                <h5>
                                                    {
                                                        Translate(this.props,"This livestreaming is paid, you have to purchase the livestreaming to watch it.")
                                                    }<br /><br />
                                                    <button className="btn btn-main" onClick={this.purchaseClicked}>{Translate(this.props,'Purchase ')+" "+Currency({...this.props,...userBalance})} </button>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    this.state.video.is_livestreaming && this.state.video.type == 11 ?
                                        <MediaStreaming watermarkLogoParams={{target:"_blank"}} {...this.props} viewer={this.state.video.total_viewer} height={this.state.width > 992 ? "500px" : "500px"}   custom_url={this.state.video.custom_url} streamingId={this.state.video.mediaserver_stream_id} currentTime={this.props.pageData.currentTime} role="audience" imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video} {...this.props.pageData.video} />
                                    :
                                    this.state.video.is_livestreaming && this.state.video.type == 10 ?
                                        <StartLiveStreaming watermarkLogoParams={{target:"_blank"}} {...this.props} viewer={this.state.video.total_viewer} height={this.state.width > 992 ? "500px" : "500px"}   custom_url={this.state.video.custom_url} channel={this.state.video.channel_name} currentTime={this.props.pageData.currentTime} role="audience" imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video} {...this.props.pageData.video} />
                                        :
                                    this.props.pageData.appSettings['player_type'] == "element" && ((this.state.video.type == 3 && this.state.video.video_location) || (
                                        this.state.video.type == 1  && this.state.video.code)) && !this.state.video.scheduled && this.state.video.approve == 1 ?
                                        <MediaElementPlayer watermarkLogoParams={{target:"_blank"}} {...this.props} purchaseClicked={this.purchaseClicked} getHeight={this.getHeight} ended={this.videoEnd} height={this.state.width > 992 ? "500px" : "500px"} userAdVideo={this.state.userAdVideo} adminAdVideo={this.state.adminAdVideo}  playlistVideos={this.state.playlistVideos} currentPlaying={this.state.currentPlaying} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video} {...this.props.pageData.video} />
                                    :

                                     ((this.state.video.type == 3 && this.state.video.video_location) || (this.state.video.type == 11 && this.state.video.code))  && !this.state.video.scheduled && this.state.video.approve == 1 ?
                                        <Player purchaseClicked={this.purchaseClicked} watermarkLogoParams={{target:"_blank"}} {...this.props} getHeight={this.getHeight} ended={this.videoEnd} height={this.state.width > 992 ? "500px" : "500px"} userAdVideo={this.state.userAdVideo} adminAdVideo={this.state.adminAdVideo}  playlistVideos={this.state.playlistVideos} currentPlaying={this.state.currentPlaying} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video} {...this.props.pageData.video} />
                                      :  (!this.state.video.scheduled || this.state.video.approve == 1) && this.state.video.type != 11 ?
                                        <OutsidePlayer watermarkLogoParams={{target:"_blank"}} {...this.props} liveStreamingURL={this.props.pageData.liveStreamingURL} ended={this.videoEnd}  height={this.state.width > 992 ? "500px" : "500px"}  playlistVideos={this.state.playlistVideos} currentPlaying={this.state.currentPlaying} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video}  {...this.props.pageData.video} />
                                        : 
                                    <div className="scheduled-cnt player-wrapper">
                                        <img className={"scheduled-video-image"} src={videoImage} /> 
                                        {
                                            this.state.video.approve == 1 ?
                                        <div className="stats">
                                            <span className="icon">
                                                <svg fill="#fff" height="100%" viewBox="0 0 24 24" width="100%"><path d="M16.94 6.91l-1.41 1.45c.9.94 1.46 2.22 1.46 3.64s-.56 2.71-1.46 3.64l1.41 1.45c1.27-1.31 2.05-3.11 2.05-5.09s-.78-3.79-2.05-5.09zM19.77 4l-1.41 1.45C19.98 7.13 21 9.44 21 12.01c0 2.57-1.01 4.88-2.64 6.54l1.4 1.45c2.01-2.04 3.24-4.87 3.24-7.99 0-3.13-1.23-5.96-3.23-8.01zM7.06 6.91c-1.27 1.3-2.05 3.1-2.05 5.09s.78 3.79 2.05 5.09l1.41-1.45c-.9-.94-1.46-2.22-1.46-3.64s.56-2.71 1.46-3.64L7.06 6.91zM5.64 5.45L4.24 4C2.23 6.04 1 8.87 1 11.99c0 3.13 1.23 5.96 3.23 8.01l1.41-1.45C4.02 16.87 3 14.56 3 11.99s1.01-4.88 2.64-6.54z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            </span>
                                            <span className="date">
                                                <div className="text">
                                                    {
                                                        this.state.video.scheduled ? 
                                                            this.props.t("Live in ")
                                                        : null
                                                    }
                                                    {
                                                        this.state.video.scheduled ? 
                                                            !this.state.scheduledEndTime ? 
                                                                scheduledTimer.join(" ")
                                                        :
                                                            <span dangerouslySetInnerHTML={{__html:this.state.scheduledEndTime}}></span>
                                                        :
                                                        <span>{this.props.t("Start in few seconds")}</span>
                                                    }
                                                </div>
                                                {
                                                    this.state.video.scheduled ? 
                                                <div className="subitle">
                                                    {
                                                        <span dangerouslySetInnerHTML={{__html:Date(this.props,this.state.video.creation_date,this.props.initialLanguage,'MMMM Do YYYY, hh:mm A',this.props.pageData.loggedInUserDetails ? this.props.pageData.loggedInUserDetails.timezone : this.props.pageData.defaultTimezone)}}></span>
                                                    } 
                                                </div>
                                                : null
                                                }
                                            </span>
                                            {
                                                this.state.video.approve == 1 || this.state.video.scheduled ?
                                            <span className="sche-btn">
                                                {
                                                    this.state.video.canEdit ?
                                                    <button onClick={this.goLive}>
                                                        <div className="text">
                                                            {this.props.t("Go Live Now")}
                                                        </div>
                                                    </button>
                                                :
                                                    <button onClick={this.setReminder}>
                                                        <div className="icon-bell">
                                                            {
                                                                this.state.video.scheduled_video_id ? 
                                                                    <svg fill="#fff" height="24px" viewBox="0 0 24 24" width="24px"><path d="M7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42zM18 11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2v-5zm-6 11c.14 0 .27-.01.4-.04.65-.14 1.18-.58 1.44-1.18.1-.24.15-.5.15-.78h-4c.01 1.1.9 2 2.01 2z"></path></svg>
                                                                : 
                                                                    <svg fill="#fff" height="24px" viewBox="0 0 24 24" width="24px"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"></path></svg>
                                                            }
                                                        </div>
                                                        <div className="text">
                                                            {this.state.video.scheduled_video_id ? this.props.t("Reminder on") : this.props.t("Set reminder")}
                                                        </div>
                                                    </button>
                                                }
                                            </span>
                                            : null
                                            }
                                        </div>
                                        : null
                                        }
                                    </div>
                                }
                                
                                </React.Fragment>
                            </div>  
                        </div>      
                    </React.Fragment>
                    
        )
    }
}



export default Index