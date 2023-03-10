import React, { Component } from "react"
import { connect } from "react-redux"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import swal from "sweetalert"
import Validator from '../../validators'
import axios from "../../axios-orders"
import AdsIndex from "../Ads/Index"
import Image from "../Image/Index"
import Link from "../../components/Link/index";
import SocialShare from "../SocialShare/Index"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import WatchLater from "../WatchLater/Index"
import Timeago from "../Common/Timeago"
import Rating from "../Rating/Index"
import playlist from '../../store/actions/general';
import Currency from "../Upgrade/Currency"
import MemberFollow from "../User/Follow"
import Translate from "../../components/Translate/Index"
import CensorWord from "../CensoredWords/Index"
import config from "../../config"

const Gateways = dynamic(() => import("../Gateways/Index"), {
    ssr: false,
});
const Form = dynamic(() => import("../../components/DynamicForm/Index"), {
    ssr: false,
});
const Player = dynamic(() => import("./Player"), {
    ssr: false,
});
const MediaElementPlayer = dynamic(() => import("./MediaElementPlayer"), {
    ssr: false,
});
const OutsidePlayer = dynamic(() => import("./OutsidePlayer"), {
    ssr: false,
});
const Artists = dynamic(() => import("../Artist/Artists"), {
    ssr: false,
});
const StartLiveStreaming = dynamic(() => import("../LiveStreaming/StartLiveStreaming"), {
    ssr: false,
});
const MediaStreaming = dynamic(() => import("../LiveStreaming/MediaLiveStreaming"), {
    ssr: false,
});
const Comment = dynamic(() => import("../../containers/Comments/Index"), {
    ssr: false,
});
const Chat = dynamic(() => import("../LiveStreaming/Chat"), {
    ssr: false,
});
const RelatedVideos = dynamic(() => import("./RelatedVideos"), {
    ssr: false,
});
const Donation = dynamic(() => import("../Donation/Index"), {
    ssr: false,
});
const Members = dynamic(() => import("../User/Browse"), {
    ssr: false,
});
const Plans = dynamic(() => import("../User/Plans"), {
    ssr: false,
});


class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            styles: {
                visibility: "hidden",
                overflow: "hidden"
            },
            playedVideos: "",
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
            logout:false,
            needSubscription:props.pageData.needSubscription,
            plans:props.pageData.plans,
            tabType:props.pageData.tabType ? props.pageData.tabType : "about",
            timerValue:1
        }
        this.stopTimerPlay = false;
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.getHeight = this.getHeight.bind(this)
        this.plansSubscription = React.createRef();
        this.updatePlayerPlayTime = this.updatePlayerPlayTime.bind(this);
    }
    updateWindowDimensions() {
        this.setState({localUpdate:true, width: window.innerWidth },() => {
            this.getHeight();
        });
    }
    scheduledTime() {
        if(this.scheduledTimer){
            clearInterval(this.scheduledTimer);
        }
        if(this.state.video && this.state.video.scheduled){ 
            var that = this;
            this.scheduledTimer = setInterval(function() {
                var countDownDate = new Date(that.state.video.scheduled.replace(/ /g,"T")).getTime();
                
                // Get today's date and time
                var now = new Date().getTime() + that.state.timerValue;
            
                // Find the distance between now and the count down date
                var distance = countDownDate - now;

                // Time calculations for days, hours, minutes and seconds
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
                // Display the result in the element with 
                
                // If the count down is finished, write some text
                if (distance < 0) {
                    clearInterval(that.scheduledTimer);
                    that.setState({localUpdate:true,scheduledEndTime:that.props.t("Start in few seconds")})
                }else{
                    that.setState({localUpdate:true,scheduledEndTimeDay : days,scheduledEndTimeHours : hours,scheduledEndTimeMinutes : minutes,scheduledEndTimeSeconds :seconds ,timerValue:that.state.timerValue + 1000}) ;
                }
            }, 1000);
        }
    }
    getHeight(){
        if($('.videoPlayer').length && $(".videoPlayerHeight").length){
            let height = (($(".videoPlayerHeight").outerWidth(true) /  1.77176216) - 20) + "px";
            $(".player-wrapper, .video-js, .mejs__container").css("height",height);
            $(".mejs__container").css("width","100%");
            $("#background_theater").css("height",(($(".videoPlayerHeight").outerWidth(true) /  1.77176216) + 46) + "px");
            if(this.state.fullWidth){
                $(".videoPlayerHeight").css("height",(($(".videoPlayerHeight").outerWidth(true) /  1.77176216) + 46) + "px");
            }else{
                $(".videoPlayerHeight").css("height","auto");
            }
            if(this.state.fullWidth){
                $(".header-wrap").addClass("theater-mode")
            }else{
                $(".header-wrap").removeClass("theater-mode")
            }
            $('video, iframe').css('height', '100%').css("width","100%");
        }
        if($(".videoPlayerHeight").length){
            let height =  $(".videoPlayerHeight").outerHeight(true);
            if(this.state.video && this.state.video.status == 2){
                //height = 420;
            }
            if(height > 20)
                this.setState({localUpdate:true,height:`-${height}px`})
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
                gateways:false,
                playedVideos:nextProps.pageData.playedVideos ? nextProps.pageData.playedVideos : "",
                video: nextProps.pageData.video, 
                relatedVideos: nextProps.pageData.relatedVideos, 
                userAdVideo: nextProps.pageData.userAdVideo,
                adminAdVideo: nextProps.pageData.adminAdVideo, 
                playlist: nextProps.pageData.playlist, 
                playlistVideos: nextProps.pageData.playlistVideos,
                password: nextProps.pageData.password,
                adult: nextProps.pageData.adultVideo,
                logout:false,
                changeHeight:true,
                needSubscription:nextProps.pageData.needSubscription,
                plans:nextProps.pageData.plans,
                tabType:nextProps.pageData.tabType ? nextProps.pageData.tabType : "about"
            }
        } else{
            return null
        }

    }
    componentDidUpdate(prevProps,prevState){
        if(this.state.changeHeight){
            this.scheduledTime();
            this.getHeight();
            this.stopTimerPlay = false;
            this.setState({changeHeight:false,localUpdate:true})
        }
    }
    componentWillUnmount() {
        if(this.scheduledTimer){
            clearInterval(this.scheduledTimer);
        }
        this.stopTimerPlay = true;
        window.removeEventListener('resize', this.updateWindowDimensions);
        if(this.state.video && (this.state.video.type == 11 || this.state.video.type == 10)){
            return;
        }
        let deleteMessage = Translate(this.props, "Are you sure you want to close the player?")
        let deleteTitle = Translate(this.props, "Queue will be cleared")
        if (!this.state.needSubscription && this.props.pageData.appSettings['video_miniplayer'] == 1 && this.props.pageData.appSettings['enable_iframely'] == 0 && this.state.video && this.state.video.approve == 1 &&  this.state.video.status == 1 && this.state.width > 992 && !this.state.logout) {
            if (this.state.playlistVideos) {
                let videos = [...this.state.playlistVideos]
                videos.forEach( (video, itemIndex) => {
                    
                    if(video.is_active_package != 1){
                        videos.splice(itemIndex, 1);
                    }else{
                        videos[itemIndex].playerElem = this.props.pageData.appSettings['player_type']
                    }
                })
                let video = this.state.video
                video.playerElem = this.props.pageData.appSettings['player_type']
                this.props.updatePlayerData([], videos, video, deleteMessage, deleteTitle,this.props.pageData.liveStreamingURL)
            } else if (this.state.relatedVideos) {
                let videos = [...this.state.relatedVideos]
                videos.forEach( (video, itemIndex) => {
                    if(video.is_active_package != 1){
                        videos.splice(itemIndex, 1);
                    }else{
                        videos[itemIndex].playerElem = this.props.pageData.appSettings['player_type']
                    }
                })
                let video = this.state.video
                video.playerElem = this.props.pageData.appSettings['player_type']
                this.props.updatePlayerData(videos, [], video, deleteMessage, deleteTitle,this.props.pageData.liveStreamingURL)
            } else {
                let video = this.state.video
                video.playerElem = this.props.pageData.appSettings['player_type']
                this.props.updatePlayerData([], [], video, deleteMessage, deleteTitle,this.props.pageData.liveStreamingURL)
            }
        }else if(this.props.song_id)
            this.props.updateAudioData(this.props.audios, this.props.song_id,0,this.props.t("Submit"),this.props.t("Enter Password"))
    }
    componentDidMount() {
        if($(".nav-tabs > li > a.active").length == 0){
            if(this.state.needSubscription){
              this.pushTab("plans")
            }else{
              this.pushTab("videos")
            }
          }
          this.stopTimerPlay = false;
          this.getHeight();
          this.scheduledTime();
        if(this.props.song_id)
            this.props.updateAudioData(this.props.audios, this.props.song_id,this.props.song_id,this.props.t("Submit"),this.props.t("Enter Password"))

        if(this.props.pageData.appSettings["fixed_header"] == 1 && this.props.hideSmallMenu && !this.props.menuOpen){
           this.props.setMenuOpen(true)
        }
        const { BroadcastChannel } = require('broadcast-channel');
        const userChannel = new BroadcastChannel('user');
        userChannel.onmessage = channelData => {
            if(channelData.payload && channelData.payload.type && channelData.payload.type == "LOGOUT"){
                this.setState({localUpdate:true,logout:true})
            }else if(channelData.data && channelData.data.data && channelData.data.data.payload && channelData.data.data.payload.type == "LOGOUT"){
                this.setState({localUpdate:true,logout:true})
            }
        }
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        
        var _ = this
        _.props.updatePlayerData([], [])
        if (this.state.video && this.state.video.videoPaymentStatus) {
            if (this.state.video.videoPaymentStatus == "success") {
                swal("Success", Translate(this.props, "Video purchased successfully.", "success"));
            } else if (this.state.video.videoPaymentStatus == "fail") {
                swal("Error", Translate(this.props, "Something went wrong, please try again later", "error"));
            } else if (this.state.video.videoPaymentStatus == "cancel") {
                swal("Error", Translate(this.props, "You have cancelled the payment.", "error"));
            }
        }

        this.props.socket.on('liveStreamStatus', data => {
            let id = data.id;
            if (this.state.video && this.state.video.owner.idw == id) {
                if(data.action == "liveStreamStarted"){
                    Router.push(`/watch?id=${this.state.video.custom_url}`, `/watch/${this.state.video.custom_url}`)
                }
            }
        });

        this.props.socket.on('videoCreated', data => {
            let id = data.id;
            if (this.state.video && this.state.video.custom_url == id) {
                Router.push(`/watch?id=${id}`, `/watch/${id}`)
            }
        });

        this.props.socket.on('removeScheduledVideo', data => {
            let id = data.id
            let ownerId = data.ownerId
            if (this.state.video && this.state.video.video_id == id) {
                const video = { ...this.state.video }
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    video.scheduled_video_id = null
                    this.setState({localUpdate:true, video: video })
                }
            }
        });
        this.props.socket.on('scheduledVideo', data => {
            let id = data.id
            let ownerId = data.ownerId
            if (this.state.video && this.state.video.video_id == id) {
                const video = { ...this.state.video }
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    video.scheduled_video_id = 1
                    this.setState({localUpdate:true, video: video })
                }
            }
        });

        this.props.socket.on('unwatchlater', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            if (this.state.video && this.state.video.video_id == id) {
                const video = { ...this.state.video }
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    video.watchlater_id = null
                    this.setState({localUpdate:true, video: video })
                }
            }
        });
        this.props.socket.on('watchlater', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            if (this.state.video && this.state.video.video_id == id) {
                const video = { ...this.state.video }
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    video.watchlater_id = 1
                    this.setState({localUpdate:true, video: video })
                }
            }
        });

        this.props.socket.on('unfollowUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.video && id == this.state.video.owner.user_id && type == "members") {
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    const data = { ...this.state.video }
                    const owner = data.owner
                    owner.follower_id = null
                    this.setState({localUpdate:true, video: data })
                }
            }
        });
        this.props.socket.on('followUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.video && id == this.state.video.owner.user_id && type == "members") {
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    const data = { ...this.state.video }
                    const owner = data.owner
                    owner.follower_id = 1
                    this.setState({localUpdate:true, video: data })
                }
            }
        });
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            if (this.state.video && id == this.state.video.video_id && type == "videos") {
                const data = { ...this.state.video }
                data.rating = rating
                this.setState({localUpdate:true, video: data })
            }
        });
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.video && id == this.state.video.video_id && type == "videos") {
                if (this.state.video.video_id == id) {
                    const data = { ...this.state.video }
                    data.favourite_count = data.favourite_count - 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = null
                    }
                    this.setState({localUpdate:true, video: data })
                }
            }
        });
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.video && id == this.state.video.video_id && type == "videos") {
                if (this.state.video.video_id == id) {
                    const data = { ...this.state.video }
                    data.favourite_count = data.favourite_count + 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = 1
                    }
                    this.setState({localUpdate:true, video: data })
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
            if (this.state.video && itemType == "videos" && this.state.video.video_id == itemId) {
                const item = { ...this.state.video }
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
                this.setState({localUpdate:true, video: item })
            }
        });
        var _ = this
        if (_.state.video) {
            if ($('#VideoDetailsDescp').height() > 110) {
                _.setState({ showMore: true, styles: { visibility: "visible", overflow: "hidden", height: "100px" }, collapse: true })
            } else {
                _.setState({ showMore: false, styles: { visibility: "visible", height: "auto" } })
            }
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
        let url = '/videos/password/' + this.props.pageData.id;
        this.setState({localUpdate:true, submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    this.setState({localUpdate:true, error: response.data.error, submitting: false });
                } else {
                    this.setState({localUpdate:true, submitting: false, error: null })
                    Router.push(`/watch?id=${this.props.pageData.id}`, `/watch/${this.props.pageData.id}`)
                }
            }).catch(err => {
                this.setState({localUpdate:true, submitting: false, error: err });
            });
    }
    playlistOpen = (e) => {
        e.preventDefault()
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            this.props.openPlaylist(true, this.state.video.video_id)
        }
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
    embedPlayer = (e) => {
        e.preventDefault()
    }
    miniPlayer = (e) => {
        e.preventDefault()
        Router.back()
        //this.props.openPlayer(this.state.video.video_id, this.state.relatedVideos)
    }
    openReport = (e) => {
        e.preventDefault()
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            this.props.openReport(true, this.state.video.custom_url, 'videos')
        }
    }
    downloadBtn = (e) => {
        e.preventDefault();
        
    }
    deleteVideo = (e) => {
        e.preventDefault()
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: Translate(this.props, "Once deleted, you will not be able to recover this video!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('video_id', this.state.video.video_id)
                    const url = "/videos/delete" 
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                            } else {
                                this.props.openToast(Translate(this.props, response.data.message), "success");
                                this.setState({localUpdate:true,logout:true},() => {
                                    Router.push(`/dashboard?type=videos`, `/dashboard/videos`)
                                })
                            }
                        }).catch(err => {
                            swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    fullWidth = (e) => {
        e.preventDefault()
        this.setState({localUpdate:true, fullWidth: !this.state.fullWidth },() => {
            this.getHeight();
        })
    }
    donationFunction = () => {
        window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${this.state.video.paypal_email}&lc=US&item_name=${`Donation+to+` + encodeURI(this.state.video.displayname)}&no_note=0&cn=&currency_code=${this.props.pageData.appSettings['payment_default_currency']}&bn=PP-DonationsBF:btn_donateCC_LG.gif:NonHosted'`
    }
    getItemIndex(item_id) {
        const videos = [...this.state.playlistVideos];
        const itemIndex = videos.findIndex(p => p["video_id"] == item_id);
        return itemIndex;
    }
    getRelatedVideosIndex(item_id){
        const videos = [...this.state.relatedVideos];
        const itemIndex = videos.findIndex(p => p["video_id"] == item_id);
        return itemIndex;
    }
    goLive = () => {
        Router.push(`/create-livestreaming?id=${this.state.video.custom_url}`, `/live-streaming/${this.state.video.custom_url}`)
    }
    setReminder = (e) => {
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
            return
        }
        e.preventDefault();
        const formData = new FormData()
        let url = "/videos/reminder"
        formData.append("video_id",this.state.video.video_id);
        axios.post(url, formData)
            .then(response => {
                
            }).catch(err => {
                
            });
        //delete
    }
    videoEnd = () => {

        let video_id = this.state.video.video_id
        let itemIndex = 0
        if(this.state.playlistVideos && this.state.playlistVideos.length){
            itemIndex = this.getItemIndex(video_id)
            if (itemIndex > -1) {
                const items = [...this.state.playlistVideos]
                if(itemIndex+2 <= this.state.playlistVideos.length){
                    itemIndex = itemIndex + 1
                }else{
                    itemIndex = 0
                }
                Router.push(`/watch?id=${items[itemIndex]['custom_url']}&list=${this.state.playlist.custom_url}`, `/watch/${items[itemIndex]['custom_url']}?list=${this.state.playlist.custom_url}`)
            }
        }else if(this.state.relatedVideos.length){
            const isAutoplay = localStorage.getItem("autoplay")
            if(isAutoplay && this.props.pageData.appSettings['video_autoplay'] == 1 && this.props.pageData.appSettings['enable_iframely'] == 0){
                itemIndex = this.getRelatedVideosIndex(video_id)
                //first video played
                if (this.state.relatedVideos && this.state.relatedVideos.length) {
                    let playedVideos = ""
                    let playedString = this.state.playedVideos;
                    if(playedString){
                        let played = playedString.split(",")
                        played.push(this.state.video.video_id)
                        playedVideos = played.join(",")
                    }else{
                        playedVideos = `${this.state.video.video_id}`
                    }
                    const items = [...this.state.relatedVideos]
                    Router.push(`/watch?id=${items[0]['custom_url']}&playedVideos=${playedVideos}`, `/watch/${items[0]['custom_url']}`)
                }
            }
        }
    }
    mouseOut = () => {
        $(".expand").hide()
        $(".watermarkLogo").hide()
    }
    mouseEnter = () => {
        if(this.state.video && this.state.video.status == 1){
            $(".watermarkLogo").show()
            $(".expand").show()
        }
    }
    componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank" rel="nofollow">
          {text}
        </a>
     );
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
    purchaseClicked = () => {
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        }else{
            this.setState({localUpdate:true,gateways:true,gatewaysURL:`/videos/purchase/${this.state.video.video_id}`});
            //redirect to payment page
            //window.location.href = `/videos/purchase/${this.state.video.video_id}`
        }
    }
    pushTab = (type) => {
        if(this.state.tabType == type || !this.state.video){
            return
        }
        this.setState({tabType:type,localUpdate:true})
        Router.push(`/watch?id=${this.state.video.custom_url}`, `/watch/${this.state.video.custom_url}?type=${type}`,{ shallow: true })
    }
    updatePlayerPlayTime = (time) => {
        if(this.stopTimerPlay)
            this.props.upatePlayerTimeProp(time)
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
        
        let currentPlaying = 0
        if (this.state.playlistVideos) {
            currentPlaying = this.state.playlistVideos.findIndex(p => p["video_id"] == this.state.video.video_id);
            currentPlaying = currentPlaying + 1
        }
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

        let userBalance = {}
        userBalance['package'] = { price: parseInt(this.state.video ? this.state.video.price : 0) } 

        let gatewaysHTML = ""

        if(this.state.gateways){
            gatewaysHTML = <Gateways {...this.props} success={() => {
                this.props.openToast(Translate(this.props, "Payment done successfully."), "success");
                setTimeout(() => {
                    let id = this.state.video.custom_url
                    Router.push(`/watch?id=${id}`, `/watch/${id}`)
                  },1000);
            }} successBank={() => {
                this.props.openToast(Translate(this.props, "Your bank request has been successfully sent, you will get notified once it's approved"), "success");
                this.setState({localUpdate:true,gateways:null})
            }} bank_price={this.state.video.price} bank_type="video_purchase" bank_resource_type="video" bank_resource_id={this.state.video.custom_url} tokenURL={`videos/successulPayment/${this.state.video.video_id}`} closePopup={() => this.setState({localUpdate:true,gateways:false})} gatewaysUrl={this.state.gatewaysURL} />
        }


        let videoImage = this.state.video ? this.state.video.image : ""
        
        if(this.state.video){
            if(this.props.pageData.livestreamingtype == 0 && this.state.video.mediaserver_stream_id &&  !this.state.video.orgImage && this.state.video.is_livestreaming == 1 && parseInt(this.props.pageData.appSettings['antserver_media_hlssupported']) == 1){
                if(this.props.pageData.liveStreamingCDNServerURL){
                    videoImage = `${this.props.pageData.liveStreamingCDNServerURL}/${this.props.pageData.streamingAppName}/previews/${this.state.video.mediaserver_stream_id}.png`
                }else
                    videoImage = `${this.props.pageData.liveStreamingServerURL}:5443/${this.props.pageData.streamingAppName}/previews/${this.state.video.mediaserver_stream_id}.png`
            }else  if(this.state.video.mediaserver_stream_id &&  this.state.video.image && (this.state.video.image.indexOf(`LiveApp/previews`) > -1 || this.state.video.image.indexOf(`WebRTCAppEE/previews`) > -1)){
                if(this.props.pageData.liveStreamingCDNURL){
                    videoImage = `${this.props.pageData.liveStreamingCDNURL}${this.state.video.image.replace(`/LiveApp`,'').replace(`/WebRTCAppEE`,'')}`
                }else
                    videoImage = `${this.props.pageData.liveStreamingServerURL}:5443${this.state.video.image}`
            }
        }

        //scheduled timer
        let scheduledTimer = []
        let days = this.state.scheduledEndTimeDay 
        let hours = this.state.scheduledEndTimeHours
        let minutes = this.state.scheduledEndTimeMinutes
        let seconds = this.state.scheduledEndTimeSeconds

        if(days > 0){
            scheduledTimer.push(days + " ")
            scheduledTimer.push(this.props.t("day_count", { count: days }))
        }
        if(hours > 0){
            scheduledTimer.push(hours + " ")
            scheduledTimer.push(this.props.t("hour_count", { count: hours }))
        }
        if(minutes > 0){
            scheduledTimer.push(minutes + " ")
            scheduledTimer.push(this.props.t("minute_count", { count: minutes }))
        }
        if(seconds > 0 && days == 0 && hours == 0 && minutes == 0){
            scheduledTimer.push(seconds + " ")
            scheduledTimer.push(this.props.t("second_count", { count: seconds }))
        }
        return (
            <React.Fragment>
                {
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
                    {gatewaysHTML}
                    <div className="details-video-wrap">
                        <div className="container">
                            <div className="row">
                                {
                                    this.state.adult ?
                                        <div className={`col-xl-9 col-lg-8`}>
                                            <div className="adult-wrapper">
                                                {Translate(this.props, 'This video contains adult content.To view this video, Turn on adult content setting from site footer.')}
                                            </div>
                                        </div>
                                        :
                                        <React.Fragment>
                                            {
                                             this.state.video && this.state.video.approve != 1 ? 
                                                 <div className="col-xl-9 col-lg-8  approval-pending">
                                                     <div className="generalErrors">
                                                         <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                                             {Translate(this.props,'This video still waiting for admin approval.')}
                                                         </div>
                                                    </div>
                                                </div>
                                            : null
                                            }
                                            <div id="background_theater" style={{display:this.state.fullWidth ? "block" : "none"}}></div>
                                            <div className={`${this.state.fullWidth ? "col-lg-12" : "col-xl-9 col-lg-8"} videoPlayerHeight`}>
                                               {
                                                   !this.state.needSubscription ?  
                                                <div onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseOut} >
                                                    <div className="videoPlayer">
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
                                                            this.state.video.is_livestreaming == 1 && this.state.video.type == 11 ?
                                                                <MediaStreaming {...this.props} getHeight={this.getHeight} resizeWindow={this.updateWindowDimensions} banners={this.props.pageData.banners} brands={this.props.pageData.brands} needSubscription={this.state.needSubscription} width={this.state.width} videoElem={this.state.video} viewer={this.state.video.total_viewer} height={this.props.pageData.fromAPP ? "200px" : ( this.state.width > 992 ? "550px" : "220px")}   custom_url={this.state.video.custom_url} streamingId={this.state.video.mediaserver_stream_id} currentTime={this.props.pageData.currentTime} role="audience" imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video} {...this.props.pageData.video} />
                                                            :
                                                            this.state.video.is_livestreaming == 1  && this.state.video.type == 10 ?
                                                                <StartLiveStreaming {...this.props} getHeight={this.getHeight} needSubscription={this.state.needSubscription} width={this.state.width} videoElem={this.state.video} viewer={this.state.video.total_viewer} height={this.props.pageData.fromAPP ? "200px" : ( this.state.width > 992 ? "550px" : "220px")}   custom_url={this.state.video.custom_url} channel={this.state.video.channel_name} currentTime={this.props.pageData.currentTime} role="audience" imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video} {...this.props.pageData.video} />
                                                            :
                                                            this.props.pageData.appSettings['player_type'] == "element" && ((this.state.video.type == 3 && this.state.video.video_location) || (
                                                                this.state.video.type == 1  && this.state.video.code)) && !this.state.video.scheduled && this.state.video.approve == 1 ?
                                                                <MediaElementPlayer {...this.props} upatePlayerTime={this.updatePlayerPlayTime} purchaseClicked={this.purchaseClicked} getHeight={this.getHeight} ended={this.videoEnd} height={this.props.pageData.fromAPP ? "200px" : ( this.state.width > 992 ? "550px" : "220px")} userAdVideo={this.state.userAdVideo} adminAdVideo={this.state.adminAdVideo}  playlistVideos={this.state.playlistVideos} currentPlaying={this.state.currentPlaying} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video} {...this.props.pageData.video} />
                                                            : 
                                                            ((this.state.video.type == 3 && this.state.video.video_location) || (this.state.video.type == 11 && this.state.video.code))  && !this.state.video.scheduled && this.state.video.approve == 1 ?
                                                                <Player {...this.props} purchaseClicked={this.purchaseClicked} upatePlayerTime={this.updatePlayerPlayTime} getHeight={this.getHeight} ended={this.videoEnd} height={this.props.pageData.fromAPP ? "200px" : ( this.state.width > 992 ? "550px" : "220px")} userAdVideo={this.state.userAdVideo} adminAdVideo={this.state.adminAdVideo}  playlistVideos={this.state.playlistVideos} currentPlaying={this.state.currentPlaying} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video} {...this.props.pageData.video} />
                                                            :
                                                            (!this.state.video.scheduled || this.state.video.approve == 1) && this.state.video.type != 11 ?
                                                                <OutsidePlayer {...this.props} liveStreamingURL={this.props.pageData.liveStreamingURL} upatePlayerTime={this.updatePlayerPlayTime} getHeight={this.getHeight} ended={this.videoEnd}  height={this.props.pageData.fromAPP ? "200px" : ( this.state.width > 992 ? "550px" : "220px")}  playlistVideos={this.state.playlistVideos} currentPlaying={this.state.currentPlaying} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.video}  {...this.props.pageData.video} />
                                                            : <div className="scheduled-cnt player-wrapper">
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
                                                                                <span dangerouslySetInnerHTML={{__html:Date(this.props,this.state.video.scheduled,this.props.initialLanguage,'MMMM Do YYYY, hh:mm A',this.props.pageData.loggedInUserDetails ? this.props.pageData.loggedInUserDetails.timezone : this.props.pageData.defaultTimezone)}}></span>
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
                                                    {
                                                        this.state.width > 992 ?
                                                            <div className="expand" onClick={this.fullWidth.bind(this)}>
                                                                <span className="home-theater">
                                                                    <i className="material-icons" data-icon="open_in_full"></i>
                                                                </span>
                                                            </div>
                                                            : null
                                                    }
                                                </div>
                                                : 
                                                    <div className="videoPlayer player-wrapper">
                                                        <div className="subscription-update-plan-cnt">
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
                                                            {
                                                                userBalance.package.price > 0 ?
                                                                <React.Fragment>
                                                                    {
                                                                        this.props.t("or")
                                                                    }
                                                                    {
                                                                        <button onClick={this.purchaseClicked}>
                                                                            {this.props.t("Pay {{price}} to watch this video.",{price:Currency({...this.props,...userBalance})}).replace("<!-- -->","")}
                                                                        </button>
                                                                    }
                                                                </React.Fragment>
                                                            : null
                                                            }
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                {
                                                 !this.state.needSubscription && this.state.video.approve == 1 ? 
                                                <div className="bntfullWidht video-options" style={{display:"none"}}>
                                                    {/* <a href="#" onClick={this.miniPlayer.bind(this)}>
                                                        <i className="fas fa-compress"></i> {Translate(this.props,'Mini Player')}
                                                    </a> */}
                                                    <a href="#" onClick={this.embedPlayer.bind(this)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"></path></svg> {Translate(this.props, "Embed")}
                                                    </a>
                                                </div>
                                                : null
                                                }
                                            </div>
                                            {
                                                !this.state.needSubscription && this.state.width <= 992 && this.state.video && this.state.video.approve == 1 && this.state.video.enable_chat == 1 && ( (this.state.video.is_livestreaming == 1 && (this.state.video.channel_name || this.state.video.mediaserver_stream_id)) || this.state.video.scheduled   ) ? 
                                                    <div className="col-lg-8 col-xl-9">
                                                        <div className="ls_sidbar top_video_chat">
                                                            <Chat {...this.props} channel={this.state.video.channel_name} streamId={this.state.video.mediaserver_stream_id} custom_url={this.state.video.custom_url} comments={this.state.video.chatcomments ? this.state.video.chatcomments : []} />
                                                        </div>    
                                                    </div>
                                                : null
                                            }
                                            <div className="col-lg-8 col-xl-9">
                                                <div className="videoDetailsWrap-content">
                                                    <a className="videoName" href="#" onClick={(e) => e.preventDefault()}>{<CensorWord {...this.props} text={this.state.video.title} />}</a>

                                                    <div className="videoDetailsLikeWatch">
                                                        <div className="watchBox">
                                                            <span title={Translate(this.props, "Views")}>{this.state.video.view_count + " "} {this.props.t("view_count", { count: this.state.video.view_count ? this.state.video.view_count : 0 })} </span>
                                                        </div>
                                                        
                                                        <div className="vLDetailLikeShare">
                                                            <div className="LikeDislikeWrap">
                                                                <ul className="LikeDislikeList">
                                                                
                                                                
                                                                    {
                                                                    this.state.video.approve == 1 ? 
                                                                    <React.Fragment>
                                                                    <li>
                                                                        <Like icon={true} {...this.props} like_count={this.state.video.like_count} item={this.state.video} type="video" id={this.state.video.video_id} />{"  "}
                                                                    </li>
                                                                    <li>
                                                                        <Dislike icon={true} {...this.props} dislike_count={this.state.video.dislike_count} item={this.state.video} type="video" id={this.state.video.video_id} />{"  "}
                                                                    </li>
                                                                    <li>
                                                                        <Favourite icon={true} {...this.props} favourite_count={this.state.video.favourite_count} item={this.state.video} type="video" id={this.state.video.video_id} />{"  "}
                                                                    </li>
                                                                    </React.Fragment>
                                                                    : null
                                                                    }
                                                                    {
                                                                    this.state.video.approve == 1 ? 
                                                                    
                                                                        this.props.pageData.appSettings["enable_playlist"] == 1 && (!this.props.pageData.loggedInUserDetails || this.props.pageData.levelPermissions['playlist.create'] == 1) ?
                                                                        <li>
                                                                            <a className="addPlaylist" title={Translate(this.props, "Save to playlist")} onClick={this.playlistOpen} href="#">
                                                                                    <span className="material-icons" data-icon="playlist_add"></span>
                                                                            </a>                                                                                
                                                                        </li>
                                                                        : null
                                                                     : null
                                                                    }
                                                                    {
                                                                    this.state.video.approve == 1 && this.props.pageData.appSettings['video_embed_code'] == 1 ? 
                                                                        <li>
                                                                            <a className="embedvideo" title={Translate(this.props, "Embed")} onClick={(e) => {e.preventDefault();this.setState({localUpdate:true,"embed":this.state.embed ? false : true})}} href="#">
                                                                                    <span className="material-icons" data-icon="code"></span>
                                                                            </a>                                                                                
                                                                        </li>
                                                                        : null
                                                                    }
                                                                    {
                                                                    this.state.video.approve == 1 ? 
                                                                        <SocialShare {...this.props} hideTitle={true} className="video_share" buttonHeightWidth="30" tags={this.state.video.tags} url={`/watch/${this.state.video.custom_url}`} title={this.state.video.title} imageSuffix={this.props.pageData.imageSuffix} media={this.state.video.image} />
                                                                        : null
                                                                    }
                                                                    <li>
                                                                        <div className="dropdown TitleRightDropdown">
                                                                            <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_horiz"></span></a>
                                                                                <ul className="dropdown-menu dropdown-menu-right edit-options">
                                                                                {
                                                                                    this.state.video.canEdit ?
                                                                                        this.state.video.scheduled || (this.state.video.approve == 0 && this.state.video.type == 11) ?
                                                                                        <li>
                                                                                            <Link href="/create-livestreaming" customParam={`id=${this.state.video.custom_url}`} as={`/live-streaming/${this.state.video.custom_url}`}>
                                                                                                <a><span className="material-icons" data-icon="edit"></span>{Translate(this.props, "Edit")}</a>
                                                                                            </Link>
                                                                                        </li>
                                                                                        :
                                                                                        <li>
                                                                                            <Link href="/create-video" customParam={`id=${this.state.video.custom_url}`} as={`/create-video/${this.state.video.custom_url}`}>
                                                                                                <a href={`/create-video/${this.state.video.custom_url}`}><span className="material-icons" data-icon="edit"></span>{Translate(this.props, "Edit")}</a>
                                                                                            </Link>
                                                                                        </li>
                                                                                        : null
                                                                                }
                                                                                {
                                                                                    this.state.video.canDelete ?
                                                                                        <li>
                                                                                            <a onClick={this.deleteVideo.bind(this)} href="#"><span className="material-icons" data-icon="delete"></span>{Translate(this.props, "Delete")}</a>
                                                                                        </li>
                                                                                        : null
                                                                                }
                                                                                {
                                                                                    this.props.pageData && this.props.pageData.levelPermissions && this.props.pageData.levelPermissions['video.download'] == 1 && this.state.video.downloadFiles ?
                                                                                        <li>
                                                                                            <a onClick={(e) => {
                                                                                                    e.preventDefault();
                                                                                                    this.setState({localUpdate:true,"download":this.state.download ? false : true})
                                                                                                    }
                                                                                                } href="#"><span className="material-icons" data-icon="download"></span>{Translate(this.props, "Download Video")}</a>
                                                                                        </li>
                                                                                        : null
                                                                                }
                                                                                
                                                                                {
                                                                                this.state.video.approve == 1 && !this.state.video.canEdit ? 
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
                                                    {
                                                        this.state.video && this.state.video.downloadFiles && this.state.download ? 
                                                        <div className="videoDownload">
                                                            {
                                                                this.state.video.downloadFiles.map(item => {
                                                                    let url = item.url.indexOf('http://') == -1 && item.url.indexOf("https://") == -1 ? this.props.pageData.imageSuffix+item.url : item.url
                                                                    return (
                                                                        <a key={item.key} href={url} download target="_blank">{item.key}</a>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    : null
                                                    }
                                                    {
                                                        this.state.embed ? 
                                                        <div className="videoEmbed" >
                                                            <textarea name="embed" className="form-control" onChange={() => {}} value={`<iframe src="${config.app_server}/embed/${this.state.video.custom_url}" frameborder="0" width="700" height="400" allowfullscreen><iframe>`}>
                                                                
                                                            </textarea> 
                                                        </div>
                                                    : null
                                                    }

                                                    {
                                                        this.props.pageData.appSettings['video_tip'] == 1 && (this.state.video && this.state.video.tips) ?
                                                            <Donation {...this.props} item={this.state.video} custom_url={this.state.video.custom_url} item_id={this.state.video.video_id} item_type="video" />                          
                                                    : null
                                                    }
                                                    
                                                    <div className="videoDetailsUserInfo">
                                                        <div className="userInfoSubs">
                                                            <div className="UserInfo">
                                                                <div className="img">
                                                                    <Link href="/member" customParam={`id=${this.state.video.owner.username}`} as={`/${this.state.video.owner.username}`}>
                                                                        <a href={`/${this.state.video.owner.username}`}>
                                                                            <Image height="50" width="50" title={this.state.video.owner.displayname} image={this.state.video.owner.avtar} imageSuffix={this.props.pageData.imageSuffix}  siteURL={this.props.pageData.siteURL} />
                                                                        </a>
                                                                    </Link>
                                                                </div>
                                                                <div className="content">

                                                                    <Link href="/member" customParam={`id=${this.state.video.owner.username}`} as={`/${this.state.video.owner.username}`}>
                                                                        <a className="UserName" href={`/${this.state.video.owner.username}`}>
                                                                            <React.Fragment>
                                                                                {this.state.video.owner.displayname}
                                                                                {
                                                                                    this.props.pageData.appSettings['member_verification'] == 1 && this.state.video.owner.verified ?
                                                                                        <span className="verifiedUser" title="verified"><span className="material-icons" data-icon="check"></span></span>
                                                                                        : null
                                                                                }
                                                                            </React.Fragment>
                                                                        </a>
                                                                    </Link>
                                                                    <span><Timeago {...this.props}>{this.state.video.creation_date}</Timeago></span>
                                                                </div>
                                                            </div>
                                                            <div className="userSubs">
                                                                <MemberFollow  {...this.props} type="members" user={this.state.video.owner} user_id={this.state.video.owner.follower_id} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="details-tab">
                                                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                            {
                                                                this.state.needSubscription ? 
                                                                    <li className="nav-item">
                                                                    <a className={`nav-link${this.state.tabType == "plans" ? " active" : ""}`} onClick={
                                                                        () => this.pushTab("plans")
                                                                    } data-bs-toggle="tab" href="#plans" ref={(ref) => this.plansSubscription = ref} role="tab" aria-controls="discription" aria-selected="false">{Translate(this.props,"Choose Plan")}</a>
                                                                    </li>
                                                                : null
                                                            }
                                                            <li className="nav-item">
                                                                <a className={`nav-link${this.state.tabType == "about" ? " active" : ""}`} onClick={
                                                                    () => this.pushTab("about")
                                                                } data-bs-toggle="tab" href="#about" role="tab" aria-controls="about" aria-selected="true">{Translate(this.props, "About")}</a>
                                                            </li>
                                                            {
                                                                this.props.pageData.video.donors && this.props.pageData.video.donors.results.length ?
                                                                    <li className="nav-item">
                                                                        <a className={`nav-link${this.state.tabType == "donors" ? " active" : ""}`} onClick={
                                                                            () => this.pushTab("donors")
                                                                        } data-bs-toggle="tab" href="#donors" role="tab" aria-controls="donors" aria-selected="true">{Translate(this.props, "Donors")}</a>
                                                                    </li>
                                                                    : null
                                                            }
                                                            {
                                                                this.props.pageData.video.artists && this.props.pageData.video.artists.results.length ?
                                                                    <li className="nav-item">
                                                                        <a className={`nav-link${this.state.tabType == "artists" ? " active" : ""}`} onClick={
                                                                            () => this.pushTab("artists")
                                                                        } data-bs-toggle="tab" href="#artists" role="tab" aria-controls="artists" aria-selected="true">{Translate(this.props, "Artists")}</a>
                                                                    </li>
                                                                    : null
                                                            }
                                                            {
                                                                this.props.pageData.appSettings[`${"video_comment"}`] == 1 && this.state.video.approve == 1?
                                                                    <li className="nav-item">
                                                                        <a className={`nav-link${this.state.tabType == "comments" ? " active" : ""}`} onClick={
                                                                            () => this.pushTab("comments")
                                                                        } data-bs-toggle="tab" href="#comments" role="tab" aria-controls="comments" aria-selected="true">{`${Translate(this.props,"Comments")}`}</a>
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
                                                                    <Plans {...this.props} userSubscription={this.state.needSubscription.loggedin_package_id ? true : false} userSubscriptionID={this.state.needSubscription.loggedin_package_id} itemObj={this.state.video} member={this.state.video.owner} user_id={this.state.video.owner_id} plans={this.state.plans} />
                                                                </div>
                                                                </div>
                                                            : null
                                                            }
                                                            <div className={`tab-pane fade${this.state.tabType == "about" ? " active show" : ""}`} id="about" role="tabpanel">
                                                                <div className="details-tab-box">
                                                                    {
                                                                        this.props.pageData.appSettings[`${"video_rating"}`] == 1 && this.state.video.approve == 1 ?
                                                                            <div className="animated-rater">
                                                                                 <div className="tabInTitle"><h6>{Translate(this.props,'Rating')}</h6>
                                                                                    <div className="channel_description flexItemSpaceRight15">
                                                                                     <Rating {...this.props}  rating={this.state.video.rating} type="video" id={this.state.video.video_id} />
                                                                                    </div>
                                                                                 </div>                                                                                 
                                                                            </div>
                                                                            : null
                                                                    }
                                                                    {
                                                                        this.props.pageData.appSettings['video_donation'] && this.state.video.approve == 1 && this.state.video.donation && this.state.video.paypal_email && (!this.props.pageData.loggedInUserDetails || (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id != this.state.video.owner_id)) ?
                                                                            <div className="animated-rater">
                                                                                <div className="tabInTitle"><h6>{Translate(this.props,'Donate')}</h6></div>
                                                                                <div className="channel_description">
                                                                                    <button onClick={this.donationFunction} >{Translate(this.props, 'Donate')}</button>
                                                                                </div>
                                                                            </div>
                                                                        : null
                                                                    }
                                                                    {
                                                                        this.state.video.description ?
                                                                            <React.Fragment>
                                                                                <div className="tabInTitle"><h6>{Translate(this.props, "Description")}</h6></div>
                                                                                <div className="channel_description" id="VideoDetailsDescp" style={{ ...this.state.styles, whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{__html:this.linkify(this.state.video.description)}}>
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

                                                                    {
                                                                        this.state.video.category ?
                                                                            <React.Fragment>
                                                                                <div className="tabInTitle categories_cnt"><h6>{Translate(this.props, "Category")}</h6>
                                                                                <div className="boxInLink">
                                                                                    {
                                                                                        <Link href={`/category`} customParam={`type=video&id=` + this.state.video.category.slug} as={`/video/category/` + this.state.video.category.slug}>
                                                                                            <a>
                                                                                                {<CensorWord {...this.props} text={this.state.video.category.title} />}
                                                                                            </a>
                                                                                        </Link>
                                                                                    }
                                                                                </div>
                                                                                {
                                                                                    this.state.video.subcategory ?
                                                                                        <React.Fragment>
                                                                                            {/* <span> >> </span> */}
                                                                                            <div className="boxInLink">
                                                                                                <Link href={`/category`} customParam={`type=video&id=` + this.state.video.subcategory.slug} as={`/video/category/` + this.state.video.subcategory.slug}>
                                                                                                    <a >
                                                                                                        {<CensorWord {...this.props} text={this.state.video.subcategory.title} />}

                                                                                                    </a>
                                                                                                </Link>
                                                                                            </div>
                                                                                            {
                                                                                                this.state.video.subsubcategory ?
                                                                                                    <React.Fragment>
                                                                                                        {/* <span> >> </span> */}
                                                                                                        <div className="boxInLink">
                                                                                                            <Link href={`/category`} customParam={`type=video&id=` + this.state.video.subsubcategory.slug} as={`/video/category/` + this.state.video.subsubcategory.slug}>
                                                                                                                <a>
                                                                                                                    {<CensorWord {...this.props} text={this.state.video.subsubcategory.title} />}

                                                                                                                </a>
                                                                                                            </Link>
                                                                                                        </div>
                                                                                                    </React.Fragment>
                                                                                                    : null
                                                                                            }
                                                                                        </React.Fragment>
                                                                                        : null
                                                                                }
                                                                                </div>
                                                                            </React.Fragment>
                                                                            : null
                                                                    }

                                                                    {
                                                                        this.state.video.tags && this.state.video.tags != "" ?
                                                                            <div className="blogtagListWrap">
                                                                                <div className="tabInTitle">
                                                                                    <h6>{Translate(this.props, "Tags")}</h6>
                                                                                    <ul className="TabTagList clearfix">
                                                                                        {
                                                                                            this.state.video.tags.split(',').map((tag,index) => {
                                                                                                if(!this.state.showAll && index < 6){
                                                                                                    return (
                                                                                                        <li key={tag}>
                                                                                                            <Link href="/videos" customParam={`tag=${tag}`} as={`/videos?tag=${tag}`}>
                                                                                                                <a>{<CensorWord {...this.props} text={tag} />}</a>
                                                                                                            </Link>
                                                                                                        </li>
                                                                                                    )
                                                                                                }else if(!this.state.showAll && index == 6){
                                                                                                    return (
                                                                                                        <li key="9023">
                                                                                                            <a href="#" onClick={(e) => {
                                                                                                                e.preventDefault();
                                                                                                                this.setState({localUpdate:true,showAll:true});
                                                                                                            }}><span className="material-icons" data-icon="expand_more"></span></a>
                                                                                                        </li>
                                                                                                    )
                                                                                                }else if(this.state.showAll){
                                                                                                    return (
                                                                                                        <li key={tag}>
                                                                                                            <Link href="/videos" customParam={`tag=${tag}`} as={`/videos?tag=${tag}`}>
                                                                                                                <a>{<CensorWord {...this.props} text={tag} />}</a>
                                                                                                            </Link>
                                                                                                        </li>
                                                                                                    )
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    </ul>
                                                                                </div>
                                                                                
                                                                            </div>
                                                                            : null
                                                                    }

                                                                </div>


                                                            </div>
                                                            {
                                                                this.props.pageData.video.donors && this.props.pageData.video.donors.results.length ?
                                                                    <div className={`tab-pane fade${this.state.tabType == "donors" ? " active show" : ""}`} id="donors" role="tabpanel">
                                                                        <div className="details-tab-box">
                                                                            <Members  {...this.props} globalSearch={true}  channel_members={this.props.pageData.video.donors.results} channel_pagging={this.props.pageData.video.donors.pagging} video_id={this.props.pageData.video.video_id} />
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                this.props.pageData.appSettings[`${"video_comment"}`] == 1 && this.state.video.approve == 1 ?
                                                                    <div className={`tab-pane fade${this.state.tabType == "comments" ? " active show" : ""}`} id="comments" role="tabpanel">
                                                                        <div className="details-tab-box">
                                                                            <Comment  {...this.props}  owner_id={this.state.video.owner_id} hideTitle={true} appSettings={this.props.pageData.appSettings} commentType="video" type="videos" comment_item_id={this.state.video.video_id} />
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                this.props.pageData.video.artists && this.props.pageData.video.artists.results.length ?
                                                                    <div className={`tab-pane fade${this.state.tabType == "artists" ? " active show" : ""}`} id="artists" role="tabpanel">
                                                                        <div className="details-tab-box">
                                                                            <Artists showData={4} className="artist_img" fromVideo={true} canDelete={this.props.pageData.video.canDelete}  {...this.props}  artists={this.props.pageData.video.artists.results} pagging={this.props.pageData.video.artists.pagging} video_id={this.props.pageData.video.video_id} />
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                }
                                <div className="col-xl-3 col-lg-4 videoSidebar" style={{ marginTop: !this.state.fullWidth && !this.state.adult ? this.state.height : "0px" }}>
                                    {
                                        this.state.playlistVideos ?
                                            <div className="PlaylistSidebar">
                                                <div className="playlist_name">
                                                        <p>{<CensorWord {...this.props} text={this.state.playlist.title} />}</p>
                                                        <p>
                                                            <Link href="/member" customParam={`id=${this.state.playlist.owner.username}`} as={`/${this.state.playlist.owner.username}`}>
                                                                <a>
                                                                    {this.state.playlist.owner.displayname}
                                                                </a>
                                                            </Link>
                                                            {
                                                                " - " + currentPlaying + " / " + this.state.playlistVideos.length
                                                            }
                                                        </p>
                                                    </div>
                                                <div className="playlist_videos_list">
                                                    
                                                    <div className="playlist_videos">
                                                        {
                                                            this.state.playlistVideos.map((video, index) => {
                                                                return (
                                                                    <div className={`playlistscroll playlistGroup${currentPlaying == index+1 ? " active" : ""}`} key={index}>
                                                                        <div>
                                                                            {index + 1}
                                                                        </div>
                                                                        <div className="sidevideoWrap">
                                                                            <div className="videoImg">
                                                                                <Link href="/watch" customParam={`id=${video.custom_url}&list=${this.state.playlist.custom_url}`} as={`/watch/${video.custom_url}?list=${this.state.playlist.custom_url}`}>
                                                                                    <a>
                                                                                        <Image title={video.title} image={video.image} imageSuffix={this.props.pageData.imageSuffix}  siteURL={this.props.pageData.siteURL} />
                                                                                    </a>
                                                                                </Link>
                                                                                <span className="time">{
                                                                                    video.duration ?
                                                                                        video.duration
                                                                                        : null
                                                                                }</span>
                                                                                <span className="watchPlayBtn" style={{display:"none"}}>
                                                                                    <WatchLater className="watchLater" icon={true} {...this.props} item={video} id={video.video_id} />
                                                                                    <Link href="/watch" customParam={`id=${video.custom_url}&list=${this.state.playlist.custom_url}`} as={`/watch/${video.custom_url}?list=${this.state.playlist.custom_url}`}>
                                                                                        <a>
                                                                                            <span className="material-icons" data-icon="play_arrow"></span>
                                                                                        </a>
                                                                                    </Link>
                                                                                </span>
                                                                            </div>
                                                                            <div className="sideVideoContent">
                                                                                <Link href="/watch" customParam={`id=${video.custom_url}&list=${this.state.playlist.custom_url}`} as={`/watch/${video.custom_url}?list=${this.state.playlist.custom_url}`}>
                                                                                    <a className="videoTitle">{<CensorWord {...this.props} text={video.title} />}</a>
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>

                                                </div>
                                            </div>
                                            : null
                                    }

                                    {
                                       !this.state.needSubscription && this.state.width > 992 && this.state.video && this.state.video.approve == 1 && this.state.video.enable_chat == 1 && ((this.state.video.is_livestreaming == 1 && (this.state.video.channel_name || this.state.video.mediaserver_stream_id)) || this.state.video.scheduled )  ? 
                                            <div className="ls_sidbar" style={{ height: !this.state.fullWidth && !this.state.adult ? this.state.height.replace("-",'') : "0px" }}>
                                                <Chat {...this.props} getHeight={this.getHeight} channel={this.state.video.channel_name} streamId={this.state.video.mediaserver_stream_id} custom_url={this.state.video.custom_url} comments={this.state.video.chatcomments ? this.state.video.chatcomments : []} />
                                            </div>    
                                        : null
                                    }

                                    {
                                        this.props.pageData.appSettings['sidebar_video'] ?
                                            <AdsIndex paddingTop="20px" className="sidebar_video" ads={this.props.pageData.appSettings['sidebar_video']} />
                                            : null
                                    }
                                    {
                                        this.state.relatedVideos && this.state.relatedVideos.length > 0 ?
                                            <RelatedVideos {...this.props} playlist={this.state.playlistVideos}  videos={this.state.relatedVideos} />
                                            : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            }
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        menuOpen:state.search.menuOpen,
        song_id:state.audio.song_id,
        audios:state.audio.audios,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        upatePlayerTimeProp: (time) => dispatch(playlist.upatePlayerTime(time)),
        updateAudioData: (audios, song_id,pausesong_id,submitText,passwordText) => dispatch(playlist.updateAudioData(audios, song_id,pausesong_id,submitText,passwordText)),
        setMenuOpen: (status) => dispatch(playlist.setMenuOpen(status)),
        openPlaylist: (open, video_id) => dispatch(playlist.openPlaylist(open, video_id)),
        openToast: (message, typeMessage) => dispatch(playlist.openToast(message, typeMessage)),
        openReport: (status, contentId, contentType) => dispatch(playlist.openReport(status, contentId, contentType)),
        updatePlayerData: (relatedVideos, playlistVideos, currentVideo, deleteMessage, deleteTitle,liveStreamingURL) => dispatch(playlist.updatePlayerData(relatedVideos, playlistVideos, currentVideo, deleteMessage, deleteTitle,liveStreamingURL))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Index);
