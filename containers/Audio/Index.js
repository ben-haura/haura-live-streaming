import React from "react"
import axios from "../../axios-orders"
import { connect } from "react-redux";
import playlist from '../../store/actions/general';
import CensorWord from "../CensoredWords/Index"
import Image from "../Image/Index"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import SocialShare from "../SocialShare/Index"
import Canvas from "./Canvas"
import Link from "../../components/Link/index";
import Comment from "../Comments/Index"
import Date from "../Date"
import swal from "sweetalert"
import Router from 'next/router';
import Translate from "../../components/Translate/Index";
import Validator from '../../validators'
import Form from '../../components/DynamicForm/Index'
import Timeago from "../Common/Timeago"
import MemberFollow from "../User/Follow"
import Plans from "../User/Plans"

 
class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            page: 2,
            audio: props.pageData.audio,
            pagging: props.pageData.pagging ? props.pageData.pagging : null,
            relatedAudios:props.pageData.relatedAudios ? props.pageData.relatedAudios : [],
            password: props.pageData.password,
            styles: {
                visibility: "hidden",
                overflow: "hidden"
            },
            fullWidth: false,
            height:"-550px",
            width:props.isMobile ? props.isMobile : 993,
            needSubscription:props.pageData.needSubscription,
            plans:props.pageData.plans,
            tabType:props.pageData.tabType ? props.pageData.tabType : "about"
        }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.deleteAudio = this.deleteAudio.bind(this)
        this.pauseSong = this.pauseSong.bind(this)
        this.playSong = this.playSong.bind(this)
        this.playPauseSong = this.playPauseSong.bind(this)
        this.plansSubscription = React.createRef();
    }
    updateWindowDimensions() {
        this.setState({localUpdate:true, width: window.innerWidth },() => {
            this.getHeight();
        });
    }
    getHeight(){
        
    
    } 

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.pageData.audio != prevState.audio || nextProps.pageData.password != prevState.password ) {
            return {
                page:2, 
                audio: nextProps.pageData.audio, 
                pagging: nextProps.pageData.pagging ? nextProps.pageData.pagging : null,
                relatedAudios:nextProps.pageData.relatedAudios ? nextProps.pageData.relatedAudios : [],
                password:nextProps.pageData.password,
                needSubscription:nextProps.pageData.needSubscription,
                plans:nextProps.pageData.plans,
                tabType:nextProps.pageData.tabType ? nextProps.pageData.tabType : "about"
            }
        }else if (nextProps.pageData.song_id != prevState.song_id || nextProps.pageData.pausesong_id != prevState.playsong_id) {
            return {
                ...prevState
            }
        } else{
            return null
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    getItemIndex(item_id) {
        if(!this.state.items){
            return -1
        }
        const items = [...this.state.relatedAudios];
        const itemIndex = items.findIndex(p => p["audio_id"] == item_id);
        return itemIndex;
    }
    componentDidMount() {
        if($(".nav-tabs > li > a.active").length == 0){
            if(this.state.needSubscription){
              this.pushTab("plans")
            }else{
              this.pushTab("about")
            }
        }
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.getHeight();
        var _ = this
        $(document).ready(function () {
            if (_.state.audio) {
                if ($('#VideoDetailsDescp').height() > 110) {
                    _.setState({ showMore: true, styles: { visibility: "visible", overflow: "hidden", height: "100px" }, collapse: true })
                } else {
                    _.setState({ showMore: false, styles: { visibility: "visible", height: "auto" } })
                }
            }
        })
        this.props.socket.on('audioDeleted', data => {
            let id = data.audio_id
            const itemIndex = this.getItemIndex(id)
            if (this.state.relatedAudios && itemIndex > -1) {
                const items = [...this.state.relatedAudios]
                items.splice(itemIndex, 1);
                this.setState({localUpdate:true, relatedAudios: items })
            }
        });
       
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.relatedAudios && type == "audio") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.relatedAudios]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, relatedAudios: items })
                }
            }
        }); 
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.relatedAudios && type == "audio") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.relatedAudios]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, relatedAudios: items })
                }
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
            if (this.state.relatedAudios && itemType == "audio") {
                const itemIndex = this.getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...this.state.relatedAudios]
                    const changedItem = {...items[itemIndex]}
                    let loggedInUserDetails = {}
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails) {
                        loggedInUserDetails = this.props.pageData.loggedInUserDetails
                    }
                    if (removeLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['like_count'] = parseInt(changedItem['like_count']) - 1
                    }
                    if (removeDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) - 1
                    }
                    if (insertLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "like"
                        changedItem['like_count'] = parseInt(changedItem['like_count']) + 1
                    }
                    if (insertDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "dislike"
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) + 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, relatedAudios: items })
                }
            }
        });

        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.audio && id == this.state.audio.audio_id && type == "audio") {
                if (this.state.audio.audio_id == id) {
                    const data = { ...this.state.audio }
                    data.favourite_count = data.favourite_count - 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = null
                    }
                    this.setState({localUpdate:true, audio: data })
                }
            }
        });

        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.audio && id == this.state.audio.audio_id && type == "audio") {
                if (this.state.audio.audio_id == id) {
                    const data = { ...this.state.audio }
                    data.favourite_count = data.favourite_count + 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = 1
                    }
                    this.setState({localUpdate:true, audio: data })
                }
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
            if (this.state.audio && itemType == "audio" && this.state.audio.audio_id == itemId) {
                const item = { ...this.state.audio }
                let loggedInUserDetails = {}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails) {
                    loggedInUserDetails = this.props.pageData.loggedInUserDetails
                }
                if (removeLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['like_count'] = parseInt(item['like_count']) - 1
                }
                if (removeDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['dislike_count'] = parseInt(item['dislike_count']) - 1
                }
                if (insertLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "like"
                    item['like_count'] = parseInt(item['like_count']) + 1
                }
                if (insertDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "dislike"
                    item['dislike_count'] = parseInt(item['dislike_count']) + 1
                }
                this.setState({localUpdate:true, audio: item })
            }
        });

        this.props.socket.on('unfollowUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.audio && id == this.state.audio.owner.user_id && type == "members") {
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    const data = { ...this.state.audio }
                    const owner = data.owner
                    owner.follower_id = null
                    this.setState({localUpdate:true, audio: data })
                }
            }
        });
        this.props.socket.on('followUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.audio && id == this.state.audio.owner.user_id && type == "members") {
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    const data = { ...this.state.audio }
                    const owner = data.owner
                    owner.follower_id = 1
                    this.setState({localUpdate:true, audio: data })
                }
            }
        });
    }
    showMore = (e) => {
        e.preventDefault()
        let showMoreText = ""
        let styles = {}
        if (this.state.collapse) {
            showMoreText = Translate(this.props, "Show less")
            styles = { visibility: "visible", overflow: "visible" }
        } else {
            showMoreText = Translate(this.props, "Show more")
            styles = { visibility: "visible", overflow: "hidden", height: "100px" }
        }
        this.setState({localUpdate:true, styles: styles, showMoreText: showMoreText, collapse: !this.state.collapse })
    }
    deleteAudio = (e) => {
        e.preventDefault()
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: Translate(this.props, "Once deleted, you will not be able to recover this audio!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', this.state.audio.custom_url)
                    const url = "/audio/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                            } else {
                                Router.push(`/dashboard?type=audio`, `/dashboard/audio`)
                            }
                        }).catch(err => {
                            swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    linkify(inputText) {
        inputText = inputText.replace(/&lt;br\/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br \/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br&gt;/g, ' <br/>')
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
    
        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank" rel="nofollow">$1</a>');
    
        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>');
    
        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" rel="nofollow">$1</a>');
    
        return replacedText;
    }
    playSong = (song_id,audio,e) => {
        if(!audio.audio_file){
            Router.push(`/audio?id=${audio.custom_url}`, `/audio/${audio.custom_url}`)
            return;
        }
        let audios = this.props.audios
        let relatedAudios = this.state.relatedAudios
        if(relatedAudios && relatedAudios.length){
            let audio = this.state.relatedAudios
            audios = [...audios,...audio]
        }
        audios.forEach( (audio, itemIndex) => {
            if(!audio.audio_file){
                audios.splice(itemIndex, 1);
            }
        });
        if(audios && audios.length){
            let audio = this.state.audio
            audio.passwords = 1;
            audios.push(audio)
        }else{
            let audio = this.state.audio
            audio.passwords = 1;
            audios = [audio]
        }
        //add related videos
        
        this.setState({
            song_id:song_id,
            playsong_id:0,
            localUpdate:true
        },() => {
            this.props.updateAudioData(audios, song_id,0,this.props.t("Submit"),this.props.t("Enter Password"))
        })
        
    }
    pauseSong = (song_id,audio,e) => {
        if(!audio.audio_file){
            Router.push(`/audio?id=${audio.custom_url}`, `/audio/${audio.custom_url}`)
            return;
        }
        let audios = this.props.audios
        //add related videos
        let relatedAudios = this.state.relatedAudios
        if(relatedAudios && relatedAudios.length){
            let audio = this.state.relatedAudios
            audios = [...audios,...audio]
        }
        if(audios && audios.length){
            let audio = this.state.audio
            audio.passwords = 1
            audios.push(audio)
        }else{
            let audio = this.state.audio
            audio.passwords = 1;
            audios.push(audio)
        }
        audios.forEach( (audio, itemIndex) => {
            if(!audio.audio_file){
                audios.splice(itemIndex, 1);
            }
        });
        this.setState({
            song_id:song_id,
            playsong_id:song_id,
            localUpdate:true
        },() => {
            this.props.updateAudioData(audios, song_id,song_id,this.props.t("Submit"),this.props.t("Enter Password"))
        })
    }
    playPauseSong = (song_id,audio,e) => {
        if(!audio.audio_file){
            Router.push(`/audio?id=${audio.custom_url}`, `/audio/${audio.custom_url}`)
            return;
        }
        let audios = this.props.audios
        //add related videos
        let relatedAudios = this.state.relatedAudios
        if(relatedAudios && relatedAudios.length){
            let audio = this.state.relatedAudios
            audios = [...audios,...audio]
        }
        if(audios && audios.length){
            let audio = this.state.audio
            audio.passwords = 1;
            audios.push(audio)
        }else{
            let audio = this.state.audio
            audio.passwords = 1;
            audios.push(audio)
        }
        audios.forEach( (audio, itemIndex) => {
            if(!audio.audio_file){
                audios.splice(itemIndex, 1);
            }
        });
        if(this.props.song_id == 0 || song_id == this.props.pausesong_id || song_id != this.props.song_id){
            this.props.updateAudioData(audios, song_id,0,this.props.t("Submit"),this.props.t("Enter Password"))
        }else{
            this.props.updateAudioData(audios,song_id, song_id,this.props.t("Submit"),this.props.t("Enter Password"))
        }
    }
    openReport = (e) => {
        e.preventDefault()
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            this.props.openReport(true, this.state.audio.custom_url, 'audio')
        }
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
        let url = '/audio/password/' + this.props.pageData.id;
        this.setState({localUpdate:true, submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    this.setState({localUpdate:true, error: response.data.error, submitting: false });
                } else {
                    this.setState({localUpdate:true, submitting: false, error: null })
                    Router.push(`/audio?id=${this.props.pageData.id}`, `/audio/${this.props.pageData.id}`)
                }
            }).catch(err => {
                this.setState({localUpdate:true, submitting: false, error: err });
            });
    }
    formatDuration(duration){
        if(isNaN(duration)){
            return "00:00"
        }
        duration = Math.floor(duration)
        let d = Number(duration);
        var h = Math.floor(d / 3600).toString();
        var m = Math.floor(d % 3600 / 60).toString();
        var s = Math.floor(d % 3600 % 60).toString();

        var hDisplay = h.length > 0 ? (h.length < 2 ? "0" + h : h) : "00"
        var mDisplay = m.length > 0 ? ":" + (m.length < 2 ? "0" + m : m) : ":00"
        var sDisplay = s.length > 0 ? ":" + (s.length < 2 ? "0" + s : s) : ":00"
        return (hDisplay != "00" ? hDisplay+mDisplay : mDisplay.replace(":",'')) + sDisplay
    }
    pushTab = (type) => {
        if(this.state.tabType == type || !this.state.audio){
            return
        }
        this.setState({tabType:type,localUpdate:true})
        Router.push(`/audio?id=${this.state.audio.custom_url}`, `/audio/${this.state.audio.custom_url}?type=${type}`,{ shallow: true })
    }
    scrollToSubscriptionPlans = () => {
        if(this.state.tabType != "plans"){
            this.setState({localUpdate:true,tabType:"plans"},() => {
                this.plansSubscription.scrollIntoView()
            })
            return
        }
        this.plansSubscription.scrollIntoView()
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
            <React.Fragment>
                {
                this.state.audio && this.state.audio.approve != 1 ? 
                    <div className="col-md-12 approval-pending">
                        <div className="generalErrors">
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                {Translate(this.props,'This audio still waiting for admin approval.')}
                            </div>
                        </div>
                    </div>
                : null
                }                
                { 
                    this.state.audio.approve == 1 ? 
                    <div className="details-video-wrap audioDetails-wrap">
                        <div className="container"> 
                            <div className="row">
                                <div className="col-xl-9 col-lg-8">
                                    <div className="audioBnr">
                                        <div className="infoPlay">
                                            <div className="infoPlay-innr">
                                                <div className="miniplay">
                                                    <div className="imgAudio">
                                                        <Image image={this.state.audio.image} title={this.state.audio.title} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                                    </div>
                                                    {
                                                        !this.state.needSubscription ? 
                                                        this.props.song_id != this.state.audio.audio_id || this.props.pausesong_id == this.state.audio.audio_id ?
                                                                <div className="playbtn" onClick={this.playSong.bind(this,this.state.audio.audio_id,this.state.audio)}>
                                                                        <i className="fas fa-play"></i>
                                                                </div>
                                                            :
                                                            <div className="playbtn"  onClick={this.pauseSong.bind(this,this.state.audio.audio_id,this.state.audio)}>
                                                                <i className="fas fa-pause"></i>
                                                            </div> 
                                                        : <div className="subscription-update-plan-cnt">
                                                            <div className="subscription-update-plan-title">
                                                            {
                                                                    this.state.needSubscription.type == "upgrade" ? 
                                                                        this.props.t("To watch more content, kindly upgrade your Subcription Plan.")
                                                                    :
                                                                        this.props.t("To watch more content, kindly Subscribe.")
                                                            }
                                                            {
                                                                <button onClick={this.scrollToSubscriptionPlans}>
                                                                    {this.props.t("Subscription Plans")}
                                                                </button>
                                                            }
                                                            </div>
                                                        </div>
                                                    }
                                                    {
                                                        this.state.audio.peaks ? 
                                                            <div className="trackCanvas" onClick={this.playPauseSong.bind(this,this.state.audio.audio_id,this.state.audio)}>
                                                                <Canvas {...this.props} classV={"details"} peaks={this.state.audio.peaks} />
                                                            </div>
                                                    : null
                                                    }
                                                </div>

                                                
                                            </div>
                                        </div>
                                       
                                    </div>
                                </div>
                           
                            <div className="col-xl-9 col-lg-8">
                                <div className="videoDetailsWrap-content">
                                    <a className="videoName" href="#" onClick={(e) => e.preventDefault()}>{<CensorWord {...this.props} text={this.state.audio.title} />}</a>

                                    <div className="videoDetailsLikeWatch">
                                        <div className="watchBox">
                                            <span title={Translate(this.props, "Play Count")}>{this.state.audio.play_count + " "} {this.props.t("play_count", { count: this.state.audio.play_count ? this.state.audio.play_count : 0 })} </span>
                                        </div>
                                        
                                        <div className="vLDetailLikeShare">
                                            <div className="LikeDislikeWrap">
                                                <ul className="LikeDislikeList">
                                                {
                                                    this.state.audio.approve == 1 ?
                                                    <React.Fragment>
                                                    <li>
                                                        <Like icon={true} {...this.props} like_count={this.state.audio.like_count} item={this.state.audio} type="audio" id={this.state.audio.audio_id} />{"  "}
                                                    </li>
                                                    <li>
                                                        <Dislike icon={true} {...this.props} dislike_count={this.state.audio.dislike_count} item={this.state.audio} type="audio" id={this.state.audio.audio_id} />{"  "}
                                                    </li>
                                                    <li>
                                                        <Favourite icon={true} {...this.props} favourite_count={this.state.audio.favourite_count} item={this.state.audio} type="audio" id={this.state.audio.audio_id} />{"  "}
                                                    </li>
                                                    
                                                    <SocialShare {...this.props} hideTitle={true} buttonHeightWidth="30" url={`/audio/${this.state.audio.custom_url}`} title={this.state.audio.title} imageSuffix={this.props.pageData.imageSuffix} media={this.state.audio.image} />
                                                </React.Fragment>
                                                :  null
                                                }
                                                <li>
                                                    <div className="dropdown TitleRightDropdown">
                                                        <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_horiz"></span></a>
                                                            <ul className="dropdown-menu dropdown-menu-right edit-options">
                                                            {
                                                                this.state.audio.canEdit ?
                                                                    <li>
                                                                        <Link href="/create-audio" customParam={`id=${this.state.audio.custom_url}`} as={`/create-audio/${this.state.audio.custom_url}`}>
                                                                            <a href={`/create-audio/${this.state.audio.custom_url}`}><span className="material-icons" data-icon="edit"></span>{Translate(this.props, "Edit")}</a>
                                                                        </Link>
                                                                    </li>
                                                                    : null
                                                            }
                                                            {
                                                                this.state.audio.canDelete ?
                                                                    <li>
                                                                        <a onClick={this.deleteAudio.bind(this)} href="#"><span className="material-icons" data-icon="delete"></span>{Translate(this.props, "Delete")}</a>
                                                                    </li>
                                                                    : null
                                                            }
                                                            {
                                                            this.state.audio.approve == 1 && !this.state.audio.canEdit ? 
                                                            <li>
                                                                <a href="#" onClick={this.openReport.bind(this)}>
                                                                <span className="material-icons" data-icon="flag"></span>
                                                                    {Translate(this.props, "Report")}
                                                                </a>
                                                            </li>
                                                            : null
                                                            }
                                                        </ul>
                                                    </div>
                                                </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>        

                                    <div className="videoDetailsUserInfo">
                                        <div className="userInfoSubs">
                                            <div className="UserInfo">
                                                <div className="img">
                                                    <Link href="/member" customParam={`id=${this.state.audio.owner.username}`} as={`/${this.state.audio.owner.username}`}>
                                                        <a href={`/${this.state.audio.owner.username}`}>
                                                            <Image height="50" width="50" title={this.state.audio.owner.displayname} image={this.state.audio.owner.avtar} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                                        </a>
                                                    </Link>
                                                </div>
                                                <div className="content">

                                                    <Link href="/member" customParam={`id=${this.state.audio.owner.username}`} as={`/${this.state.audio.owner.username}`}>
                                                        <a className="UserName" href={`/${this.state.audio.owner.username}`}>
                                                            <React.Fragment>
                                                                {this.state.audio.owner.displayname}
                                                                {
                                                                    this.props.pageData.appSettings['member_verification'] == 1 && this.state.audio.owner.verified ?
                                                                        <span className="verifiedUser" title="verified"><span className="material-icons" data-icon="check"></span></span>
                                                                        : null
                                                                }
                                                            </React.Fragment>
                                                        </a>
                                                    </Link>
                                                    <span><Timeago {...this.props}>{this.state.audio.creation_date}</Timeago></span>
                                                </div>
                                            </div>
                                            <div className="userSubs">
                                                <MemberFollow  {...this.props} type="members" user={this.state.audio.owner} user_id={this.state.audio.owner.follower_id} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="details-tab">
                                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        {
                                            this.state.needSubscription ? 
                                            <li className="nav-item" ref={(ref) => this.plansSubscription = ref}>
                                                <a className={`nav-link${this.state.tabType == "plans" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("plans")
                                                } data-bs-toggle="tab" href="#plans" role="tab" aria-controls="discription" aria-selected="false">{Translate(this.props,"Choose Plan")}</a>
                                            </li>
                                            : null
                                        }
                                        
                                            <li className="nav-item">
                                                <a  className={`nav-link${this.state.tabType == "about" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("about")} data-bs-toggle="tab" href="#about" role="tab" aria-controls="about" aria-selected="true">{Translate(this.props, "About")}</a>
                                            </li>
                                           
                                            {
                                                this.props.pageData.appSettings[`${"audio_comment"}`] == 1 && this.state.audio.approve == 1?
                                                    <li className="nav-item">
                                                        <a className={`nav-link${this.state.tabType == "comments" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("comments")} data-bs-toggle="tab" href="#comments" role="tab" aria-controls="comments" aria-selected="true">{`${Translate(this.props,"Comments")}`}</a>
                                                    </li>
                                                    : null
                                            }
                                        </ul>
                                        <div className="tab-content" id="myTabContent">
                                        {
                                            this.state.needSubscription ? 
                                                <div className={`tab-pane fade${this.state.tabType == "plans" ? " active show" : ""}`} id="plans" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <p className="plan-upgrade-subscribe">
                                                        {
                                                        this.state.needSubscription.type == "upgrade" ? 
                                                            this.props.t("To watch more content, kindly upgrade your Subcription Plan.")
                                                            :
                                                            this.props.t("To watch more content, kindly Subscribe.")
                                                        }
                                                    </p>
                                                    <Plans {...this.props} userSubscription={this.state.needSubscription.loggedin_package_id ? true : false} userSubscriptionID={this.state.needSubscription.loggedin_package_id} itemObj={this.state.audio} member={this.state.audio.owner} user_id={this.state.audio.owner_id} plans={this.state.plans} />
                                                </div>
                                                </div>
                                            : null
                                        }
                                            <div className={`tab-pane fade${this.state.tabType == "about" ? " active show" : ""}`} id="about" role="tabpanel">
                                                <div className="details-tab-box">
                                                    {
                                                        this.state.audio.release_date ? 
                                                            <div className="animated-rater">
                                                                    <div className="tabInTitle"><h6>{Translate(this.props,'Release Date:')}</h6>
                                                                    <div className="channel_description">
                                                                    {
                                                                        <span dangerouslySetInnerHTML={{__html:Date(this.props,this.state.audio.creation_date,this.props.initialLanguage,'dddd, MMMM Do YYYY',this.props.pageData.defaultTimezone)}}></span>
                                                                    }
                                                                    </div>
                                                                    </div>                                                                                 
                                                            </div>
                                                    : null
                                                    }
                                                    {
                                                        this.state.audio.description ?
                                                            <React.Fragment>
                                                                <div className="tabInTitle"><h6>{Translate(this.props, "Description")}</h6></div>
                                                                <div className="channel_description" id="VideoDetailsDescp" style={{ ...this.state.styles, whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{__html:this.linkify(this.state.audio.description)}}>
                                                                    {/* <Linkify componentDecorator={this.componentDecorator}>{this.state.video.description}</Linkify> */}
                                                                </div>
                                                                {
                                                                    this.state.showMore ?
                                                                        <div className="VideoDetailsDescpBtn text-center">
                                                                            <a href="#" onClick={this.showMore.bind(this)} className="morelink">{Translate(this.props, this.state.showMoreText)}</a>
                                                                        </div>
                                                                        : null
                                                                }
                                                            </React.Fragment>
                                                            : null
                                                    }
                                                    

                                                </div>


                                            </div>
                                            {
                                                this.props.pageData.appSettings[`${"audio_comment"}`] == 1 && this.state.audio.approve == 1 ?
                                                    <div className={`tab-pane fade${this.state.tabType == "comments" ? " active show" : ""}`} id="comments" role="tabpanel">
                                                        <div className="details-tab-box">
                                                            <Comment  {...this.props}  owner_id={this.state.audio.owner_id} hideTitle={true} appSettings={this.props.pageData.appSettings} commentType="audio" type="audio" comment_item_id={this.state.audio.audio_id} />
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="col-xl-3 col-lg-4 videoSidebar" style={{ marginTop: !this.state.fullWidth ? this.state.height : "0px" }}>
                            {
                                this.state.relatedAudios.map(audio => {
                                    let audioImage = audio.image
                    
                                    return (
                                        <div key={audio.audio_id} className="sidevideoWrapOutr">
                                            <div key={audio.audio_id} className="ptv_videoList_wrap sidevideoWrap">
                                            <div className="videoList_thumb" >
                                                <Link href="/audio" customParam={`id=${audio.custom_url}`} as={`/audio/${audio.custom_url}`}>
                                                    <a>
                                                        <Image title={CensorWord("fn",this.props,audio.title)} image={audioImage} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                                    </a>
                                                </Link>
                                                {
                                                    audio.duration ?
                                                        <span className="videoTime">{this.formatDuration(audio.duration)}</span>
                                                        : null
                                                }
                                                {
                                                    this.props.song_id != audio.audio_id || this.props.pausesong_id == audio.audio_id ?
                                                        <div className="playbtn" onClick={this.playSong.bind(this,audio.audio_id,audio)}>
                                                            <i className="fas fa-play"></i>
                                                        </div>
                                                    :
                                                    <div className="playbtn"  onClick={this.pauseSong.bind(this,audio.audio_id,audio)}>
                                                        <i className="fas fa-pause"></i>
                                                    </div>
                                                }
                                            </div>
                                                <div className="videoList_content">
                                                    <div className={`videoTitle`}>
                                                        <Link href="/audio" customParam={`id=${audio.custom_url}`} as={`/audio/${audio.custom_url}`}>
                                                            <a>
                                                                <h4>{<CensorWord {...this.props} text={audio.title} />}</h4>
                                                            </a>
                                                        </Link>
                                                    </div>
                                                <div className="videoInfo">
                                                    <span className="videoViewDate">
                                                            <span title={Translate(this.props, "Play Count")}>{audio.play_count + " "} {this.props.t("play_count", { count: audio.play_count ? audio.play_count : 0 })} </span>                                                       
                                                    </span>
                                                </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                    </div>
                </div>
            : null 
                }
                
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        song_id:state.audio.song_id,
        pausesong_id:state.audio.pausesong_id,
        audios:state.audio.audios,

    };
};
const mapDispatchToProps = dispatch => {
    return {
        updateAudioData: (audios, song_id,pausesong_id,submitText,passwordText) => dispatch(playlist.updateAudioData(audios, song_id,pausesong_id,submitText,passwordText)),
        openReport: (status, contentId, contentType) => dispatch(playlist.openReport(status, contentId, contentType)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Index)