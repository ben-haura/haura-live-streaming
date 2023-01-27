import React from "react"
import * as actions from '../../store/actions/general';
import Translate from "../../components/Translate/Index"
import axios from "../../axios-orders"
import ShortNumber from "short-number"
import SocialShare from "../SocialShare/Index"
import { connect } from 'react-redux';
import Chat from "./Chat"
import Link from "../../components/Link"
import ToastMessage from "../ToastMessage/Index"
import ToastContainer from "../ToastMessage/Container"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import config from "../../config"

class Index extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            scheduled:props.scheduled,
            streamingId:props.streamingId,
            allow_chat:props.allow_chat ? props.allow_chat : 1,
            like:props.like_count ? props.like_count : 0,
            dislike:props.dislike_count ? props.dislike_count : 0,
            randNumber:Math.floor( Math.random() * (99999999 - 9999) + 9999 ),
            user_id:props.pageData.loggedInUserDetails ? props.pageData.loggedInUserDetails.user_id : 0,
            title:props.title,
            image:props.image,
            allowedTime: props.allowedTime ? props.allowedTime : 0,
            currentTime: props.currentTime ? props.currentTime : 0,
            channel:props.channel,
            role:props.role, 
            custom_url:props.custom_url,
            video:props.video,
            video_id:props.video_id,
            streamleave:false,
            viewer:props.viewer ? props.viewer : 0,           
            comments:[],
            videoMuted:false,
            audioMuted:false,
            streamType:props.streamType,
            streamToken:props.streamToken,
            iframeSRC:"",
            hide:false,
            banners:  props.pageData.banners ? props.pageData.banners : [],
            backgroundColor: props.pageData.brands && props.pageData.brands.background_color ? props.pageData.brands.background_color : "#000000",
            textColor: props.pageData.brands && props.pageData.brands.text_color ? props.pageData.brands.text_color : "#ffffff",
            brands:props.pageData.brands ? props.pageData.brands : {},
            isChecked:false,
            showAddBtn:false
        }
        this.inputFileLogo = React.createRef()
        this.inputFileOverlay = React.createRef()
        this.timer = this.timer.bind(this)
        this.finish = this.finish.bind(this)
        this.onUnload = this.onUnload.bind(this)
        // this.CameraAudio = this.CameraAudio.bind(this)
        // this.changeCamera = this.changeCamera.bind(this)
        this.iframeLoaded = this.iframeLoaded.bind(this)
        this.receiveMessage = this.receiveMessage.bind(this)
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.streamId && nextProps.streamId != prevState.streamId) {
            return {
                banners:nextProps.pageData.banners ? nextProps.pageData.banners : [],
                showAddBtn:false,
                editBanner:0,
                backgroundColor: nextProps.pageData.brands && nextProps.pageData.brands.background_color ? nextProps.pageData.brands.background_color : "#000000",
                textColor: nextProps.pageData.brands && nextProps.pageData.brands.text_color ? nextProps.pageData.brands.text_color : "#ffffff",
                brands:nextProps.pageData.brands ? nextProps.pageData.brands : {},
                hide:false,streamToken:nextProps.streamToken,streamType:nextProps.streamType,streamingId:nextProps.streamingId, currentTime: nextProps.currentTime,  role: nextProps.role, custom_url: nextProps.custom_url,video:nextProps.video,video_id:nextProps.video_id,viewer:nextProps.viewer,comments:nextProps.comments }
        } else{
            return null
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if(this.props.streamId != prevProps.streamId){
            if(this.timerID)
                clearInterval(this.timerID);
            if(this.timerHostUpdate)
                clearInterval(this.timerHostUpdate)
            this.createAuthToken()
            this.updateViewer("delete",prevProps.custom_url)
        }
    }
    onUnload = (type) => {
        if(!type)
        this.props.socket.emit('leaveRoom', {streamId:this.state.streamingId,custom_url:this.state.custom_url})
       // this.props.socket.disconnect();
        if(this.state.role == "host"){
            this.finish()
        }else if(type){
            this.updateViewer("delete",this.state.custom_url)
        }
    }
    createAuthToken = () => {
        this.createVideoStreaming();
    }
    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload("refresh"));
        if(this.timerID)
            clearInterval(this.timerID);
        if(this.timerHostUpdate)
            clearInterval(this.timerHostUpdate)
        if(this.state.role == "host"){
            this.finish()
        }
        //this.props.socket.disconnect();
    }
    
    createVideoStreaming = async () => {
        if(this.state.role == "host"){
            if(parseInt(this.props.pageData.levelPermissions['livestreaming.duration'],10) != 0){
                this.props.openToast(this.props.t("You can go live for {{duration}} minutes.",{duration:parseInt(this.props.pageData.levelPermissions['livestreaming.duration'])}), "success")
            }
            this.timerHostUpdate = setInterval(
                () => this.updateHostLiveTime(),
                30000
            );
            this.timerID = setInterval(
                () => this.timer(),
                1000
            );
        }else{
            this.updateViewer('add');
            this.timerID = setInterval(
                () => this.timer(),
                1000
            );
        }
    }
    componentDidMount(){
        if(this.state.role != "host"){
            Router.events.on("routeChangeStart", url => {
                this.onUnload();
            });
        }
        this.setState({iframeSRC:`${this.getURL()}/media-streaming/play.html`})
        window.addEventListener("beforeunload", this.onUnload);
        //if(this.state.role != "host"){
        this.props.socket.on('bannerData', data => {
            let owner_id = this.state.video ? this.state.video.owner_id : this.props.pageData.loggedInUserDetails.user_id
            if(owner_id == data.user_id){
                data.message = "brands";
                if(document.getElementById("media_treaming_iframe"))
                    document.getElementById("media_treaming_iframe").contentWindow.postMessage(data, '*');
            }
        });
        //}   
        if(this.state.role == "host"){
            this.props.socket.on('hideBannerLive', data => {
                let banner_id = data.banner_id;
                let show = data.show;
                let user_id = data.user_id;
                let previousHide = data.previousHide;
                let itemIndex = this.getItemIndex(banner_id);
                let previousHideIndex = this.getItemIndex(previousHide);
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == user_id && itemIndex > -1) {
                    let banners = [...this.state.banners]
                    banners[itemIndex]["show"] = parseInt(show);
                    if(previousHideIndex > -1){
                        banners[previousHideIndex]["show"] = 0;
                    }
                    this.setState({localUpdate:true,banners:banners});
                }
            });
            this.props.socket.on('deleteBannerLive', data => {
                let banner_id = data.banner_id;
                let user_id = data.user_id;
                let itemIndex = this.getItemIndex(banner_id);
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == user_id && itemIndex > -1) {
                    let banners = [...this.state.banners]
                    banners.splice(itemIndex, 1);
                    this.setState({localUpdate:true,banners:banners});
                }
            });
            this.props.socket.on('newBannerLive', data => {
                let banner_id = data.banner_id;
                let text = data.text;
                let show = data.show;
                let ticker = data.ticker;
                let user_id = data.user_id;
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == user_id) {
                    let banners = [...this.state.banners]
                    let banner = {}
                    banner.text = text
                    banner.show = show
                    banner.ticker = ticker
                    banner.user_id = user_id
                    banner.banner_id = banner_id
                    banners[banners.length] = banner
                    this.setState({localUpdate:true,banners:banners});
                }
            });
            this.props.socket.on('updateBannerLive', data => {
                let banner_id = data.banner_id;
                let text = data.text;
                let ticker = data.ticker;
                let user_id = data.user_id;
                let itemIndex = this.getItemIndex(banner_id);
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == user_id && itemIndex > -1) {
                    let banners = [...this.state.banners]
                    let banner = banners[itemIndex]
                    banner.text = text
                    banner.ticker = ticker
                    banners[itemIndex] = banner
                    this.setState({localUpdate:true,banners:banners});
                }
            });
        }

        this.props.socket.on('liveStreamingViewerDelete', data => {
            let id = data.custom_url;
            if (this.state.custom_url == id) {
                let viewer = parseInt(this.state.viewer,10) - 1
                this.setState({localUpdate:true,viewer:viewer < 0 ? 0 : viewer})
            }
        });
        this.props.socket.on('liveStreamingViewerAdded', data => {
            let id = data.custom_url;
            if (this.state.custom_url == id) {
                let viewer = parseInt(this.state.viewer,10) + 1
                this.setState({localUpdate:true,viewer:viewer < 0 ? 0 : viewer})
            }
        });
        
        this.props.socket.on('liveStreamStatus', data => {
            let id = data.id;
            if (this.state.streamingId == id) {
                if(data.action == "liveStreamEnded"){
                    this.finish();
                }
            }
        });
        this.props.socket.on('updateBrandLive', data => {
            if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == data.user_id) {
                let brand = {...this.state.brands,...data}
                this.setState({localUpdate:true,brands:brand})
            }
        });
        this.props.socket.on('likeDislike', data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId = data.ownerId
            let removeLike = data.removeLike
            let removeDislike = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike = data.insertDislike
            if (itemType == "videos" && this.state.video_id == itemId) {
                const item = { ...this.state }
                
                if (removeLike) {
                    item['like'] = parseInt(item['like']) - 1
                }
                if (removeDislike) {
                    item['dislike'] = parseInt(item['dislike']) - 1
                }
                if (insertLike) {                    
                    item['like'] = parseInt(item['like']) + 1
                }
                if (insertDislike) { 
                    item['dislike'] = parseInt(item['dislike']) + 1
                }
                this.setState({localUpdate:true, ...item })
            }
        });
        if (window.addEventListener) {
            window.addEventListener("message", this.receiveMessage);
        } else {
            window.attachEvent("onmessage", this.receiveMessage);
        }        
        if(this.props.getHeight)
            this.props.getHeight();
    }
    postMessage(data){
        if(document.getElementById("media_treaming_iframe"))
            document.getElementById("media_treaming_iframe").contentWindow.postMessage(data, '*');
    }
    iframeLoaded = () => {
        var orgName = this.props.pageData.liveStreamingServerURL
        var path =  (this.props.pageData.liveStreamingServerURL.replace("https://",'').replace("http://",''));
        var websocketURL =  "ws://" + path+`:5080/${this.props.pageData.streamingAppName}/websocket?rtmpForward=`;
        if (orgName.startsWith("https")) {
            websocketURL = "wss://" + path+`:5443/${this.props.pageData.streamingAppName}/websocket?rtmpForward=`;
        } 
        let values = {orgName:orgName,streamId:this.state.streamingId,url:websocketURL,connecting:this.props.t("Connecting..."),networkWarning:this.props.t("Your connection isn't fast enough to play this stream!")}
        values['videosource'] = this.props.t("Video Source");
        values['appName'] = this.props.pageData.streamingAppName;
        if(parseInt(this.props.pageData.appSettings['antserver_media_hlssupported']) == 1)
        values['playOrder'] = parseInt(this.props.pageData.appSettings['antserver_media_hlssupported']) == 1 ? "hls,webrtc" : "webrtc,hls";
        values['screen'] = this.props.t("Screen");
        values['screenwithcamera'] = this.props.t("Screen with Camera");
        values['audiosource'] = this.props.t("Audio Source");
        values['token'] = this.props.streamToken
        values['browser_screen_share_doesnt_support'] = this.props.t("Your browser doesn't support screen share. You can see supported browsers in this link");
        values['liveStreamingCDNURL'] = this.props.pageData.liveStreamingCDNURL ? this.props.pageData.liveStreamingCDNURL : null
        values['liveStreamingCDNServerURL'] = this.props.pageData.liveStreamingCDNServerURL ? this.props.pageData.liveStreamingCDNServerURL : null
        this.postMessage({message:"getData","value":values});
        if(this.state.brands || this.state.banners){
            let data = {}
            if(this.state.role != "host")
            data.banners = this.state.banners
            else
            data.banners = []
            data.brand = this.state.brands
            data.message = "brands";
            if(document.getElementById("media_treaming_iframe"))
                document.getElementById("media_treaming_iframe").contentWindow.postMessage(data, '*');
        }
    }
    receiveMessage = (event) => {
        const message = event.data.message;
        switch (message) {
          case 'finished':
            this.finish();
            break;
          case 'playStarted':
            this.startRecording();
            this.createAuthToken()
            break;
         case 'resize_window':
            if(this.props.resizeWindow)
                this.props.resizeWindow();
            break;
        }
    }

    updateViewer(data,customURL){
        let formData = new FormData();
        formData.append("custom_url",customURL ? customURL : this.state.custom_url)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/'+data+'-viewer';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    
    startRecording(){
        if(this.state.role == "host"){
            let formData = new FormData();
            formData.append("streamID",this.state.streamingId)
            
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
            let url = '/live-streaming/media-stream/recording';
            
            axios.post(url, formData, config)
                .then(response => {
                    if (response.data.error) {
                        
                    } else {
                        
                    }
                }).catch(err => {
                    
                });
        }
    }
    finishStreaming = () => {
        let formData = new FormData();
        formData.append("streamID",this.state.streamingId)
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/media-stream/finish';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    finish = () => {
        if(this.state.role == "host"){
            this.postMessage({message:"stop"});
            this.finishStreaming();
        }
        if(this.timerID)
            clearInterval(this.timerID);
        if(this.timerHostUpdate)
            clearInterval(this.timerHostUpdate)
        this.setState({localUpdate:true,streamleave:true,confirm:false,hostleave:this.state.role != "host" ? true : false})
    }
    changeTimeStamp(){
        let currentTime = this.state.currentTime
        var seconds = parseInt(currentTime, 10); // don't forget the second param
        var hours   = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - (hours * 3600)) / 60);
        seconds = seconds - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = hours+':'+minutes+':'+seconds;
        return time;
    }
    timer = () => {
        if(this.state.streamleave)
            return;
        let allowedTime = 0
        if(this.state.role == "host"){
            if(this.props.pageData.levelPermissions && parseInt(this.props.pageData.levelPermissions['livestreaming.duration'],10) != 0){
                allowedTime = parseInt(this.props.pageData.levelPermissions['livestreaming.duration'],10)
            }
        }

        if(allowedTime == 0 || (allowedTime * 60) >= (this.state.currentTime - 1)){
            let currentTime = parseInt(this.state.currentTime, 10)
            this.setState({localUpdate:true,currentTime:currentTime+1})
        }else{
            if(this.timerID)
                clearInterval(this.timerID);
            if(this.timerHostUpdate)
                clearInterval(this.timerHostUpdate)
            this.finish()
        }
    }
    updateHostLiveTime = () => {
        if(this.state.role == "host"){
            //update host time
            let data = {}
            data.custom_url = this.state.custom_url
            this.props.socket.emit('updateLiveHostTime', data)
        }
    }
    confirmfinish = () => {
        this.setState({confirm:true})
    }
   
    getURL(){
       return this.props.pageData.siteURL
    }
    hideShowChat = (type) => {
        if(type == "remove"){
            //remove class
            this.setState({localUpdate:true,hide:false})
        }else{
            //add class
            this.setState({localUpdate:true,hide:true})
        }
    }
    getItemIndex(item_id) {
        const banners = [...this.state.banners];
        const itemIndex = banners.findIndex(p => p["banner_id"] == item_id);
        return itemIndex;
    }
    showHideBanner = (banner_id) => {
        let formData = new FormData();
        formData.append("banner_id",banner_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/show-hide-banner';
        
        axios.post(url, formData, config)
            .then(response => {
                
            }).catch(err => {
            });
    }
    editBanner = (banner_id) => {
        let indexItem = this.getItemIndex(banner_id)
        if(indexItem > -1){
            let banner = this.state.banners[indexItem];
            this.setState({localUpdate:true,editTextAreaHeight:"70px",editBanner:banner_id,editBannerText:banner.text,editBannerTicker:banner.ticker,showAddBtn:false,isBannerSaving:false,isChecked:false,newBannerText:"",textAreaHeight:"70px"});
        }
    }
    deleteBanner = (banner_id) => {
        let formData = new FormData();
        formData.append("banner_id",banner_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/delete-banner';
        
        axios.post(url, formData, config)
            .then(response => {
                
            }).catch(err => {
            });
    }
    submitBanner = (e) => {
        if((this.state.newBannerText && this.state.newBannerText.trim() != "") || (this.state.editBannerText && this.state.editBannerText.trim() != "")){
            let isCheckBoxChecked = this.state.isChecked
            if(isCheckBoxChecked){
                if(this.state.newBannerText && this.state.newBannerText.length > 1000){
                    return;
                }
            }else{
                if(this.state.newBannerText && this.state.newBannerText.length > 200){
                    return;
                }
            }
            //save banner text
            if(this.state.isBannerSaving){
                return;
            }
            this.setState({localUpdate:true,isBannerSaving:true})
            
            let formData = new FormData();
            if(this.state.editBanner){
                formData.append("ticker",this.state.editBannerTicker == 1 ? 1 : 0)
                formData.append("text",this.state.editBannerText)
                formData.append("banner_id",this.state.editBanner)
            }else{
                formData.append("ticker",this.state.isChecked == 1 ? 1 : 0)
                formData.append("text",this.state.newBannerText)
            }
            
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
            let url = '/live-streaming/add-banner';
            
            axios.post(url, formData, config)
                .then(response => {
                    if (response.data.error) {
                        this.setState({localUpdate:true,isBannerSaving:false,isEditBannerSaving:false,editBanner:0})
                    } else {
                        this.setState({localUpdate:true,isBannerSaving:false,isChecked:false,newBannerText:"",textAreaHeight:"70px",isEditBannerSaving:false,editBanner:0})
                    }
                }).catch(err => {
                    this.setState({localUpdate:true,isBannerSaving:false,isEditBannerSaving:false,editBanner:0})
                });
        }
    }
    logoOverlayInactive = (type) => {
        let formData = new FormData();
        formData.append("type",type);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/status-brands-images';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    removeBrandLogoOverlay = (type) => {
        let formData = new FormData();
        formData.append("type",type);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/delete-brands-images';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    setFile = (fileT,type) => {
        if(fileT.length == 0){
            return
        }
        var file = fileT[0]
        var name = file.name;
        
        var ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        var isValid = false;
        if ((ext == "png" || ext == "jpeg" || ext == "jpg" || ext == 'PNG' || ext == 'JPEG' || ext == 'JPG')) {
            isValid = true;
        }

        if(!isValid){
            return
        }

        let formData = new FormData();
        formData.append("type",type);
        formData.append("file",file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/add-brands-images';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    updateBrands = (arr) => {
        let formData = new FormData();
        arr.forEach(item => {
            formData.append(item.name,item.value);
        });
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/add-brands';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    render(){
        if(this.state.role != "host"){
            return (
                <React.Fragment>
                    <div className="lsVideoTop">
                        <div className="liveTimeWrap">
                            <span className="liveText">{Translate(this.props,'LIVE')}</span>
                            <span className="liveTime">{this.changeTimeStamp()}</span>
                        </div>
                        <div className="participentNo">
                            <i className="fa fa-users" aria-hidden="true"></i> {`${ShortNumber(this.state.viewer ? this.state.viewer : 0)}`}
                        </div>
                    </div>
                    <div className="video_player_cnt player-wrapper" style={{ width: "100%", position: "relative" }} >
                        {
                            <React.Fragment>
                                {
                                    !this.state.hostleave ? 
                                    <React.Fragment>
                                        
                                        {
                                            this.state.video.watermark ? 
                                                <div className="watermarkLogo">
                                                    <a href={config.app_server} {...this.props.watermarkLogoParams}>
                                                        <img src={this.props.imageSuffix+this.state.video.watermark} />
                                                    </a>
                                                </div>
                                                : null
                                        }
                                        <div className="videoWrapCnt" id="video_container" style={{ width: "100%", "height": "100%", position: "relative" }} >
                                            <iframe id="media_treaming_iframe" onLoad={this.iframeLoaded.bind(this)} className="media_treaming_iframe" src={this.state.iframeSRC}></iframe>
                                            {
                                              (this.state.role == "host" && this.props.allow_chat == 1) ||  (!this.props.needSubscription && this.props.videoElem && this.props.videoElem.approve == 1 && this.props.videoElem.enable_chat == 1 && ( (this.props.videoElem.is_livestreaming == 1 && (this.props.videoElem.channel_name || this.props.videoElem.mediaserver_stream_id)) || this.props.videoElem.scheduled   )) ? 
                                                    <div className={`mobile-chat${this.state.hide ? " hide-chat" : ""}`}>
                                                        <div className="ls_sidbar top_video_chat">
                                                            <Chat {...this.props} hideShowChat={this.hideShowChat} showHideChat={true} channel={this.props.videoElem.channel_name} streamId={this.props.videoElem.mediaserver_stream_id} custom_url={this.props.videoElem.custom_url} comments={this.props.videoElem.chatcomments ? this.props.videoElem.chatcomments : []} />
                                                        </div>    
                                                    </div>
                                                : null
                                            } 
                                        </div>
                                    </React.Fragment>
                                    :
                                        <div className="purchase_video_content video_processing_cnt livestreaming_end">
                                            <h5>{this.props.t("Thanks For Watching!")}</h5>
                                            <p>{this.props.t("Live Video has been Ended")}</p>
                                        </div>
                                }
                            </React.Fragment>                                
                        }
                    </div>
                </React.Fragment>
            )
        }
        return (
            <React.Fragment>
                {
                    this.props.isSharePopup ? 
                        <SocialShare {...this.props} buttonHeightWidth="30" url={`/watch/${this.state.custom_url}`} title={this.state.title} imageSuffix={this.props.pageData.imageSuffix} media={this.state.image} countItems="all" checkcode={true} />
                : null
                }
                {
                    <React.Fragment>
                        <ToastContainer {...this.props} />
                        <ToastMessage {...this.props} />
                    </React.Fragment>
                }
            <div className="videoSection2">
                <div className={`videoWrap${this.state.allow_chat != 1 ? " nochat" : ""}`}>
                    {
                        this.state.confirm ? 
                        <div className="popup_wrapper_cnt livestreaming_end">
                            <div className="popup_cnt">
                                <div className="comments">
                                    <div className="VideoDetails-commentWrap">
                                        <div className="popup_wrapper_cnt_header">
                                            <h2>{Translate(this.props,'Are you sure you want to end your stream?')}</h2>
                                            <a className="_close" href="#" onClick={(e) => {e.preventDefault(); this.setState({confirm:false})}}><i></i></a>
                                            <div className="footer">
                                                <a href="#" onClick={(e) => {e.preventDefault(); this.setState({confirm:false})}}>
                                                    {Translate(this.props,'NOT YET')}
                                                </a>
                                                <button onClick={this.finish}>
                                                    {Translate(this.props,'END')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        : null
                    }
                    <div className="lsVideoTop">
                        <div className="liveTimeWrap">
                            <span className="liveText">{Translate(this.props,'LIVE')}</span>
                            <span className="liveTime">{this.changeTimeStamp()}</span>
                        </div>
                        <div className="participentNo">
                            <i className="fa fa-users" aria-hidden="true"></i> {`${ShortNumber(this.state.viewer ? this.state.viewer : 0)}`}
                        </div>
                        {
                            this.props.pageData.appSettings["video_like"] ? 
                                <div className="likebtn">
                                    <i className="fa fa-thumbs-up" aria-hidden="true"></i> {`${ShortNumber(this.state.like ? this.state.like : 0)}`}
                                </div>
                        : null
                        }
                        {
                            this.props.pageData.appSettings["video_dislike"] ? 
                                <div className="likebtn">
                                    <i className="fa fa-thumbs-down" aria-hidden="true"></i> {`${ShortNumber(this.state.dislike ? this.state.dislike : 0)}`}
                                </div>
                         : null
                        }
                    </div>
                    {
                        !this.state.streamleave ? 
                            <div className="videoWrapCnt" id="video">
                                <div id="local_stream" className={`video-placeholder${this.state.role == "host" ? "" : " remote_audience"}`}>
                                    {
                                        this.state.streamType == "rtmp" ?
                                        <iframe id="media_treaming_iframe" onLoad={this.iframeLoaded.bind(this)} className="media_treaming_iframe" src={`${this.getURL()}/media-streaming/play.html`}></iframe>
                                    :
                                        <iframe id="media_treaming_iframe" onLoad={this.iframeLoaded.bind(this)} className="media_treaming_iframe" src={`${this.getURL()}/media-streaming/live.html`}></iframe>
                                    }
                                    {
                                        (this.state.role == "host" && this.props.allow_chat == 1) ||  (!this.props.needSubscription && this.props.videoElem && this.props.videoElem.approve == 1 && this.props.videoElem.enable_chat == 1 && ( (this.props.videoElem.is_livestreaming == 1 && (this.props.videoElem.channel_name || this.props.videoElem.mediaserver_stream_id)) || this.props.videoElem.scheduled   )) ? 
                                            <div className={`mobile-chat${this.state.hide ? " hide-chat" : ""}`}>
                                                <div className="ls_sidbar top_video_chat">
                                                    <Chat {...this.props} hideShowChat={this.hideShowChat} showHideChat={true} channel={this.props.videoElem.channel_name} streamId={this.props.videoElem.mediaserver_stream_id} custom_url={this.props.videoElem.custom_url} comments={this.props.videoElem.chatcomments ? this.props.videoElem.chatcomments : []} />
                                                </div>    
                                            </div>
                                        : null
                                    } 
                                </div>
                            </div>
                            : 
                            <div className="videoWrapCnt live_host_end" id="video">
                                <div className="centeredForm">
                                    <div className="finishedStream">
                                        <div className="head">
                                            {Translate(this.props,'Stream Finished')}
                                        </div>
                                        <div className="thumbStream">
                                            <img src={this.props.pageData.imageSuffix+this.props.pageData.loggedInUserDetails.avtar} />

                                            <div className="overlay">
                                                <div className="nameThumb">
                                                    <span className="big">{this.state.title}</span>
                                                    <span className="namesmall">{this.props.pageData.loggedInUserDetails.displayname}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="foot">
                                            <Link href="/">
                                                <a className="editbtn">{Translate(this.props,'Go back to site')}</a>
                                            </Link>
                                        </div>
                                    </div>                        
                                </div>
                            </div>
                    }
                    {
                        !this.state.streamleave ? 
                            <div className="ls_footer">
                                <div className="ls_footerOption">
                                {
                                      this.state.streamType != "rtmp" && this.state.cameraList && this.state.cameraList.length > 1 ?
                                    <div className="icon shareLinks">                                    
                                        <span className="material-icons" data-icon="flip_camera_android" onClick={this.changeCamera.bind(this)}>
                                            
                                        </span>
                                         {/* <select value={this.state.cameraId} onChange={this.changeCamera.bind(this)}>
                                            <option>{this.props.t("Select Camera Option")}</option>
                                            {
                                                this.state.cameraList.map(item => {
                                                    return (
                                                        <option value={item.value} key={item.value}>{item.label}</option>
                                                    )
                                                })
                                            }
                                        </select> */}
                                    </div>
                                    : null
                                }
                                {
                                    this.state.streamType != "rtmp" && false ? 
                                        <React.Fragment>
                                            <div className="icon valumeBtn" onClick={this.CameraAudio.bind(this,'video')}>
                                                {
                                                    this.state.videoMuted ? 
                                                        <span className="material-icons" data-icon="videocam_off">
                                                            
                                                        </span>
                                                    : 
                                                        <span className="material-icons" data-icon="videocam">
                                                            
                                                        </span>
                                                }
                                            </div>
                                            <div className="icon valumeBtn" onClick={this.CameraAudio.bind(this,"audio")}>
                                                {
                                                    this.state.audioMuted ? 
                                                        <i className="fas fa-microphone-slash"></i>
                                                : <i className="fas fa-microphone"></i>
                                                }
                                            </div>
                                        </React.Fragment>
                                    : null
                                    }
                                    <div className="icon shareLinks">
                                    {
                                        this.props.pageData.appSettings["videos_share"] == 1 ?
                                        <ul className="social_share_livestreaming" style={{padding:"0px"}}>
                                            <SocialShare {...this.props} buttonHeightWidth="30" url={`/watch/${this.state.custom_url}`} title={this.state.title} imageSuffix={this.props.pageData.imageSuffix} media={this.state.image} />
                                        </ul>
                                    : null
                                    }
                                    </div>
                                    <div className="icon endBtn" onClick={this.confirmfinish}><button>{Translate(this.props,'End Stream')}</button></div>
                                </div>
                            </div>
                        : null
                    }
                </div>
                {
                    this.state.allow_chat == 1 && this.props.pageData.levelPermissions["livestreaming.branding_livestreaming"] != 1 ?  
                        <div className="ls_sidbar">
                            <Chat {...this.props} finish={this.state.streamleave} deleteAll={true} streamId={this.state.streamingId} custom_url={this.state.custom_url} />
                        </div>    
                    : 
                <div className="ls_sidbar">
                    <div className="Lschat-wrapper d-lg-flex flex-lg-row-reverse">
                        <div className="Lschat-side-menu flex-lg-column me-lg-1 ms-lg-0">
                            <div className="flex-lg-column my-auto">
                                <ul className="nav nav-pills Lschat-side-menu-nav justify-content-center" role="tablist">                                    
                                    {
                                        this.state.allow_chat == 1 ? 
                                            <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top">
                                                <a className="nav-link active" id="pills-comment-tab" data-bs-toggle="pill"
                                                    href="#pills-comment" role="tab">
                                                    <i className="fas fa-comment"></i>
                                                    {this.props.t("Comments")}
                                                </a>
                                            </li>
                                    : null
                                    }
                                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top">
                                        <a className={`nav-link${!this.state.allow_chat ? " active" : ""}`} id="pills-banner-tab" data-bs-toggle="pill"
                                            href="#pills-banner" role="tab">
                                            <i className="fas fa-users"></i>
                                            {this.props.t("Banners")}
                                        </a>
                                    </li>
                                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top">
                                        <a className="nav-link" id="pills-brand-tab" data-bs-toggle="pill"
                                            href="#pills-brand" role="tab">
                                            <i className="fas fa-users"></i>
                                            {this.props.t("Brands")}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="Lschat-contentWrap me-lg-1 ms-lg-0">
                            <div className="tab-content">
                                {
                                    this.state.allow_chat == 1 ?
                                        <div className="tab-pane fade show active" id="pills-comment" role="tabpanel" aria-labelledby="pills-comment-tab">
                                            <div className="livechatBox">                    
                                                <Chat {...this.props} finish={this.state.streamleave} deleteAll={true} streamId={this.state.streamingId} custom_url={this.state.custom_url} />
                                            </div>
                                        </div>
                                    : null
                                }
                                <div className={`tab-pane${this.state.allow_chat != 1 ? " fade show active" : ""}`} id="pills-banner" role="tabpanel" aria-labelledby="pills-banner-tab">
                                   <div className="lsBanner-wrap">
                                        <div className="ls_sdTitle">
                                            <div className="title">{this.props.t("Banners")}</div>
                                        </div>
                                        <div className="lsBanner-component">
                                            <div className="lsBannerList mt-2">
                                                <div className="lsBanner-content scrollcustom">
                                                    {
                                                        this.state.banners.map(banner => {
                                                            return (
                                                                banner.banner_id == this.state.editBanner ? 
                                                                <div key={banner.banner_id} className="addBnr mt-3 edit-banner pb-3">
                                                                    <textarea className={`form-control${this.state.editBannerText && this.state.editBannerText.length > 200 && !this.state.editBannerTicker ? " ft-red" : (this.state.editBannerText && this.state.editBannerText.length > 1000 && this.state.editBannerTicker ? " ft-red" : "")}`} style={{height:this.state.editTextAreaHeight ? this.state.editTextAreaHeight : "70px"}} type="text" value={this.state.editBannerText ? this.state.editBannerText : ""} onChange={(e) => {
                                                                        let height = parseInt(`${e.target.scrollHeight}`);
                                                                        let isCheckBoxChecked = this.state.editBannerTicker
                                                                        if(isCheckBoxChecked){
                                                                            if(e.target.value && e.target.value.length > 1000){
                                                                                return;
                                                                            }
                                                                        }else{
                                                                            if(e.target.value && e.target.value.length > 200){
                                                                                return;
                                                                            }
                                                                        }
                                                                        if(height > 310){
                                                                            height = 310
                                                                        }else if(height < 70 || !e.target.value || e.target.value == ""){
                                                                            height = 70
                                                                        }
                                                                        this.setState({localUpdate:true,editBannerText:e.target.value,editTextAreaHeight:height+"px"})
                                                                    }} placeholder={this.props.t("")} />
                                                                    <div className={`floatR mt-2 mb-2${this.state.editBannerText && this.state.editBannerText.length > 200 && !this.state.editBannerTicker ? " ft-red" : (this.state.editBannerText && this.state.editBannerText.length > 1000 && this.state.editBannerTicker ? " ft-red" : "")}`}>{
                                                                        `${this.state.editBannerText ? this.state.editBannerText.length : 0}/${!this.state.editBannerTicker ? "200" : "1000"}`
                                                                    }</div>
                                                                    <div className="form-check mt-2">
                                                                        <input className="form-check-input" type="checkbox" value="1" checked={this.state.editBannerTicker} onChange={(e) => {
                                                                            this.setState({localUpdate:true,editBannerTicker:!this.state.editBannerTicker})
                                                                        }} id="flexCheckDefault" />
                                                                        <label className="form-check-label form-text" htmlFor="flexCheckDefault">
                                                                        {this.props.t("Scroll across bottom (ticker)")}
                                                                        </label>
                                                                    </div>
                                                                    <button className="mt-3" onClick={this.submitBanner}>{this.props.t(this.state.isEditBannerSaving ? "Saving..." : "Edit Banner")}</button>
                                                                    <a href="#" className="banner-close-btn" onClick={
                                                                        (e) => {
                                                                            e.preventDefault()
                                                                            this.setState({localUpdate:true,editBanner:0})
                                                                        }
                                                                    }>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg>
                                                                    </a>
                                                                </div>
                                                                :
                                                                <div key={banner.banner_id} className={`lsBannerList-box${banner.show == 1 ? " active" : ""}`}>
                                                                    
                                                                    <div className="text">
                                                                        <div className="title">
                                                                            {banner.text}
                                                                        </div>
                                                                        {
                                                                            banner.ticker == 1 ? 
                                                                                <span className="inTicker">{this.props.t("Ticker")} </span>
                                                                            : null
                                                                        }
                                                                    </div>
                                                                    <div className="options">
                                                                        <a className="show-hide" onClick={(e) => {
                                                                            e.preventDefault();
                                                                            this.showHideBanner(banner.banner_id)
                                                                        }}>{banner.show == 1 ? this.props.t("Hide") : this.props.t("Show")}</a>
                                                                        {
                                                                            banner.show == 0 ? 
                                                                                <div className="edit-delete">
                                                                                    <a href="#" className="edit mr-3" onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    this.editBanner(banner.banner_id)
                                                                                }}>
                                                                                    Edit
                                                                                    </a>
                                                                                    <a href="#" className="delete" onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        this.deleteBanner(banner.banner_id)
                                                                                    }}>
                                                                                        Delete
                                                                                    </a>
                                                                                </div>
                                                                        : null
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                    
                                                    <div className="addBnr mt-3">
                                                        {
                                                            this.state.showAddBtn ? 
                                                            <React.Fragment>
                                                                <textarea className={`form-control${this.state.newBannerText && this.state.newBannerText.length > 200 && !this.state.isChecked ? " ft-red" : (this.state.newBannerText && this.state.newBannerText.length > 1000 && this.state.isChecked ? " ft-red" : "")}`} style={{height:this.state.textAreaHeight ? this.state.textAreaHeight : "70px"}} type="text" value={this.state.newBannerText ? this.state.newBannerText : ""} onChange={(e) => {
                                                                    let height = parseInt(`${e.target.scrollHeight}`);
                                                                    let isCheckBoxChecked = this.state.isChecked
                                                                    if(isCheckBoxChecked){
                                                                        if(e.target.value && e.target.value.length > 1000){
                                                                            return;
                                                                        }
                                                                    }else{
                                                                        if(e.target.value && e.target.value.length > 200){
                                                                            return;
                                                                        }
                                                                    }
                                                                    if(height > 310){
                                                                        height = 310
                                                                    }else if(height < 70 || !e.target.value || e.target.value == ""){
                                                                        height = 70
                                                                    }
                                                                    this.setState({localUpdate:true,newBannerText:e.target.value,textAreaHeight:height+"px"})
                                                                }} placeholder={this.props.t("Enter a banner..")} />
                                                                <div className={`floatR mt-2 mb-2${this.state.newBannerText && this.state.newBannerText.length > 200 && !this.state.isChecked ? " ft-red" : (this.state.newBannerText && this.state.newBannerText.length > 1000 && this.state.isChecked ? " ft-red" : "")}`}>{
                                                                    `${this.state.newBannerText ? this.state.newBannerText.length : 0}/${!this.state.isChecked ? "200" : "1000"}`
                                                                }</div>
                                                                <div className="form-check mt-2">
                                                                    <input className="form-check-input" type="checkbox" value="1" checked={this.state.isChecked} onChange={(e) => {
                                                                        this.setState({localUpdate:true,isChecked:!this.state.isChecked})
                                                                    }} id="flexCheckDefault" />
                                                                    <label className="form-check-label form-text" htmlFor="flexCheckDefault">
                                                                    {this.props.t("Scroll across bottom (ticker)")}
                                                                    </label>
                                                                </div>
                                                            </React.Fragment>
                                                        : null
                                                        }
                                                        {
                                                            this.state.showAddBtn ? 
                                                            <button className="mt-3" onClick={this.submitBanner}>{this.props.t(this.state.isBannerSaving ? "Saving..." : "Add Banner")}</button>
                                                        :
                                                            <button className="mt-3" onClick={e => {
                                                                    e.preventDefault()
                                                                    this.setState({localUpdate:true,showAddBtn:true,editBanner:false})
                                                                }
                                                            }>{this.props.t("Add Banner")}</button>
                                                        }
                                                        {
                                                            this.state.showAddBtn ? 
                                                                <a href="#" className="banner-close-btn" onClick={e => {
                                                                        e.preventDefault()
                                                                        this.setState({localUpdate:true,showAddBtn:false})
                                                                    }
                                                                }>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg>
                                                                </a>
                                                        : null
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-pane" id="pills-brand" role="tabpanel" aria-labelledby="pills-brand-tab">
                                   <div className="lsBanner-wrap">
                                    <div className="ls_sdTitle">
                                        <div className="title">{this.props.t("Brands")}</div>
                                    </div>
                                    <div className="lsBanner-content scrollcustom">
                                        <div className="lsBanner-component my-4">
                                            <div className="lsBanner-component-title">
                                                <h4>{this.props.t("Background color")}</h4>                                                        
                                                <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={this.props.t("It's important to brand your broadcast. This color is used in your banners.")} >?</p>                                    
                                            </div>
                                            <div className="colorpick mt-2">
                                                <input type="color" value={this.state.backgroundColor ? this.state.backgroundColor : "#000000"} id="colorPicker" onChange={(e) => {
                                                    this.setState({localUpdate:true,backgroundColor:e.target.value});
                                                    this.updateBrands([{name:"background_color",value:e.target.value}]);
                                                }} />
                                            </div>
                                        </div>
                                        <div className="lsBanner-component my-4">
                                            <div className="lsBanner-component-title">
                                                <h4>{this.props.t("Text color")}</h4>                                                        
                                                <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={this.props.t("This color is used in your banners text.")}>?</p>                                    
                                            </div>
                                            <div className="colorpick mt-2">
                                                <input type="color" id="colorPicker2" value={this.state.textColor ? this.state.textColor : "#ffffff"} id="colorPicker" onChange={(e) => {
                                                    this.setState({localUpdate:true,textColor:e.target.value});
                                                    this.updateBrands([{name:"text_color",value:e.target.value}]);
                                                }} />
                                            </div>
                                        </div>

                                        <div className="lsBanner-component my-4">
                                            <div className="lsBanner-component-title">
                                                <h4>{this.props.t("Theme")}</h4>                                                        
                                                <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={this.props.t("Choose the style that fits your brand. This will affect banners.")}>?</p>                                    
                                            </div>
                                            <div className="themepick mt-2">
                                               <div onClick={() => {
                                                   let brand = {...this.state.brands}
                                                   brand.theme = "default"
                                                   this.setState({localUpdate:true,brands:brand})
                                                   this.updateBrands([{name:"theme",value:"default"}]);
                                               }} className={`lsThemeOption d-flex align-items-center${this.state.brands.theme == "default" ? " active" : ""}`}>
                                                   <div className="lsThemeOption-default d-flex align-items-center justify-content-center" style={{background:this.state.backgroundColor,color:this.state.textColor}}>
                                                       {this.props.t("Default")}
                                                   </div>
                                               </div>
                                               <div onClick={() => {
                                                   let brand = {...this.state.brands}
                                                   brand.theme = "minimal"
                                                   this.setState({localUpdate:true,brands:brand})
                                                   this.updateBrands([{name:"theme",value:"minimal"}]);
                                               }} className={`lsThemeOption d-flex align-items-center${this.state.brands.theme == "minimal" ? " active" : ""}`}>
                                                <div className="lsThemeOption-minimal d-flex align-items-center justify-content-center" style={{backgroundColor:this.state.backgroundColor,color:this.state.textColor}}>
                                                    {this.props.t("Minimal")}
                                                </div>
                                            </div>
                                            <div onClick={() => {
                                                   let brand = {...this.state.brands}
                                                   brand.theme = "bubble"
                                                   this.setState({localUpdate:true,brands:brand})
                                                   this.updateBrands([{name:"theme",value:"bubble"}]);
                                               }} className={`lsThemeOption d-flex align-items-center${this.state.brands.theme == "bubble" ? " active" : ""}`}>
                                                <div className="lsThemeOption-bubble d-flex align-items-center justify-content-center" style={{background:this.state.backgroundColor,color:this.state.textColor}}>
                                                    {this.props.t("Bubble")}
                                                </div>
                                            </div>
                                            <div onClick={() => {
                                                   let brand = {...this.state.brands}
                                                   brand.theme = "block"
                                                   this.setState({localUpdate:true,brands:brand})
                                                   this.updateBrands([{name:"theme",value:"block"}]);
                                               }} className={`lsThemeOption d-flex align-items-center${this.state.brands.theme == "block" ? " active" : ""}`}>
                                                <div className="lsThemeOption-block d-flex align-items-center justify-content-center" style={{background:this.state.backgroundColor,color:this.state.textColor}}>
                                                    {this.props.t("Block")}
                                                </div>
                                            </div>
                                            </div>
                                        </div>

                                        <div className="lsBanner-component my-4">
                                            <div className="lsBanner-component-title">
                                                <h4>{this.props.t("Logo")}</h4>                                                        
                                                <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={this.props.t("Adding your logo to the broadcast makes you look like a pro. Plus, it's great marketing if people are sharing your streams! Try using a PNG with a transparent background.Recommended size: 200 x 200.")}>?</p>                                    
                                            </div>
                                            <div className="logopick mt-2">
                                                <div className="lsLogoOptions">
                                                    
                                                    {
                                                        this.state.brands.logo ? 
                                                            <div className={`lsLogoOptions-box${this.state.brands.logo_active == 1 ? " active" : ""}`}>
                                                                <img src={this.props.pageData.imageSuffix+this.state.brands.logo} className="img-fluid" onClick={(e) => {
                                                                    let brand = {...this.state.brands}
                                                                    brand.logo_active = this.state.brands.logo_active == 1 ? 0 : 1
                                                                    this.setState({localUpdate:true,brands:brand})
                                                                    this.logoOverlayInactive('logo');
                                                                }} />
                                                                <a href="#" onClick={(e) =>  {
                                                                    e.preventDefault();
                                                                    this.removeBrandLogoOverlay('logo');
                                                                    let brand = {...this.state.brands}
                                                                    brand.logo = null
                                                                    this.setState({localUpdate:true,brands:brand})
                                                                }}>
                                                                    Delete
                                                                </a>
                                                            </div>
                                                    :
                                                            <div className="lsLogoOptions-box addlogobtn" onClick={(e) => {
                                                                this.inputFileLogo.current.click()
                                                            }}>
                                                                <input type="file" ref={this.inputFileLogo} accept="image/*" onChange={(e) => {
                                                                    this.setFile(e.target.files,"logo")
                                                                }} style={{display:"none"}} />
                                                                <i className="fas fa-plus"></i>
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="logopick mt-2">
                                                <div className="lsBanner-component-title">
                                                    <h4>{this.props.t("Overlay")}</h4>                                                        
                                                    <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={this.props.t("Overlays are custom graphics on top of your stream. Use a PNG with a transparent background so you don't cover yourself.Recommended size: 1280 x 720.")}>?</p>                                    
                                                </div>
                                                <div className="overlaypick mt-2">
                                                    <div className="lsLogoOptions">
                                                        {
                                                            this.state.brands.overlay ? 
                                                            <div className={`lsLogoOptions-box${this.state.brands.overlay_active == 1 ? " active" : ""}`}>
                                                                <img src={this.props.pageData.imageSuffix+this.state.brands.overlay} className="img-fluid" onClick={(e) => {
                                                                    let brand = {...this.state.brands}
                                                                    brand.overlay_active = this.state.brands.overlay_active == 1 ? 0 : 1
                                                                    this.setState({localUpdate:true,brands:brand})
                                                                    this.logoOverlayInactive('overlay');
                                                                }}  />
                                                                <a href="#" onClick={(e) =>  {
                                                                        e.preventDefault();
                                                                        this.removeBrandLogoOverlay('overlay');
                                                                        let brand = {...this.state.brands}
                                                                        brand.overlay = null
                                                                        this.setState({localUpdate:true,brands:brand})
                                                                    }}>
                                                                        Delete
                                                                </a>
                                                            </div>
                                                        :
                                                            <div className="lsLogoOptions-box addlogobtn" onClick={(e) => {
                                                                this.inputFileOverlay.current.click()
                                                            }}>
                                                                <input type="file" ref={this.inputFileOverlay} accept="image/*" onChange={(e) => {
                                                                    this.setFile(e.target.files,"overlay")
                                                                }} style={{display:"none"}} />
                                                                <i className="fas fa-plus"></i>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        
                                        <div className="lsBannerList mt-2">
                                            <div className="lsBannerList-content">
                                                <div className="addBnr mt-3">
                                                    <input className="form-control form-control-sm" type="url" onChange={(e) => {
                                                        let brand = {...this.state.brands}
                                                        brand.redirect_url = e.target.value
                                                        this.setState({localUpdate:true,brands:brand})
                                                    }} value={this.state.brands.redirect_url ? this.state.brands.redirect_url : ""} placeholder={this.props.t("Enter Redirect URL")} />
                                                    <button className="mt-3" onClick={() => {
                                                        if(this.state.brands.redirect_url)
                                                            this.updateBrands([{name:"redirect_url",value:this.state.brands.redirect_url}]);
                                                    }}>{this.props.t("Add URL")}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>   

                }
            </div>
            </React.Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        isSharePopup: state.sharepopup.status,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        openToast: (message, typeMessage) => dispatch(actions.openToast(message, typeMessage))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Index);