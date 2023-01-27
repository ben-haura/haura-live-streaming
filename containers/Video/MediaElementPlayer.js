import React, { Component } from "react"
import Currency from "../Upgrade/Currency"
import Translate from "../../components/Translate/Index.js"
import config from "../../config"

class MediaElementPlayer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            purchased:false,
            video:props.video,
            userAdVideo:props.userAdVideo,
            adminAdVideo:props.adminAdVideo,
            updateCount: 0,
            paused:false,
            currentVideoTime:props.currentVideoTime,
            isAdEnabled:props.userAdVideo || props.adminAdVideo ? true : false
        }
    }
    setup() {
        if(this.player){
            this.player.media.remove();
            this.player = null
        }
        var _ = this;
        if(this.currentPlayTime){
            clearInterval(this.currentPlayTime);
        }
        this.currentPlayTime = setInterval(function() {
            if(typeof _.props.updateTime == "undefined" && _.player && !_.state.isAdEnabled && _.props.upatePlayerTime){
                _.props.upatePlayerTime(_.player.getCurrentTime())
            }
        }, 1000);
        let updateCount = this.state.updateCount;
        this.setState({
          localUpdate:true,
          updateCount: updateCount + 1
        });
      }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.video != prevState.video || prevState.currentVideoTime  != nextProps.currentVideoTime){
            if(typeof nextProps.getHeight == "function")
                nextProps.getHeight();
            return {video:nextProps.video,currentVideoTime:nextProps.currentVideoTime,purchased:false,isAdEnabled:nextProps.userAdVideo || nextProps.adminAdVideo ? true : false}
        } else{
            return null
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if(this.state.updateCount !== prevState.updateCount) {
          // If it has a player, dispose
          if(this.player) {
            this.player.media.remove();
            this.player = null
          }
          // Create new player
          this.initiatePlayer()
        }
        if (this.props.video != prevState.video || prevState.currentVideoTime  != this.props.currentVideoTime){
            this.setup();
        }
      }
    handleEnded = () => {
        if(this.state.video.sell_videos && this.state.video.price > 0 && !this.state.video.videoPurchased ){
            this.setState({localUpdate:true,purchased:true})
        }else if(this.props.ended){
            this.props.ended(this.props.playType);
        }
    }
    updatePlayCount = () => {
        this.props.updatePlayCount(this.state.video.movie_video_id);
    }
    initiatePlayer = () => {
        if (this.state.video.status != 1)
            return
        
        var _ = this;
        // instantiate Video.js      
        
        const {MediaElementPlayer} = global;
		if (!MediaElementPlayer) {
			return;
		}

        let url = "";
        let adVideoLink = ""
        if(_.state.adminAdVideo){
            adVideoLink = _.props.imageSuffix+_.state.adminAdVideo.link
        }else if(_.state.userAdVideo){
            adVideoLink = _.props.imageSuffix+_.state.userAdVideo.media
        }
        if(_.state.adminAdVideo && _.state.adminAdVideo.type == 1 && _.state.adminAdVideo.click_link){
             url =  window.location.protocol+"//"+window.location.host+"/ad-clicked/admin/"+_.state.adminAdVideo.ad_id+"?url="+encodeURI(_.state.adminAdVideo.click_link)
        }else if(_.state.userAdVideo && _.state.userAdVideo.url){
             url =  window.location.protocol+"//"+window.location.host+"/ad-clicked/user/"+_.state.userAdVideo.ad_id+"/"+_.state.video.video_id+"?url="+encodeURI(_.state.userAdVideo.url)
        }
        
        
        let vPaidAds = ""
        if(_.state.adminAdVideo && _.state.adminAdVideo.type != 1){
            vPaidAds = this.state.adminAdVideo.link
        }

        let plugins = ['playpause', 'current', 'progress', 'duration', 'speed', 'skipback', 'jumpforward', 'tracks', 'markers', 'volume', 'chromecast', 'contextmenu']

        if(this.state.video.type == 3 || this.state.video.type == "upload"){

            plugins.push('quality');
            
            if(this.state.isAdEnabled)
                plugins.push('ads');
        }
        plugins.push("fullscreen")

		const options = {
			// Read the Notes below for more explanation about how to set up the path for shims
			pluginPath: 'https://cdnjs.com/libraries/mediaelement-plugins/',
            shimScriptAccess: 'always',
            iconSprite:"/static/images/mejs-controls.svg",
            videoWidth:"100%",
            videoHeight:"100%",
            setDimensions:false,
            autoplay: false,
            features: plugins,
            vastAdTagUrl: vPaidAds,
            vastAdsType: _.state.adminAdVideo ? _.state.adminAdVideo.type : "",
            jumpForwardInterval: 10,
            adsPrerollMediaUrl: [adVideoLink],
            adsPrerollAdUrl: [url],
            adsPrerollAdEnableSkip: _.state.adminAdVideo  ? (_.state.adminAdVideo.skip > 0 ? true : false) : false,
            adsPrerollAdSkipSeconds: _.state.adminAdVideo && _.state.adminAdVideo.skip > 0 ? parseInt(_.state.adminAdVideo.skip) : 5,
			success: function(media) {
                media.addEventListener('timeupdate', function (e) {
                    if(typeof _.props.updateTime == "undefined" && _.player && !_.state.isAdEnabled && _.props.upatePlayerTime){
                        _.props.upatePlayerTime(_.player.getCurrentTime())
                    }
                });
                media.addEventListener('ended', function (e) {
                    if(_.player && !_.state.isAdEnabled)
                        _.handleEnded()
                    else{
                        _.setState({localUpdate:true,isAdEnabled:false})
                    }
                }); 
                media.addEventListener('playing', function (e) {
                    if(_.player){
                        if(_.props.getHeight)
                            _.props.getHeight();
                    }
                    $('.mejs__mediaelement').find(".userad_cnt").remove();

                });
                media.addEventListener('loadedmetadata', function (e) {
                    if(_.player){
                        _.player.setMuted(true);
                        _.player.play();
                        _.player.setMuted(false);
                    }
                    if(_.props.getHeight)
                    _.props.getHeight();
                    if(_.state.currentVideoTime && !_.state.isAdEnabled){
                        _.player.setCurrentTime(_.state.currentVideoTime)
                    }
                    if(_.state.userAdVideo && _.state.isAdEnabled){
                        let url =  window.location.protocol+"//"+window.location.host+"/ad-clicked/user/"+_.state.userAdVideo.ad_id+"/"+_.state.video.video_id+"?url="+encodeURI(_.state.userAdVideo.url)
                        $('.mejs__mediaelement').append('<div class="userad_cnt" style="height:100px;bottom:20px"></div>')
                        if(_.state.userAdVideo.url)
                            $('.userad_cnt').attr("onClick",'window.open("'+url+'");');
                        if(_.state.userAdVideo && _.state.userAdVideo.title){
                            $(".userad_cnt").append("<div class='userad_title'>"+_.state.userAdVideo.title+"</div>")
                        }
                        if(_.state.userAdVideo && _.state.userAdVideo.description){
                            $(".userad_cnt").append("<div class='userad_description'>"+_.state.userAdVideo.description+"</div>")
                        }
                    }
                });
            },
			error: (media, node) => {
                // console.log("loading error",media)
            }
		};
		
		this.player = new MediaElementPlayer(`${this.state.video.custom_url || ''}-${this.state.updateCount}`, options)
    }
    componentDidMount() {
        this.setup();
    }

    // destroy player on unmount
    componentWillUnmount() {
        if (this.player) {
            if(this.currentPlayTime){
                clearInterval(this.currentPlayTime);
            }
            this.player.media.remove();
            this.player = null
        }
    }
    
    render() {

        let htmlPrice = null
        let userBalance = {}
        userBalance['package'] = { price: parseInt(this.state.video.price) }  
        if(this.state.purchased &&  !this.props.miniplayer){
            htmlPrice = <div className="purchase_video_content video_purchase" style={{ width: "100%", "height": this.props.height ? this.props.height : "100%"}}>
                            <div className="purchase_video_content_background"></div>
                            <h5>
                                {
                                    Translate(this.props,"More to watch! to continue watching this video, you have to purchase it.")
                                }<br /><br />
                                <button className="btn btn-main" onClick={this.props.purchaseClicked}>{Translate(this.props,'Purchase ')+" "+Currency({...this.props,...userBalance})} </button>
                            </h5>
                        </div>
        }

        let resolutionsVideo = []
        let resolution = null
        if(this.state.video){
            if(this.state.video.type == 3 || this.state.video.type == 'upload'){
                let splitName = this.state.video.video_location.split('/')
                let fullName = splitName[splitName.length - 1]
                let videoName = fullName.split('_')[0]
                let suffix = this.props.imageSuffix
                let path = "/upload/videos/video/"
                if(this.state.video.movie_video_id){
                    this.updatePlayCount();
                    path = "/upload/movies/video/"
                }
                if(this.state.video.price <= 0 || this.state.video.videoPurchased || !this.state.video.sell_videos){
                    if (this.state.video['4096p'] == 1) {
                        resolutionsVideo.push({
                            src: suffix + path + videoName + "_4096p.mp4",
                            type: 'video/mp4',
                            label: '4K',
                            res: 4096
                        })
                        resolution = "4096"
                    }
                    if (this.state.video['2048p'] == 1) {
                        resolutionsVideo.push({
                            src: suffix + path + videoName + "_2048p.mp4",
                            type: 'video/mp4',
                            label: '2K',
                            res: 2048
                        })
                        resolution = "2048"
                    }
                    if (this.state.video['1080p'] == 1) {
                        resolutionsVideo.push({
                            src: suffix + path + videoName + "_1080p.mp4",
                            type: 'video/mp4',
                            label: '1080p',
                            res: 1080
                        })
                        resolution = "1080"
                    }
                    if (this.state.video['720p'] == 1) {
                        resolutionsVideo.push({
                            src: suffix + path + videoName + "_720p.mp4",
                            type: 'video/mp4',
                            label: '720p',
                            res: 720
                        })
                        resolution = "720"
                    }
                    if (this.state.video['480p'] == 1) {
                        resolutionsVideo.push({
                            src: suffix + path + videoName + "_480p.mp4",
                            type: 'video/mp4',
                            label: '480p',
                            res: 480
                        })
                        if(!resolution)
                        resolution = "480"
                    }
                    if (this.state.video['360p'] == 1) {
                        resolutionsVideo.push({
                            src: suffix + path + videoName + "_360p.mp4",
                            type: 'video/mp4',
                            label: '360p',
                            res: 360
                        })
                        if(!resolution)
                        resolution = "360"
                    }
                    let isValid = true;
                    if (this.state.video['240p'] == 1) {
                        resolutionsVideo.push({
                            src: suffix + path + videoName + "_240p.mp4",
                            type: 'video/mp4',
                            label: '240p',
                            res: 240
                        })
                        isValid = false;
                        if(!resolution)
                        resolution = "240"
                    }
                    if (this.state.video.video_location && isValid) {
                        resolutionsVideo.push({
                            src: suffix + path + videoName + "_240p.mp4",
                            type: 'video/mp4',
                            label: '360p',
                            res: 360
                        })
                        if(!resolution)
                        resolution = "360"
                    }
                }else{
                    resolutionsVideo.push({
                        src: suffix + path + videoName + "_sample.mp4",
                        type: 'video/mp4',
                    })
                }
                
            }else if(this.state.video.code && this.state.video.code.split(',').length > 1){

                let videos = this.state.video.code.split(',')
                let videoPath = this.props.pageData.liveStreamingServerURL+`:5443/${this.props.pageData.streamingAppName}/streams/`
                if(this.props.pageData.liveStreamingCDNURL){
                    videoPath = this.props.pageData.liveStreamingCDNURL+`/streams/`
                }
                if(videos.length > 1){
                    if (this.state.video['4096p'] == 1) {
                        let url = videos.filter(function(item) {
                            return item.indexOf('_4096p') > -1;
                        });
                        if(url){
                            resolutionsVideo.push({
                                src: videoPath + url[0],
                                type: 'video/mp4',
                                label: '4K',
                                res: 4096
                            })
                            if(!resolution)
                                resolution = "4096"
                        }
                    }
                    if (this.state.video['2048p'] == 1) {
                        let url = videos.filter(function(item) {
                            return item.indexOf('_2048p') > -1;
                        });
                        if(url){
                            resolutionsVideo.push({
                                src: videoPath + url[0],
                                type: 'video/mp4',
                                label: '2K',
                                res: 2048
                            })
                            if(!resolution)
                                resolution = "2048"
                        }
                    }
                    if (this.state.video['1080p'] == 1) {
                        let url = videos.filter(function(item) {
                            return item.indexOf('1080p') > -1;
                        });
                        if(url){
                            resolutionsVideo.push({
                                src: videoPath + url[0],
                                type: 'video/mp4',
                                label: '1080p',
                                res: 1080
                            })
                            if(!resolution)
                                resolution = "1080"
                        }
                    }
                    if (this.state.video['720p'] == 1) {
                        let url = videos.filter(function(item) {
                            return item.indexOf('720p') > -1;
                        });
                        if(url){
                            resolutionsVideo.push({
                                src: videoPath + url[0],
                                type: 'video/mp4',
                                label: '720p',
                                res: 720
                            })
                            if(!resolution)
                                resolution = "720"
                        }
                    }
                    if (this.state.video['480p'] == 1) {
                        let url = videos.filter(function(item) {
                            return item.indexOf('480p') > -1;
                        });
                        if(url){
                            resolutionsVideo.push({
                                src: videoPath +url[0],
                                type: 'video/mp4',
                                label: '480p',
                                res: 480
                            })
                            if(!resolution)
                                resolution = "480"
                        }
                    }
                    if (this.state.video['360p'] == 1) {
                        let url = videos.filter(function(item) {
                            return item.indexOf('360p') > -1;
                        });
                        if(url){
                            resolutionsVideo.push({
                                src: videoPath + url[0],
                                type: 'video/mp4',
                                label: '360p',
                                res: 360
                            })
                            if(!resolution)
                                resolution = "360"
                        }
                    }
                    if (this.state.video['240p'] == 1) {
                        let url = videos.filter(function(item) {
                            return item.indexOf('240p') > -1;
                        });
                        if(url){
                            resolutionsVideo.push({
                                src: videoPath + url[0],
                                type: 'video/mp4',
                                label: '240p',
                                res: 240
                            })
                            if(!resolution)
                                resolution = "240"
                        }
                    }
                }else{
                    resolutionsVideo.push({
                        src: this.props.pageData.liveStreamingCDNURL ? this.props.pageData.liveStreamingCDNURL+"/streams/"+this.state.video.code : this.props.pageData.liveStreamingServerURL+`:5443/${this.props.pageData.streamingAppName}/streams/`+this.state.video.code,
                        type: 'video/mp4',
                        label: '480p',
                        res: 480
                    })
                    
                }
            }
        }


        let key = `${this.state.video.custom_url || ''}-${this.state.updateCount}`;
        let mediaHtml = null;
        if(this.state.video.status == 1 && resolutionsVideo.length > 0){
            let sourceTags = []
            for (let i = 0, total = resolutionsVideo.length; i < total; i++) {
                const source = resolutionsVideo[i];
                sourceTags.push(`<source src="${source.src}" type="${source.type}" data-quality="${source.label}">`);
            }
            const mediaBody = `${sourceTags.join("\n")}`;
            mediaHtml = `<video id="${key}" style="width:100%;height:100%" ${(this.state.video ? ` poster=${this.props.imageSuffix+this.state.video.image}` : '')}
                            ${(typeof this.props.showControls != "undefined" ? (this.props.showControls ? ' controls' : '') : ' controls' )}   preload="auto">
                            ${mediaBody}
                        </video>`;
        }else if(this.state.video.status == 1){
            let url = ""
            let type = ""
            if (this.state.video.type == 1) {
                url = `https://www.youtube.com/watch?v=${this.props.code}`
                type = "video/youtube"
            } else if (this.state.video.type == 2) {
                url = `https://vimeo.com/${this.props.code}`
                type = "video/vimeo"
            } else if (this.state.video.type == 4) {
                url = `https://www.dailymotion.com/video/${this.props.code}`
                type = "video/dailymotion"
            } else if (this.state.video.type == 5) {
                url = `https://www.twitch.tv/videos/${this.state.video.code}`
                type = "video/twitch"
            } else if (this.state.video.type == 9) {
                url = this.state.video.code
                if(this.state.video.code.indexOf(".m3u8") > -1){
                    type = "application/x-mpegURL"
                }else{
                    type = "video/mp4"
                }
            }else if (this.state.video.type == 10) {
                url = this.props.liveStreamingURL+"/"+this.state.video.code
                type = "video/mp4"
            }

            const mediaBody = `<source src="${url}" type="${type}" data-quality="360p">`;
            let image = this.state.video ? this.state.video.image : ""
            if(this.state.video && this.state.video.image.indexOf('http://') == -1 && this.state.video.image.indexOf("https://") == -1){
                image = this.props.imageSuffix+this.state.video.image
            }

            mediaHtml = `<video id="${key}" style="width:100%;height:100%" ${(this.state.video ? ` poster=${image}` : '')}
                            ${(typeof this.props.showControls != "undefined" ? (this.props.showControls ? ' controls' : '') : ' controls' )}   preload="auto">
                            ${mediaBody}
                        </video>`;
        }
        return (
            <div key={key} >
                <div className="video_player_cnt player-wrapper"  style={{width:"100%",height:this.props.height ? this.props.height : "600px",position: "relative"}} >
                    {
                        this.state.video.status == 1 ?
                            <React.Fragment>
                                {
                                    this.state.video.sell_videos && this.state.video.price > 0 && !this.state.video.videoPurchased &&  !this.props.miniplayer ? 
                                        <button className="video_purchase_btn" onClick={this.props.purchaseClicked}>{Translate(this.props,'Purchase ')+" "+Currency({...this.props,...userBalance})} </button>
                                    : null
                                }
                                {
                                    this.state.video.watermark && !this.props.pageData.fromAPP ? 
                                    <div className="watermarkLogo">
                                        <a href={config.app_server} {...this.props.watermarkLogoParams}>
                                            <img src={this.props.imageSuffix+this.state.video.watermark} />
                                        </a>
                                    </div>
                                    : null
                                }
                                {
                                    htmlPrice ? 
                                        htmlPrice : 
                                        null
                                }
                                <div style={{ width: "100%", "height": "100%",display:this.state.purchased ? "none" : "block"}} className="no-svg" dangerouslySetInnerHTML={{__html: mediaHtml}}></div>                        
                            </React.Fragment>
                            :
                            <div className="purchase_video_content video_processing_cnt" style={{ width: "100%", "height": this.props.height ? this.props.height : "100%"}}>
                                {
                                    this.state.video.status == 2 ?
                                        <h5>{this.props.t("Video is processing, please wait...")}</h5>
                                        :
                                        <h5>{this.props.t("Video failed processing, please upload new video.")}</h5>
                                }
                            </div>
                    }
                </div>
            </div>
        )
    }
}


export default MediaElementPlayer
