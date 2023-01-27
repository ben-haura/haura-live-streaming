import React from "react"
import { connect } from "react-redux"
import playlist from '../../store/actions/general';
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators'
import axios from "../../axios-orders"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import CensorWord from "../CensoredWords/Index"
import Translate from "../../components/Translate/Index"
import Link from "../../components/Link/index";
import Comment from "../../containers/Comments/Index"
import SocialShare from "../SocialShare/Index"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import WatchLater from "../WatchLater/Index"
import swal from "sweetalert"
const Episodes = dynamic(() => import("./Episodes"), {
    ssr: false
});
const Seasons = dynamic(() => import("./Seasons"), {
    ssr: false
});
const Cast = dynamic(() => import("./MovieCast.js"), {
    ssr: false
});
const Reviews = dynamic(() => import("./Reviews"), {
    ssr: false
});
const Images = dynamic(() => import("./Images"), {
    ssr: false
});
const Trailers = dynamic(() => import("./Trailers"), {
    ssr: false
});
import Info from "./Info"
const Movies = dynamic(() => import("../HomePage/Movies"), {
    ssr: false
});
import Currency from "../Upgrade/Currency"
const Gateways = dynamic(() => import("../Gateways/Index"), {
    ssr: false
});
const Plans = dynamic(() => import("../User/Plans"), {
    ssr: false
});
const Player = dynamic(() => import("../Video/Player"), {
    ssr: false
});
const OutsidePlayer = dynamic(() => import("../Video/OutsidePlayer"), {
    ssr: false
});
const MediaElementPlayer = dynamic(() => import("../Video/MediaElementPlayer"), {
    ssr: false
});

class Movie extends React.Component{
    constructor(props){
        super(props)
        let seasonCurrentIndex = props.pageData.seasonCurrentIndex ? props.pageData.seasonCurrentIndex : 0
        this.state = {
            styles: {
                visibility: "hidden",
                overflow: "hidden"
            },
            showMore: false,
            showMoreText: "See more",
            collapse: true,
            trailer:props.pageData.trailer,
            contentType:props.pageData.contentType,
            movie:props.pageData.movie,
            seasons:props.pageData.seasons,
            clipsTrailers:props.pageData.clipsTrailers,
            needSubscription:props.pageData.needSubscription,
            plans:props.pageData.plans,
            tabType:props.pageData.tabType ? props.pageData.tabType : "episodes",
            relatedMovies:props.pageData.relatedMovies,
            movie_countries:props.pageData.movie ? props.pageData.movie.movie_countries : null,
            generes:props.pageData.movie ? props.pageData.movie.generes : null,
            castncrew:props.pageData.movie ? props.pageData.movie.castncrew : null,
            images:props.pageData.movie ? props.pageData.movie.images : null,
            adult: props.pageData.adultMovie,
            password: props.pageData.password,
            episode:props.pageData.episode,
            adminAdVideo:props.pageData.adminAdVideo,
            userAdVideo:props.pageData.userAdVideo,
            reviews:props.pageData.reviews ? props.pageData.reviews : null,
            episodes: props.pageData.episodes ? props.pageData.episodes : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex].episodes ? props.pageData.seasons[seasonCurrentIndex].episodes : null),
            episode_season: props.pageData.episode_season ? props.pageData.episode_season : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex] ? props.pageData.seasons[seasonCurrentIndex].season : null),
            episode_pagging: props.pageData.episodes ? props.pageData.episode_pagging : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex].episodes ? props.pageData.seasons[seasonCurrentIndex].episode_pagging : false),
            nextTrailer:props.pageData.nextTrailer,
            nextEpisode:props.pageData.nextEpisode
        }
        this.updatePlayCount = this.updatePlayCount.bind(this)
        this.showGateways = this.showGateways.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.getHeight = this.getHeight.bind(this)
    }
    updateWindowDimensions() {
        this.setState({localUpdate:true, width: window.innerWidth },() => {
            this.getHeight();
        });
    }
    componentDidUpdate(prevProps,prevState){
        if(this.state.changeHeight){
            this.getHeight();
            this.setState({changeHeight:false,localUpdate:true})
            if(typeof window != "undefined"){
                if($(".nav-tabs > li > a.active").length == 0){ 
                    if(this.state.needSubscription){
                      this.pushTab("plans")
                    }else{
                      if(this.state.clipsTrailers && this.state.clipsTrailers.results.length > 0)
                        this.pushTab("trailers")
                      else
                        this.pushTab("about")
                    }
                }
            }
        }
    }
    getHeight(){
        if(!this.state.movie){
            return
        }
        if($('.movie-player').length && $(".movie-player-height").length){
            let height = (($(".movie-player-height").outerWidth(true) /  2.2)) + "px";
            $(".player-wrapper, .video-js").css("height","100%");
            $(".movie-player-height").css("height",(($(".movie-player-height").outerWidth(true) /  2.2)) + "px");
            $('video, iframe').css('height', '100%');
        }else{
            $(".movie-player-height").removeAttr("style");
            $(".MBnrBg").removeAttr("style")
        }
    } 
    componentWillUnmount(){
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.pageData.movie != prevState.movie || nextProps.pageData.trailer != prevState.trailer || nextProps.pageData.episode != prevState.episode || (prevState.movie && nextProps.pageData.movie.status != prevState.movie.status) || 
        (nextProps.pageData.password != prevState.password) || nextProps.pageData.adultMovie != prevState.adult) {
            let seasonCurrentIndex = nextProps.pageData.seasonCurrentIndex ? nextProps.pageData.seasonCurrentIndex : 0
           return {
                nextTrailer:nextProps.pageData.nextTrailer,
                nextEpisode:nextProps.pageData.nextEpisode,
                changeHeight:true,
                adminAdVideo:nextProps.pageData.adminAdVideo,
                userAdVideo:nextProps.pageData.userAdVideo,
                episode:nextProps.pageData.episode,
                trailer:nextProps.pageData.trailer,
                gateways:false,
                purchasePopup:false,
                contentType:nextProps.pageData.contentType,
                movie:nextProps.pageData.movie,
                seasons:nextProps.pageData.seasons,
                clipsTrailers:nextProps.pageData.clipsTrailers,
                needSubscription:nextProps.pageData.needSubscription,
                plans:nextProps.pageData.plans,
                tabType:nextProps.pageData.tabType ? nextProps.pageData.tabType : "episodes",
                relatedMovies:nextProps.pageData.relatedMovies,
                movie_countries:nextProps.pageData.movie ? nextProps.pageData.movie.movie_countries : null,
                generes:nextProps.pageData.movie ? nextProps.pageData.movie.generes : null,
                castncrew:nextProps.pageData.movie ? nextProps.pageData.movie.castncrew : null,
                images:nextProps.pageData.movie ? nextProps.pageData.movie.images : null,
                reviews:nextProps.pageData.reviews ? nextProps.pageData.reviews : null,
                password: nextProps.pageData.password,
                logout:false,
                changeHeight:true,
                adult: nextProps.pageData.adultMovie,
                episodes: nextProps.pageData.episodes ? nextProps.pageData.episodes : (nextProps.pageData.seasons && nextProps.pageData.seasons[seasonCurrentIndex].episodes ? nextProps.pageData.seasons[seasonCurrentIndex].episodes : null),
                episode_season: nextProps.pageData.episode_season ? nextProps.pageData.episode_season : (nextProps.pageData.seasons && nextProps.pageData.seasons[seasonCurrentIndex] ? nextProps.pageData.seasons[seasonCurrentIndex].season : null),
                episode_pagging: nextProps.pageData.episodes ? nextProps.pageData.episode_pagging : (nextProps.pageData.seasons && nextProps.pageData.seasons[seasonCurrentIndex].episodes ? nextProps.pageData.seasons[seasonCurrentIndex].episode_pagging : false),


            }
        } else{
            return null
        }

    }
    componentDidMount() {
        if($(".nav-tabs > li > a.active").length == 0){
            if(this.state.needSubscription){
              this.pushTab("plans")
            }else{
              if(this.state.clipsTrailers && this.state.clipsTrailers.results.length > 0)
                this.pushTab("trailers")
              else
                this.pushTab("about")
            }
        }
        
        // Router.beforePopState(({ url, as, options }) => {
        //     console.log(url,as,options)
        // })

        if(this.props.song_id)
            this.props.updateAudioData(this.props.audios, this.props.song_id,this.props.song_id,this.props.t("Submit"),this.props.t("Enter Password"))

        this.props.updatePlayerData([], [], null, "", "",this.props.pageData.liveStreamingURL)

        if(this.props.pageData.appSettings["fixed_header"] == 1 && this.props.hideSmallMenu && !this.props.menuOpen){
            this.props.setMenuOpen(true)
        }
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.getHeight();
        var _ = this
        if (_.state.movie) {
            if ($('#movieDescription').height() > 110) {
                _.setState({ showMore: true, styles: { visibility: "visible", overflow: "hidden", height: "100px" }, collapse: true })
            } else {
                _.setState({ showMore: false, styles: { visibility: "visible", height: "auto" } })
            }
        }
        
        this.props.socket.on('unwatchlaterMovies', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            if (this.state.movie && this.state.movie.movie_id == id) {
                const movie = { ...this.state.movie }
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    movie.watchlater_id = null
                    this.setState({localUpdate:true, movie: movie })
                }
            }
        });
        this.props.socket.on('watchlaterMovies', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            if (this.state.movie && this.state.movie.movie_id == id) {
                const movie = { ...this.state.movie }
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    movie.watchlater_id = 1
                    this.setState({localUpdate:true, movie: movie })
                }
            }
        });

        this.props.socket.on('unfollowUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.movie && id == this.state.movie.owner.user_id && type == "members") {
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    const data = { ...this.state.movie }
                    const owner = data.owner
                    owner.follower_id = null
                    this.setState({localUpdate:true, movie: data })
                }
            }
        });
        this.props.socket.on('followUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.movie && id == this.state.movie.owner.user_id && type == "members") {
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    const data = { ...this.state.movie }
                    const owner = data.owner
                    owner.follower_id = 1
                    this.setState({localUpdate:true, movie: data })
                }
            }
        });
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            if (this.state.movie && id == this.state.movie.movie_id && type == "movies") {
                const data = { ...this.state.movie }
                data.rating = rating
                this.setState({localUpdate:true, movie: data })
            }
        });
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.movie && id == this.state.movie.movie_id && type == "movies") {
                if (this.state.movie.movie_id == id) {
                    const data = { ...this.state.movie }
                    data.favourite_count = data.favourite_count - 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = null
                    }
                    this.setState({localUpdate:true, movie: data })
                }
            }
        });
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.movie && id == this.state.movie.movie_id && type == "movies") {
                if (this.state.movie.movie_id == id) {
                    const data = { ...this.state.movie }
                    data.favourite_count = data.favourite_count + 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = 1
                    }
                    this.setState({localUpdate:true, movie: data })
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
            if (this.state.movie && itemType == "movies" && this.state.movie.movie_id == itemId) {
                const item = { ...this.state.movie }
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
                this.setState({localUpdate:true, movie: item })
            }
        });
    }
    pushTab = (type) => {
        if(this.state.tabType == type || !this.state.movie){
            return
        }
        this.setState({tabType:type,localUpdate:true})

        let customParams = ""
        let customString = ""
        if(this.props.pageData.season_id){
          customParams += "/season/"+this.props.pageData.season_id
          customString += "&season_id="+this.props.pageData.season_id
        }
        if(this.props.pageData.episode_id){
          customParams += "/episode/"+this.props.pageData.episode_id
          customString += "&episode_id="+this.props.pageData.episode_id
        }
        if(this.props.pageData.trailer_id){
          customParams += "/trailer/"+this.props.pageData.trailer_id
          customString += "&trailer_id="+this.props.pageData.trailer_id
        }
        if(!this.state.seasons && this.props.pageData.play){
            customParams += "/play"
            customString += "&play=1"
        }
        Router.push(`/watch?id=${this.state.movie.custom_url}${customString}`, `/watch/${this.state.movie.custom_url}${customParams}?type=${type}`,{ shallow: true })
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
        let url = '/movies/password/' + this.props.pageData.id;
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
    openReport = (e) => {
        e.preventDefault()
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            this.props.openReport(true, this.state.movie.custom_url, this.state.contentType)
        }
    }
    deleteMovie = (e) => {
        e.preventDefault()
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: Translate(this.props, `Once deleted, you will not be able to recover this ${this.state.contentType == "movies" ? "movie" : "series"}!`),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('movie_id', this.state.movie.movie_id)
                    const url = "/movies/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                            } else {
                                this.props.openToast(Translate(this.props, response.data.message), "success");
                                this.setState({localUpdate:true,logout:true},() => {
                                    Router.push(`/dashboard?type=movies`, `/dashboard/movies`)
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
    purchaseClicked = () => {
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        }else{
            this.setState({localUpdate:true,purchasePopup:true,gatewaysURL:`/movies/purchase/${this.state.movie.movie_id}?chooseType=${this.state.chooseType}`});
        }
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
    showGateways = (type,e) => {
        e.preventDefault();
        this.setState({localUpdate:true,gateways:true,gatewaysURL:`/movies/purchase/${this.state.movie.movie_id}?chooseType=${this.state.chooseType}`,chooseType:type});
    }
    watchNow = (e) => {
        e.preventDefault();
        if(this.state.episodes && this.state.episodes.length > 0){
            let episode = this.state.episodes[0]
            let customParams = ""
            let customString = ""
            let type = ""
            if(this.state.seasons){
                customParams += "/season/"+this.state.episode_season
                customString += "&season_id="+this.state.episode_season                
                customParams += "/episode/"+episode.episode_number
                customString += "&episode_id="+episode.episode_number
                if(episode.trailer_id){
                    customParams += "/trailer/"+episode.trailer_id
                    customString += "&trailer_id="+episode.trailer_id
                }
                type = `?type=${this.state.tabType}`
                Router.push(`/watch?id=${this.state.movie.custom_url}${customString}`, `/watch/${this.state.movie.custom_url}${customParams}${type}`)
            }else{
                customParams += "/play"
                customString += "&play=1"
                //this.setState({localUpdate:true,episode:episode})
                Router.push(`/watch?id=${this.state.movie.custom_url}${customString}`, `/watch/${this.state.movie.custom_url}${customParams}${type}`)
            }
            return;
        }
    }
    videoEnd = (type) => {
        if(type == "episode" && this.state.nextEpisode){
            let item = this.state.nextEpisode
            Router.push(`/watch?id=${this.state.movie.custom_url}&season_id=${this.state.episode_season}&episode_id=${item.episode_number}`, `/watch/${this.state.movie.custom_url}/season/${this.state.episode_season}/episode/${item.episode_number}`)
        }else if(type == "trailer" && this.state.nextTrailer){
            let item = this.state.nextTrailer
            this.state.episode && this.state.seasons? 
                Router.push(`/watch?trailer_id=${item.movie_video_id}&id=${this.state.movie.custom_url}&season_id=${item.season}&episode_id=${item.episode_number}`, `/watch/${this.state.movie.custom_url}/season/${item.season}/episode/${item.episode_number}/trailer/${item.movie_video_id}`)
            :
            Router.push(`/watch?trailer_id=${item.movie_video_id}&id=${this.state.movie.custom_url}`, `/watch/${this.state.movie.custom_url}/trailer/${item.movie_video_id}`)
        }
    }
    updatePlayCount = (id) => {
        if(typeof window == "undefined"){
            return
        }
        const formData = new FormData();
        formData.append("movie_video_id",id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
        let url = '/movies/update-play-count';
        axios.post(url, formData, config)
        .then(response => {
            
        }).catch(err => {
            
        });
    }
    render(){
        let imageURL = this.state.movie ? this.state.movie.image : ""
        if(imageURL){
            if(imageURL.indexOf("http://") == 0 || imageURL.indexOf("https://") == 0){
                imageURL = imageURL
            }else{
                imageURL = this.props.pageData.imageSuffix+imageURL
            }
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

        let metaData = []

        
        if(this.state.movie){
            if(this.state.movie.language_title){
                metaData.push(this.state.movie.language_title)
            }
        
            if(this.state.movie.release_year){
                metaData.push(this.state.movie.release_year)
            }
            if(this.state.movie.adult == 1){
                metaData.push("18+")
            }
        }
        let userBalance = {}
        userBalance['package'] = { price: parseFloat(this.state.movie ? this.state.movie.price : 0) }
        let rentPrice = {}
        rentPrice['package'] = { price: parseFloat(this.state.movie ? this.state.movie.rent_price : 0) } 

        let purchaseHTML = ""

        if(this.state.purchasePopup){
            purchaseHTML = 
                            <div className="popup_wrapper_cnt movie-series-purchase">
                                <div className="popup_cnt">
                                    <div className="comments">
                                        <div className="VideoDetails-commentWrap">
                                            <div className="modal-content-popup">
                                                <span className="close-popup" onClick = {() => this.setState({localUpdate:true,purchasePopup:false})}>
                                                    <span className="material-icons">close</span>
                                                </span>
                                                <div className="buyRent-wrap">
                                                    <div className="buyRent-btn">
                                                        <div className="moviePoster">
                                                            <img src={imageURL} alt={this.state.movie.title} />
                                                        </div>
                                                        <div className="content">
                                                            {
                                                                parseFloat(this.state.movie.rent_price) > 0 ? 
                                                                    <div className="rent mb-3">
                                                                        <h4 className="textBlck">{this.props.t("Rent")}</h4>
                                                                        <p className="rent-valid">{this.props.t("valid for 24 hours")}</p>
                                                                        <div className="buttong">
                                                                            <button type="button" className="btn btn-primary btn-lg" onClick={this.showGateways.bind(this,"rent")}><Currency { ...this.props} {...rentPrice} /></button>
                                                                        </div>
                                                                    </div>
                                                            : null
                                                            }
                                                            {
                                                                parseFloat(this.state.movie.price) > 0 ? 
                                                            <div className="rent">
                                                                <h4 className="textBlck">{this.props.t("Purchase")}</h4>
                                                                <div className="buttong">
                                                                    <button type="button" className="btn btn-primary btn-lg" onClick={this.showGateways.bind(this,"purchase")}><Currency { ...this.props} {...userBalance} /></button>
                                                                </div>
                                                            </div>
                                                            : null
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
        }

        let gatewaysHTML = ""
        if(this.state.gateways){
            gatewaysHTML = <Gateways {...this.props} success={() => {
                this.props.openToast(Translate(this.props, "Payment done successfully."), "success");
                setTimeout(() => {
                    let customParams = ""
                    let customString = ""
                    if(this.props.pageData.season_id){
                    customParams += "/season/"+this.props.pageData.season_id
                    customString += "&season_id="+this.props.pageData.season_id
                    }
                    if(this.props.pageData.episode_id){
                    customParams += "/episode/"+this.props.pageData.episode_id
                    customString += "&episode_id="+this.props.pageData.episode_id
                    }
                    if(this.props.pageData.trailer_id){
                    customParams += "/trailer/"+this.props.pageData.trailer_id
                    customString += "&trailer_id="+this.props.pageData.trailer_id
                    }
                    Router.push(`/watch?id=${this.state.movie.custom_url}${customString}`, `/watch/${this.state.movie.custom_url}${customParams}?type=${this.state.tabType}`)

                  },1000);
            }} successBank={() => {
                this.props.openToast(Translate(this.props, "Your bank request has been successfully sent, you will get notified once it's approved"), "success");
                this.setState({localUpdate:true,gateways:null})
            }} bank_price={this.state.chooseType == "rent" ? this.state.movie.rent_price : this.state.movie.price} bank_type={`${this.state.contentType == "movies" ? this.state.chooseType+"_movie_purchase" : this.state.chooseType+"_series_purchase"}`} bank_resource_type={this.state.contentType == "movies" ? this.state.chooseType+"_movie" : this.state.chooseType+"_series"} bank_resource_id={this.state.movie.custom_url} tokenURL={`movies/successulPayment/${this.state.movie.movie_id}?chooseType=${this.state.chooseType}`} closePopup={() => this.setState({localUpdate:true,gateways:false})} gatewaysUrl={this.state.gatewaysURL} />
        }

        return (
            <React.Fragment>
                {
                    purchaseHTML
                }
                {
                    gatewaysHTML
                }
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
                this.state.adult ?
                    <div className="container">
                        <div className="row">
                            <div className={`col-md-12`}>
                                <div className="adult-wrapper">
                                    {Translate(this.props, 'This movie contains adult content.To view this movie, Turn on adult content setting from site footer.')}
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <React.Fragment>
                        {
                            this.state.movie && this.state.movie.approve != 1 ? 
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-12 approval-pending">
                                        <div className="generalErrors">
                                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                                {Translate(this.props,'This movie still waiting for admin approval.')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        : null
                        }
                        {
                            !this.state.trailer && !this.state.episode ? 
                            <React.Fragment>
                            <div className={`SlideAdsWrap${" nobtn"}`}>
                                <div id="snglFullWdth" className="snglFullWdth">
                                    <div className="banner-wrap justify-content-between align-items-center" key={this.state.movie.movie_id}>
                                        <div className="left-wrap ellipsize2Line">
                                            <h4 className="my-3">
                                                <a href="#" onClick={(e) => {e.preventDefault();}}>{<CensorWord {...this.props} text={this.state.movie.title} />}</a>
                                            </h4>
                                            {
                                                metaData.length > 0 ?
                                                <div className="movieInfo">
                                                    {
                                                        metaData.join(" | ")   
                                                    }
                                                </div>
                                                : null
                                            }
                                            <div className="MvtimeLng">
                                            {
                                                this.state.generes && this.state.generes.length > 0 ?                                                 
                                                    this.state.generes.map((gener,index) => {
                                                        return (
                                                            <Link key={index} href={this.state.contentType} customParam={`genre=${gener.slug}`} as={`/${this.state.contentType}?genre=${gener.slug}`}>
                                                                <a>{Translate(this.props, gener.title)}</a>
                                                            </Link>
                                                        )
                                                    }).reduce((prev, curr) => [prev, " / ", curr])
                                                : null
                                            }
                                            </div>
                                            <div className="smInfo d-flex align-items-center flex-wrap mb-5">
                                                <div className="pvtBannerLike">
                                                    <ul className="LikeDislikeList">                                                            
                                                        
                                                                <React.Fragment>
                                                                {
                                                                    this.state.movie.approve == 1 ? 
                                                                        <React.Fragment>
                                                                            <li>
                                                                                <Like icon={true} {...this.props} like_count={this.state.movie.like_count} item={this.state.movie} type="movie" id={this.state.movie.movie_id} />{"  "}
                                                                            </li>
                                                                            <li>
                                                                                <Dislike icon={true} {...this.props} dislike_count={this.state.movie.dislike_count} item={this.state.movie} type="movie" id={this.state.movie.movie_id} />{"  "}
                                                                            </li>
                                                                            <li>
                                                                                <Favourite icon={true} {...this.props} favourite_count={this.state.movie.favourite_count} item={this.state.movie} type="movie" id={this.state.movie.movie_id} />{"  "}
                                                                            </li>
                                                                            <li>
                                                                                <WatchLater className="watchLater" typeWatchLater="movie-series" icon={true} {...this.props} item={this.state.movie} id={this.state.movie.movie_id} />
                                                                            </li>
                                                                            <SocialShare {...this.props} hideTitle={true} className="video_share" buttonHeightWidth="30" tags={this.state.movie.tags} url={`/watch/${this.state.movie.custom_url}`} title={this.state.movie.title} imageSuffix={this.props.pageData.imageSuffix} media={this.state.movie.image} />
                                                                        
                                                                        </React.Fragment>
                                                                    : null
                                                                }
                                                                   <li>
                                                                        <div className="dropdown TitleRightDropdown"><a href="#"
                                                                                data-bs-toggle="dropdown"><span
                                                                                    className="material-icons">more_verti</span></a>
                                                                            <ul className="dropdown-menu dropdown-menu-right edit-options">
                                                                            {
                                                                                this.state.movie.canEdit ?
                                                                                    <li>
                                                                                        <Link href={`${this.state.contentType == "movies" ? "/create-movie" : "/create-series"}`} customParam={`id=${this.state.movie.custom_url}`} as={`${this.state.contentType == "movies" ? "/create-movie" : "/create-series"}/${this.state.movie.custom_url}`}>
                                                                                            <a><span className="material-icons" data-icon="edit"></span>{Translate(this.props, "Edit")}</a>
                                                                                        </Link>
                                                                                    </li>
                                                                                    : null
                                                                            }
                                                                            {
                                                                                this.state.movie.canDelete ?
                                                                                    <li>
                                                                                        <a onClick={this.deleteMovie.bind(this)} href="#"><span className="material-icons" data-icon="delete"></span>{Translate(this.props, "Delete")}</a>
                                                                                    </li>
                                                                                    : null
                                                                            }
                                                                            {
                                                                                !this.state.movie.canEdit && this.state.movie.approve == 1 ?
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
                                                                </React.Fragment>
                                                                                                        
                                                    </ul>
                                                </div>
                                            </div>
                                            {
                                                this.state.episodes && this.state.episodes.length > 0 ? 
                                                    <div className="d-flex align-items-center">
                                                            <a className="btn btn-lg playBtn" href="#" onClick={this.watchNow}>
                                                                <span className="d-flex align-items-center justify-content-center">
                                                                    <span className="material-icons-outlined">
                                                                        play_arrow
                                                                    </span> {this.props.t("Watch Now")}
                                                                </span>
                                                            </a>
                                                    </div>
                                            : null
                                            }
                                        </div>
                                    <div className="right-wrap" style={{ backgroundImage: `url(${imageURL})` }}></div>
                                </div>
                                </div>
                            </div>
                            </React.Fragment>
                        :
                        this.state.trailer ?  
                        <div className="moviePlayer-wrap movie-player-height">
                            <div className="movie-player">
                                {
                                    this.state.trailer.type == 'external' ?
                                        <a href={this.state.trailer.code} target="_blank">{this.props.t("External Link")}</a>
                                    :
                                    this.state.trailer.type == 'upload' && this.props.pageData.appSettings['player_type'] == "element" ?
                                        <MediaElementPlayer {...this.props} updatePlayCount={this.updatePlayCount} getHeight={this.getHeight} playType={"trailer"} ended={this.videoEnd} height={"500px"} userAdVideo={this.state.userAdVideo} adminAdVideo={this.state.adminAdVideo} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.trailer} {...this.props.pageData.trailer} />
                                    :
                                    this.state.trailer.type == 'upload' ?
                                        <Player {...this.props} updatePlayCount={this.updatePlayCount} getHeight={this.getHeight} playType={"trailer"} ended={this.videoEnd} height={"500px"} userAdVideo={this.state.userAdVideo} adminAdVideo={this.state.adminAdVideo} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.trailer} {...this.props.pageData.trailer} />
                                    :
                                        <OutsidePlayer {...this.props} updatePlayCount={this.updatePlayCount} getHeight={this.getHeight} ended={this.videoEnd} playType={"trailer"} height={"500px"} imageSuffix={this.props.pageData.imageSuffix} video={this.props.pageData.trailer}  {...this.props.pageData.trailer} />
                                }
                            </div>
                        </div>
                        :
                        this.state.episode ?
                            <div className="moviePlayer-wrap movie-player-height">
                            {
                                this.state.needSubscription ? 
                                <div className="movie-player player-wrapper">
                                    <div className="subscription-update-plan-cnt">
                                        <div className="subscription-update-plan-title">
                                            {
                                                    this.state.needSubscription.type == "upgrade" ? 
                                                        this.props.t("To watch more content, kindly upgrade your Subcription Plan.")
                                                    :
                                                        this.props.t("To watch more content, kindly Subscribe.")
                                            }
                                            <div className="subscription-options">
                                                { 
                                                    <button onClick={this.scrollToSubscriptionPlans}>
                                                        {this.props.t("Subscription Plans")}
                                                    </button>
                                                }
                                                {
                                                    this.props.t("or")
                                                }
                                                {
                                                    <button onClick={this.purchaseClicked}>
                                                        {this.props.t('Purchase {{type}}',{type:this.state.contentType == "movies" ? "Movie" : "Series"})}
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                :
                                    this.state.movie && (parseFloat(this.state.movie.price) > 0 || parseFloat(this.state.movie.rent_price) > 0) && !this.state.movie.moviePurchased ?
                                        <div key="purchasevideo_purchase movie-player" >
                                            <div data-vjs-player className="video_player_cnt player-wrapper" style={{ width: "100%"}} >
                                                <div className="purchase_video_content video_purchase" style={{ width: "100%", "height":"100%"}}>
                                                    <div className="purchase_video_content_background"></div>
                                                    <h5>
                                                        {
                                                            this.props.t("This {{type}} is paid, you have to purchase the {{type_1}} to watch it.",{type:this.state.contentType == "movies" ? "movie" : "series",type_1:this.state.contentType == "movies" ? "movie" : "series"})
                                                        }<br /><br />
                                                        <button className="btn btn-main" onClick={this.purchaseClicked}>{this.props.t('Purchase {{type}}',{type:this.state.contentType == "movies" ? "Movie" : "Series"})}</button>                                                    
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                    :
                                    this.state.episode.type == 'external' ?
                                        <div key="purchasevideo_purchase movie-player" >
                                            <a href={this.state.episode.code} target="_blank">{this.props.t("External Link")}</a>
                                        </div>
                                    :
                                    this.state.episode.code ?
                                        <div className="movie-player">
                                            {
                                                this.state.episode.type == 'upload' ?
                                                    <Player {...this.props} updatePlayCount={this.updatePlayCount} getHeight={this.getHeight} playType={"episode"} ended={this.videoEnd} height={"500px"} userAdVideo={this.state.userAdVideo} adminAdVideo={this.state.adminAdVideo} imageSuffix={this.props.pageData.imageSuffix} video={this.state.episode} {...this.state.episode} />
                                            :
                                                this.state.episode.code ?
                                                <OutsidePlayer {...this.props} updatePlayCount={this.updatePlayCount} playType={"episode"}  ended={this.videoEnd}  height={"500px"}  imageSuffix={this.props.pageData.imageSuffix} video={this.state.episode}  {...this.state.episode} />
                                            :
                                                null
                                            }
                                        </div>
                                    :
                                    <div key="purchasevideo_purchase movie-player" >
                                        <div data-vjs-player className="video_player_cnt player-wrapper" style={{ width: "100%"}} >
                                            <div className="purchase_video_content video_purchase" style={{ width: "100%", "height":"100%"}}>
                                                <div className="purchase_video_content_background"></div>
                                                <h5>
                                                    {
                                                        this.props.t("No videos found for this episode.")
                                                    }
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                            }
                            </div>      
                            : null                      
                        }
                        <div className="container movie-series-cnt">
                            <div className="row">
                                <div className={`col-md-12`}> 
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
                                            {
                                                this.state.episodes && this.state.seasons ? 
                                                    <li className="nav-item">
                                                        <a className={`nav-link${this.state.tabType == "episodes" ? " active" : ""}`} onClick={
                                                            () => this.pushTab("episodes")
                                                        } data-bs-toggle="tab" href="#episodes" role="tab" aria-controls="episodes" aria-selected="true">{Translate(this.props, "Episodes")}</a>
                                                    </li>
                                            : null
                                            }
                                            {
                                                this.state.seasons ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${this.state.tabType == "seasons" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("seasons")
                                                } data-bs-toggle="tab" href="#seasons" role="tab" aria-controls="seasons" aria-selected="true">{Translate(this.props, "Seasons")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                this.state.clipsTrailers && this.state.clipsTrailers.results.length > 0 ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${this.state.tabType == "trailers" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("trailers")
                                                } data-bs-toggle="tab" href="#trailers" role="tab" aria-controls="trailers" aria-selected="true">{Translate(this.props, "Trailers & More")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                this.state.castncrew && this.state.castncrew.length > 0 && this.props.pageData.appSettings['cast_crew_member'] == 1 ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${this.state.tabType == "cast" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("cast")
                                                } data-bs-toggle="tab" href="#cast" role="tab" aria-controls="cast" aria-selected="true">{Translate(this.props, "Cast & Crew")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                this.state.images && this.state.images.length > 0 ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${this.state.tabType == "images" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("images")
                                                } data-bs-toggle="tab" href="#images" role="tab" aria-controls="images" aria-selected="true">{Translate(this.props, "Images")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                this.state.reviews ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${this.state.tabType == "reviews" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("reviews")
                                                } data-bs-toggle="tab" href="#reviews" role="tab" aria-controls="reviews" aria-selected="true">{Translate(this.props, "Reviews")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                this.props.pageData.appSettings[`${"movie_comment"}`] == 1 && this.state.movie.approve == 1 && (!this.state.episode || !this.state.seasons) ?
                                                    <li className="nav-item">
                                                        <a className={`nav-link${this.state.tabType == "comments" ? " active" : ""}`} onClick={
                                                            () => this.pushTab("comments")
                                                        } data-bs-toggle="tab" href="#comments" role="tab" aria-controls="comments" aria-selected="true">{`${Translate(this.props,"Comments")}`}</a>
                                                    </li>
                                                    : null
                                            }
                                            <li className="nav-item">
                                                <a className={`nav-link${this.state.tabType == "about" ? " active" : ""}`} onClick={
                                                    () => this.pushTab("about")
                                                } data-bs-toggle="tab" href="#about" role="tab" aria-controls="about" aria-selected="true">{Translate(this.props, "About")}</a>
                                            </li>
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
                                                    <Plans {...this.props} userSubscription={this.state.needSubscription.loggedin_package_id ? true : false} userSubscriptionID={this.state.needSubscription.loggedin_package_id} itemObj={this.state.movie} member={this.state.movie.owner} user_id={this.state.movie.owner_id} plans={this.state.plans} />
                                                </div>
                                                </div>
                                            : null
                                            }
                                            {
                                                this.props.pageData.appSettings[`${"movie_comment"}`] == 1 && this.state.movie.approve == 1 && (!this.state.episode || !this.state.seasons) ?
                                                    <div className={`tab-pane fade${this.state.tabType == "comments" ? " active show" : ""}`} id="comments" role="tabpanel">
                                                        <div className="details-tab-box">
                                                            <Comment  {...this.props}  owner_id={this.state.movie.owner_id} hideTitle={true} appSettings={this.props.pageData.appSettings} commentType="movie" type="movies" comment_item_id={this.state.movie.movie_id} />
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            <div className={`tab-pane fade${this.state.tabType == "about" ? " active show" : ""}`} id="about" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Info {...this.props} watchNow={this.watchNow} movie={this.state.movie} episode={this.state.episode} seasons={this.state.seasons} />
                                                </div>
                                            </div>
                                            {
                                                this.state.episodes && this.state.seasons ?
                                                    <div className={`tab-pane fade${this.state.tabType == "episodes" ? " active show" : ""}`} id="episodes" role="tabpanel">
                                                        <div className="details-tab-box">
                                                            <Episodes {...this.props} movie={this.state.movie} episodes={this.state.episodes} pagging={this.state.episode_pagging} season={this.state.episode_season} />
                                                        </div>
                                                    </div>
                                            : null
                                            }
                                            {
                                                this.state.seasons ? 
                                                    <div className={`tab-pane fade${this.state.tabType == "seasons" ? " active show" : ""}`} id="seasons" role="tabpanel">
                                                        <div className="details-tab-box">
                                                            <Seasons {...this.props} movie={this.state.movie} seasons={this.state.seasons} />
                                                        </div>
                                                    </div>
                                            : null
                                            }
                                            {
                                                this.state.clipsTrailers && this.state.clipsTrailers.results.length > 0 ? 
                                            <div className={`tab-pane fade${this.state.tabType == "trailers" ? " active show" : ""}`} id="trailers" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Trailers {...this.props} movie={this.state.movie} episode={this.state.episode} seasons={this.state.seasons} trailers={this.state.clipsTrailers.results} pagging={this.state.clipsTrailers.pagging} />
                                                </div>
                                            </div>
                                            : null
                                            }
                                            {
                                                this.state.castncrew && this.state.castncrew.length > 0 && this.props.pageData.appSettings['cast_crew_member'] == 1 ? 
                                            <div className={`tab-pane fade${this.state.tabType == "cast" ? " active show" : ""}`} id="cast" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Cast {...this.props} movie={this.state.movie} cast={this.state.castncrew} />
                                                </div>
                                            </div>
                                            : null
                                            }
                                            {
                                                this.state.reviews ? 
                                            <div className={`tab-pane fade${this.state.tabType == "reviews" ? " active show" : ""}`} id="reviews" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Reviews {...this.props} reviews={this.state.reviews} movie={this.state.movie} canEdit={this.state.movie.canEdit} canDelete={this.state.movie.canDelete} />
                                                </div>
                                            </div>
                                            : null
                                            }
                                            {
                                                this.state.images && this.state.images.length > 0 ? 
                                            <div className={`tab-pane fade${this.state.tabType == "images" ? " active show" : ""}`} id="images" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Images {...this.props} images={this.state.images} siteURL={this.props.pageData.siteURL} />
                                                </div>
                                            </div>
                                            : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {
                            this.state.relatedMovies && this.state.relatedMovies.length > 0 ?
                                <React.Fragment>
                                    <div className="container"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                    <Movies {...this.props} title={this.state.contentType == "movies" ? "Related Movies" : "Related Series"} movies={this.state.relatedMovies} />
                                </React.Fragment>
                            : null
                        }
                    </React.Fragment>
                }
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        song_id:state.audio.song_id,
        audios:state.audio.audios
    };
};
const mapDispatchToProps = dispatch => {
    return {
        updateAudioData: (audios, song_id,pausesong_id,submitText,passwordText) => dispatch(playlist.updateAudioData(audios, song_id,pausesong_id,submitText,passwordText)),
        setMenuOpen: (status) => dispatch(playlist.setMenuOpen(status)),
        openReport: (status, contentId, contentType) => dispatch(playlist.openReport(status, contentId, contentType)),
        openToast: (message, typeMessage) => dispatch(playlist.openToast(message, typeMessage)),
        updatePlayerData: (relatedVideos, playlistVideos, currentVideo, deleteMessage, deleteTitle,liveStreamingURL) => dispatch(playlist.updatePlayerData(relatedVideos, playlistVideos, currentVideo, deleteMessage, deleteTitle,liveStreamingURL))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Movie);