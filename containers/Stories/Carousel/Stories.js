import React from 'react';
import dynamic from 'next/dynamic'
import swal from "sweetalert"
import axios from "../../../axios-orders"
import Timeago from "../../Common/Timeago"
import Link from '../../../components/Link/index';
import LoadMore from "../../LoadMore/Index"
import EndContent from "../../LoadMore/EndContent"
import Release from "../../LoadMore/Release"
import InfiniteScroll from "react-infinite-scroll-component";
import Subscribe from "../../User/Follow"
import Like from "../../Like/Index"
import Dislike from "../../Dislike/Index"
import SocialShare from "../../SocialShare/Index"
import ShortNumber from "short-number"
const Comment = dynamic(() => import("../../../containers/Comments/Index"), {
    ssr: false,
});
const StoryArchive = dynamic(() => {
    return import('./Archive')
});

class Stories extends React.Component { 

    constructor(props){
        super(props)
        this.state = {
            items:props.items,
            fetchingData:props.fetchingData,
            pagging:props.pagging,
            openStory:props.openStory,
            privacy:props.pageData.storyPrivacy ? props.pageData.storyPrivacy : "public",
            defaultPrivacy:props.pageData.storyPrivacy ? props.pageData.storyPrivacy : "public",
            selectedStory:props.pageData.selectedStory ? props.pageData.selectedStory : ( props.selectedStory ?? 0),
            timer:0,
            muted:false,
            playPause:true,
            showMenu:false,
            loadingViewer:false
        }
       this.timerId = null;
       this.updateStoryTimer = this.updateStoryTimer.bind(this)
       this.getNextStory = this.getNextStory.bind(this)
       this.closeMenu = this.closeMenu.bind(this)
       this.showMenu = this.showMenu.bind(this)
       this.playMediaElement = this.playMediaElement.bind(this)
       this.audioElement = React.createRef();
       this.videoElement = React.createRef();
       this.dropdownMenu = React.createRef();
       this.loadMoreContent = this.loadMoreContent.bind(this)
        this.refreshContent = this.refreshContent.bind(this)
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if(nextProps.items && nextProps.items != prevState.items){
            let items = nextProps.items
            let nextP = {...nextProps}
            // nextProps.selectedStory = null
            // nextProps.selectedOpenStory = null
            
            let selectedStory = nextP.selectedStory || nextP.selectedStory == 0
            let selectedOpenStory = nextP.selectedOpenStory || nextP.selectedOpenStory == 0
            return {
                ...prevState,
                items:items,
                loadingViewer:nextP.loadingViewer,
                pagging:nextP.pagging,
                fetchingData:nextP.fetchingData,
                selectedStory: selectedStory ? nextP.selectedStory : prevState.selectedStory,
                openStory: selectedOpenStory ? nextP.selectedOpenStory : prevState.openStory,
                timer:selectedStory == prevState.selectedStory ? prevState.timer : 0
            }
        } else if(nextProps.loadingViewer != prevState.loadingViewer){
            return {
                ...prevState,
                loadingViewer:nextProps.loadingViewer
            }
        }else if((nextProps.selectedOpenStory == 0 || nextProps.selectedOpenStory) && nextProps.selectedOpenStory != prevState.selectedStory){
            return {
                ...prevState,
                selectedStory:nextProps.selectedOpenStory
            }
        }else{
            return null;
        }
    }
    
    
    componentDidMount(){
        $("body").addClass("stories-open");
        if(this.props.pageData.loggedInUserDetails)
            this.getPrivacy();
        this.props.closePopupFirst(true);
        //check first item in selected story
        if(this.state.items[this.state.openStory].stories[this.state.selectedStory].status == 1)
            setTimeout(() => {
                this.playMediaElement();
                if(this.videoElement.current)
                    this.videoElement.current.muted = false;
                if(this.audioElement.current)
                    this.audioElement.current.muted = false;
            },1000)
        this.updateStoryViewer();

    }
    refreshContent() {
        this.loadMoreContent()
    }
    updateStoryViewer = () => {
        if(this.props.getStoryViewer && this.state.items[this.state.openStory])
            this.props.getStoryViewer(this.state.items[this.state.openStory],this.state.items[this.state.openStory].stories[this.state.selectedStory].story_id)
    }
    loadMoreContent() {
        if(this.state.fetchingData){
            return;
        }
        if(this.props.fetchStoriesData)
            this.props.fetchStoriesData();
    }
    playMediaElement(){
        if(!this.state.items[this.state.openStory] || !this.state.items[this.state.openStory].stories[this.state.selectedStory]){
            return;
        }
        if(parseInt(this.state.items[this.state.openStory].stories[this.state.selectedStory].type) == 1){
            clearInterval(this.timerId)
            if(this.videoElement.current){
                this.videoElement.current.currentTime = 0
                this.videoElement.current.play();
                this.videoElement.current.load();
                this.videoElement.current.addEventListener('timeupdate', this.updateTimerMedia);
            }
        }else if(parseInt(this.state.items[this.state.openStory].stories[this.state.selectedStory].type) == 2){
            clearInterval(this.timerId)
            if(this.audioElement.current){
                this.audioElement.current.currentTime = 0
                this.audioElement.current.play();
                this.audioElement.current.load();
                this.audioElement.current.addEventListener('timeupdate', this.updateTimerMedia);
            }
        }
    }
    updateStoryTimer = () => {
        var _ = this
        this.timerId = setInterval(() => {
            if(!this.state.playPause)
                return;
            let stories_delay = parseInt(_.props.pageData.appSettings["stories_delay"]) > 0 ? parseInt(_.props.pageData.appSettings["stories_delay"])*10 : 50
            let checkMediaType = parseInt(_.state.items[_.state.openStory].stories[_.state.selectedStory].type)
            let progress = 0;
            if(checkMediaType == 0 || checkMediaType == 3){
                progress = _.state.timer + 1 
            }

            if(stories_delay == _.state.timer){
                clearInterval(_.timerId)
                let stories = _.state.items[_.state.openStory]
                if(_.state.selectedStory < stories.stories.length - 1){
                    _.setState({localUpdate:true,selectedStory:_.state.selectedStory+1,timer:0,playPause:true},() => {
                        clearInterval(_.timerId)
                        _.playMediaElement()
                        _.updateStoryViewer();
                    });
                }else{
                    if(_.state.openStory < this.state.items.length - 1){
                        _.setState({localUpdate:true,openStory:_.state.openStory+1,selectedStory:0,timer:0,playPause:true},() => {
                            clearInterval(_.timerId)
                            _.playMediaElement()
                            _.updateStoryViewer();
                        });
                    }else{
                        this.props.closePopup('');
                    }
                }
            }else{
                _.setState({
                    localUpdate:true, timer: progress
                })
            }
          }, 100);
    }
    updateTimerMedia = () => {
        let progress = 0
        if(parseInt(this.state.items[this.state.openStory].stories[this.state.selectedStory].type) == 1){
            if(this.videoElement.current){
                progress = (this.videoElement.current.currentTime / this.videoElement.current.duration) * 100;
                if(this.videoElement.current.currentTime == this.videoElement.current.duration){
                    this.removeVideoRefs();
                    clearInterval(this.timerId)
                    return;
                }
            }
        }else{
            if(this.audioElement.current){
                progress = (this.audioElement.current.currentTime / this.audioElement.current.duration) * 100;
                if(this.audioElement.current.currentTime == this.audioElement.current.duration){
                    this.removeAudioRefs();
                    clearInterval(this.timerId)
                    return;
                }
            }
        }
        this.setState({
            localUpdate:true, timer: progress
        })
    }
    componentWillUnmount(){
        if(this.timerId)
            clearInterval(this.timerId);
        this.removeVideoRefs();
        this.removeAudioRefs();
    }
    showNextButton = () => {
        var isValid = false;
        let stories = this.state.items[this.state.openStory]
        if(this.state.selectedStory < stories.stories.length - 1){
            isValid = true;
        }else{
            if(this.state.openStory < this.state.items.length - 1){
                isValid = true;
            }
        }
        return isValid;
    }
    getNextStory = () => {
        var _ = this
        let stories = _.state.items[_.state.openStory]
        this.removeVideoRefs();
        this.removeAudioRefs();
        if(_.state.selectedStory < stories.stories.length - 1){
            if(this.timerId)
                clearInterval(this.timerId)
            if(_.videoElement.current)
            _.videoElement.current.currentTime = 0
            if(_.audioElement.current)
            _.audioElement.current.currentTime = 0
            _.setState({localUpdate:true,selectedStory:_.state.selectedStory+1,timer:0,playPause:true},() => {
                _.playMediaElement()
                _.updateStoryViewer();
            });
        }else{
            if(_.state.openStory < this.state.items.length - 1){
                if(this.timerId)
                    clearInterval(this.timerId)
                if(_.videoElement.current)
                _.videoElement.current.currentTime = 0
                if(_.audioElement.current)
                _.audioElement.current.currentTime = 0
                _.setState({localUpdate:true,openStory:_.state.openStory+1,selectedStory:0,timer:0,playPause:true},()=>{
                    _.playMediaElement()
                    _.updateStoryViewer();
                });
            }else{
                this.props.closePopup('')
            }
        }
    }
    showPrevButton = () => {
        var isValid = false;
        if(this.state.selectedStory != 0){
            isValid = true;
        }else{
            if(this.state.openStory != 0){
                isValid = true;
            }else{
                isValid = false;
            }
        }
        return isValid
    }
    getPreviousStory = () => {
        var _ = this
        this.removeVideoRefs();
        this.removeAudioRefs();
        if(_.state.selectedStory != 0){
            if(this.timerId)
                clearInterval(this.timerId)
            if(_.videoElement.current)
            _.videoElement.current.currentTime = 0
            if(_.audioElement.current)
            _.audioElement.current.currentTime = 0
            _.setState({localUpdate:true,selectedStory:_.state.selectedStory-1,timer:0,playPause:true},() => {
                _.playMediaElement()
                _.updateStoryViewer();
            });
        }else{
            if(_.state.openStory != 0){
                if(this.timerId)
                    clearInterval(this.timerId)
                if(_.videoElement.current)
                _.videoElement.current.currentTime = 0
                if(_.audioElement.current)
                _.audioElement.current.currentTime = 0
                _.setState({localUpdate:true,openStory:_.state.openStory-1,selectedStory:0,timer:0,playPause:true},()=>{
                    _.playMediaElement()
                    _.updateStoryViewer();
                });
            }else{
                this.props.closePopup('')
            }
        }
    }
    removeVideoRefs = () => {
        if(this.videoElement.current){
            this.videoElement.current.pause()
            this.videoElement.current.removeEventListener('timeupdate', this.updateTimerMedia);
            this.videoElement.current.removeEventListener('ended', this.getNextStory);
        }
    }
    removeAudioRefs = () => {
        if(this.audioElement.current){
            this.audioElement.current.pause()
            this.audioElement.current.removeEventListener('timeupdate', this.updateTimerMedia);
            this.audioElement.current.removeEventListener('ended', this.getNextStory);
        }
    }
    getPrivacy = () => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/get-privacy';

        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                
            }else{
                this.setState({localUpdate:true,defaultPrivacy:response.data.privacy,privacy:response.data.privacy})
            }
        }).catch(err => {
            
        });
    }
    submitPrivacy = (e) => {
        e.preventDefault();
        if(this.playPauseMedia)
            this.pausePlayMedia(true)
        this.setState({isSubmit:false,localUpdate:true,settingMenu:false,defaultPrivacy:this.state.privacy,playPause:this.playPauseMedia});
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/privacy';
        formData.append('privacy',this.state.privacy);
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                
            }else{
                
            }
        }).catch(err => {
            
        });
    }
    openSettings = (e) => {

        this.setState({localUpdate:true,settingMenu:true,privacy:this.state.defaultPrivacy})
    }
    mutedMedia = (type) => {
        let checkMediaType = parseInt(this.state.items[this.state.openStory].stories[this.state.selectedStory].type)
        if(checkMediaType == 1){
            if(type)
                this.videoElement.current.muted = true;
            else
                this.videoElement.current.muted = false;
        }else if(checkMediaType == 2){
            if(type)
                this.audioElement.current.muted = true;
            else
                this.audioElement.current.muted = false;
        }
    }
    pausePlayMedia = (type) => {
        let checkMediaType = parseInt(this.state.items[this.state.openStory].stories[this.state.selectedStory].type)
        if(checkMediaType == 1){
            if(type)
                this.videoElement.current.play()
            else
                this.videoElement.current.pause()
        }else if(checkMediaType == 2){
            if(type)
                this.audioElement.current.play()
            else
                this.audioElement.current.pause()
        }
    }
    closeMenu(event){
        if (event.target && this.dropdownMenu && !this.dropdownMenu.contains(event.target)) {
            this.setState({localUpdate:true, showMenu: false,playPause:this.playPauseMedia }, () => {
                document.removeEventListener('click', this.closeMenu,false);
              if(this.playPauseMedia)
               this.pausePlayMedia(true)
            })
        }
    }
    
    showMenu = (e) => {
        e.preventDefault();
        if(!this.state.showMenu){
            let states = {...this.state}
            this.playPauseMedia = states.playPause
            this.setState({localUpdate:true,showMenu:true,playPause:false},()=>{
                setTimeout(() =>{
                    document.addEventListener("click", this.closeMenu, false);
                },1000);
                this.pausePlayMedia(false)
            })
        }
    }
    muteStory = (id,owner_id) => {
        
        swal({
            title: this.props.t("Mute Story?"),
            text: this.props.t("You'll stop seeing their story."),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    this.setState({timer: 0,localUpdate:true},()=>{
                        this.removeVideoRefs();
                        this.removeAudioRefs();
                        if(this.timerId)
                            clearInterval(this.timerId)
                        if(this.videoElement.current)
                            this.videoElement.current.currentTime = 0
                        if(this.audioElement.current)
                            this.audioElement.current.currentTime = 0
                        this.props.muteStory(owner_id);
                        if(!this.state.playPause){
                            setTimeout(() =>{
                                this.playMediaElement();
                                this.updateStoryViewer();
                            },100);
                        }
                        const config = {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            }
                        };
                        let formData = new FormData();
                        let url = '/stories/mute/'+id;
                        axios.post(url, formData,config)
                        .then(response => {
                            if(response.data.error){
                                alert(response.data.error)
                            }else{
                                
                            }
                        }).catch(err => {
                            
                        });
                    });
                    
                }
            });

        
    }
    deleteStory = (id,owner_id) => {
        swal({
            title: this.props.t("Delete Story?"),
            text: this.props.t("Delete this story from your story?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    this.setState({timer: 0,localUpdate:true},()=>{
                        this.removeVideoRefs();
                        this.removeAudioRefs();
                        if(this.timerId)
                            clearInterval(this.timerId)
                        if(this.videoElement.current)
                            this.videoElement.current.currentTime = 0
                        if(this.audioElement.current)
                            this.audioElement.current.currentTime = 0
                        this.props.removeStory(id,owner_id);
                        if(this.playPauseMedia){
                            setTimeout(() =>{
                                this.playMediaElement();
                                this.updateStoryViewer();
                            },100);
                        }
                        const config = {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            }
                        };
                        let formData = new FormData();
                        let url = '/stories/delete/'+id;
                        axios.post(url, formData,config)
                        .then(response => {
                            if(response.data.error){
                                alert(response.data.error)
                            }else{
                                
                            }
                        }).catch(err => {
                            
                        });
                    });
                    
                }
            });
    }
    render() {
        if(!this.state.items[this.state.openStory] || this.state.items[this.state.openStory].stories.length == 0 || !this.state.items[this.state.openStory].stories[this.state.selectedStory] || this.state.items[this.state.openStory].stories[this.state.selectedStory].length == 0){
            if(typeof window !== 'undefined'){
                $("body").removeClass("stories-open");
            }
            return null;
        }
        let stories_delay = parseInt(this.props.pageData.appSettings["stories_delay"]) > 0 ? parseInt(this.props.pageData.appSettings["stories_delay"])*10 : 50
        let checkMediaType = parseInt(this.state.items[this.state.openStory].stories[this.state.selectedStory].type)
        let timer = 0;
        if(checkMediaType == 0 || checkMediaType == 3){
            timer = (this.state.timer/stories_delay)*100
        }else if(checkMediaType == 1 && this.videoElement.current){
            timer = (this.videoElement.current.currentTime / this.videoElement.current.duration) * 100;
        }else if(checkMediaType == 2 && this.audioElement.current){
            timer = (this.audioElement.current.currentTime / this.audioElement.current.duration) * 100;
        }
        

        let settings = null;
        if(this.state.settingMenu){
            settings = <div className="popup_wrapper_cnt">
                            <div className="popup_cnt">
                                <div className="comments">
                                    <div className="VideoDetails-commentWrap">
                                        <div className="popup_wrapper_cnt_header">
                                            <h2>{this.props.t("Story Privacy")}</h2>
                                            <a onClick={(e)=>{
                                                if(this.playPauseMedia)
                                                    this.pausePlayMedia(true)
                                                this.setState({localUpdate:true,settingMenu:false,playPause:this.playPauseMedia})
                                            }} className="_close"><i></i></a>
                                        </div>
                                        <div className="stories_privacy">
                                            <form className="formFields px-3" method="post" onSubmit={this.submitPrivacy}>
                                                <div className="form-check">
                                                    <input type="radio" 
                                                    className="form-check-input"
                                                    checked={this.state.privacy === "public"}
                                                    onChange={(e) => {
                                                        this.setState({localUpdate:true,privacy:e.target.value})
                                                    }}
                                                    id="public_pr" name="privacy" value="public" /> 
                                                    <label className="form-check-label" htmlFor="public_pr">{this.props.t("Public")}</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="radio" 
                                                     className="form-check-input"
                                                    checked={this.state.privacy === "onlyme"}
                                                    onChange={(e) => {
                                                        this.setState({localUpdate:true,privacy:e.target.value})
                                                    }}
                                                    id="onlyme_pr" name="privacy" value="onlyme" /> 
                                                    <label className="form-check-label" htmlFor="onlyme_pr">{this.props.t("Only Me")}</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="radio" 
                                                     className="form-check-input"
                                                    checked={this.state.privacy === "follow"}
                                                    onChange={(e) => {
                                                        this.setState({localUpdate:true,privacy:e.target.value})
                                                    }}
                                                    id="foll_pr" name="privacy" value="follow" /> 
                                                    <label className="form-check-label" htmlFor="foll_pr">{this.props.t("People I Follow")}</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="radio"
                                                     className="form-check-input"
                                                    checked={this.state.privacy === "followers"}
                                                    onChange={(e) => {
                                                        this.setState({localUpdate:true,privacy:e.target.value})
                                                    }}
                                                    id="mefoll_pr" name="privacy" value="followers" /> 
                                                    <label className="form-check-label" htmlFor="mefoll_pr">{this.props.t("People Follow Me")}</label>
                                                </div>
                                                <div className="input-group mt-3">
                                                    <button type="submit">{this.props.t("Save")}</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
        }


        let image = null;
        if(this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 3){
            image =  this.state.items[this.state.openStory].stories[this.state.selectedStory].background_image
         }else { 
            image =  this.state.items[this.state.openStory].stories[this.state.selectedStory].image
        }

        let archiveStories = null
        if(this.state.archiveStories){
            archiveStories = <StoryArchive {...this.props} closePopup={(e)=>{
                e.preventDefault();
                if(this.playPauseMedia)
                    this.pausePlayMedia(true)
                this.setState({localUpdate:true,archiveStories:false,playPause:this.playPauseMedia})
            }}></StoryArchive>
        }
        let logo = ""
        if (this.props.pageData.themeMode == "dark") {
            logo = this.props.pageData['imageSuffix'] + this.props.pageData.appSettings['darktheme_logo']
        } else {
            logo = this.props.pageData['imageSuffix'] + this.props.pageData.appSettings['lightheme_logo']
        }

        let comment = null
        if(this.state.openComment){
            comment = <div className="popup_wrapper_cnt">
            <div className="popup_cnt">
                <div className="comments">
                    <div className="VideoDetails-commentWrap">
                        <div className="popup_wrapper_cnt_header">
                            <h2>{this.props.t("Comments")}</h2>
                            <a onClick={(e) => {
                                if(this.playPauseMedia)
                                    this.pausePlayMedia(true)
                                this.setState({localUpdate:true,openComment:false,playPause:this.playPauseMedia})
                            }} className="_close"><i></i></a>
                        </div>
                        <div className="reel_comment">
                            <div className="row">
                                <Comment  {...this.props}  owner_id={this.state.items[this.state.openStory].stories[this.state.selectedStory].owner_id} hideTitle={true} appSettings={this.props.pageData.appSettings} commentType="story" type="stories" comment_item_id={this.state.items[this.state.openStory].stories[this.state.selectedStory].story_id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            
        }

        return (
            <React.Fragment>
                {comment}
                {settings}
                <div className={`story-details stories-view`}>
                <div className='popupHeader'>
                        <div className='HeaderCloseLogo'>
                        <a className='closeBtn' href="#" onClick={(e) => {
                        e.preventDefault();
                        this.props.closePopup(this.props.fromDirect ? "" : "notClose");
                    }}><span className="material-icons">close</span></a>
                            <div className='HeaderCloseLogo-logo'>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    this.props.closePopup(e);
                                }}>
                                    <img src={logo} className="img-fluid" />
                                </a>
                            </div>
                        </div>
                    </div>
                    {/* <a href="#" onClick={(e) => {
                        e.preventDefault();
                        if(this.timerId)
                            clearInterval(this.timerId)
                        this.props.closePopup();
                    }}>CLOSE</a> */}
                    {
                        !this.props.fromArchive ?
                    
                    <div className="story-sidebar">
                        {
                            this.props.pageData.loggedInUserDetails ? 
                                <React.Fragment>
                                    <div className="d-flex align-items-center justify-content-between my-3">
                                        <h2 className="heading-sdbar"> {this.props.t("Your Story")} </h2>
                                        <div>
                                        <a className='px-2' href="#" onClick={(e) => {
                                            e.preventDefault();
                                            this.playPauseMedia = this.state.playPause
                                            this.setState({localUpdate:true,archiveStories:true,playPause:false},() => {
                                                this.pausePlayMedia(false)
                                            })
                                        }}> {this.props.t("Archive")}</a>
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            this.playPauseMedia = this.state.playPause                                                
                                            this.setState({localUpdate:true,settingMenu:true,privacy:this.state.defaultPrivacy,playPause:false},() => {
                                                this.pausePlayMedia(false)
                                            })
                                        }}> {this.props.t("Setting")}</a>
                                        </div>
                                    </div>
                                    
                                </React.Fragment>
                        : null
                        }
                        <div className="storyList">
                            <div className="storyListBox sidebar-scroll" id="stories-scrollableDiv">
                                {/* <h3 className="sdTitleStory">{this.props.t("Your story")}</h3> */}
                               {
                                   this.props.pageData.loggedInUserDetails && this.props.pageData.levelPermissions["stories.create"] == 1 ?
                                        <a className="d-flex align-items-center addStoryBtn" href="#" onClick={(e) => {
                                                this.playPauseMedia = this.state.playPause
                                                this.props.createStory(e);
                                                this.setState({localUpdate:true,playPause:false},() => {
                                                    this.pausePlayMedia(false)
                                                })
                                            }}>
                                            <div className="btncrle">
                                                <span className="material-icons">
                                                    add
                                                </span>
                                            </div>
                                            <div className="flex-grow-1 addStoryBtnText">
                                                <h5 className="m-0">{this.props.t("Create a story")}</h5>
                                            </div>
                                        </a>
                                : null
                                }
                               

                                <h3 className="sdTitleStory mt-3">{this.props.t("Stories")}</h3>
                                <div className="story-users-list">
                                    
                                    {
                                        <InfiniteScroll
                                            dataLength={this.state.items.length}
                                            next={this.loadMoreContent}
                                            hasMore={this.state.pagging}
                                            loader={<LoadMore {...this.props} loading={true} itemCount={this.state.items.length} />}
                                            endMessage={
                                                <EndContent {...this.props} text={""} itemCount={this.state.items.length} />
                                            }
                                            scrollableTarget="stories-scrollableDiv"
                                            pullDownToRefresh={false}
                                            pullDownToRefreshContent={<Release release={false} {...this.props} />}
                                            releaseToRefreshContent={<Release release={true} {...this.props} />}
                                            refreshFunction={this.refreshContent}
                                        >
                                            {
                                                this.state.items.map((item,index) => {
                                                    return (
                                                        <a key={index} className={`${this.state.openStory == index ? 'active' : ''}`} href="#" onClick={(e)=>{
                                                            e.preventDefault();
                                                            if(index == this.state.openStory){
                                                                return
                                                            }
                                                            clearInterval(this.timerId);
                                                            this.removeVideoRefs();
                                                            this.removeAudioRefs();
                                                            if(this.videoElement.current)
                                                                this.videoElement.current.currentTime = 0
                                                            if(this.audioElement.current)
                                                                this.audioElement.current.currentTime = 0
                                                            this.setState({selectedOpenStory:null,selectedStory:null,localUpdate:true,openStory:index,timer:0,selectedStory:0,playPause:true},()=>{
                                                                this.playMediaElement();
                                                                this.updateStoryViewer();
                                                            })
                                                        }}>
                                                            <div className="story-media">
                                                                <img src={this.props.pageData.imageSuffix + item.avtar} alt="" />
                                                            </div>
                                                            <div className="story-text">
                                                                <div className="story-username"> 
                                                                    {item.displayname}
                                                                </div>
                                                                <p> 
                                                                    <span className="story-time"> 
                                                                        <Timeago {...this.props}>{item.stories[item.stories.length - 1].creation_date}</Timeago>
                                                                    </span> 
                                                                </p>
                                                            </div>
                                                        </a>
                                                    )
                                                })
                                            }
                                        </InfiniteScroll>
                                    }

                                </div>

                            </div>
                        </div>
                    </div>
                   : null
                }
                    <div className="story-content position-relative">
                        <div className="storyDetails-Bg"> 
                            <div className="storyDetails-BgImg">
                                <div className="bgImg" style={
                                    {
                                        backgroundImage:`url(${image})`,backgroundRepeat: "no-repeat", backgroundSize: "cover",backgroundPosition: "center"
                                    }}>
                                </div>
                            </div>
                        </div>
                        <div className="storyDetails-contentWrap">
                            <div className="storyDetails-contentBox">
                                
                                <div className="storyDetails-cntent">
                                    <div className="storyTopOverlay">
                                        <div className="storyDetails-slidIndictr">
                                            {
                                                this.state.items[this.state.openStory].stories.map((item,index) => {

                                                    let width = "0%"
                                                    if(this.state.selectedStory == index){
                                                        width = `${timer}%`
                                                    }
                                                    if(this.state.selectedStory > index){
                                                        width = `100%`
                                                    }
                                                    return (
                                                        <div className="slidIndictr-nmbr" key={index}>
                                                            <div className="slidIndictr-nmbr-see"
                                                                style={
                                                                    {
                                                                        width:width,
                                                                        transitionDuration: "0.1s"
                                                                    }
                                                                }>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div> 
                                        <div className="storyDetails-userName">
                                            <Link href="/member" customParam={`id=${this.state.items[this.state.openStory].username}`} as={`/${this.state.items[this.state.openStory].username}`}>
                                                <a className="nameTitme" onClick={(e) => {
                                                    if(e.target && e.target.className == 'follow-member'){
                                                        return;
                                                    }
                                                    this.props.closePopup('');
                                                    $("body").removeClass("stories-open");
                                                }}>
                                                    <div className="img">
                                                        <img className="avatar-40 rounded-circle" src={
                                                            this.props.pageData.imageSuffix+this.state.items[this.state.openStory].avtar
                                                        } alt="" />
                                                    </div>
                                                    <div className="nameTime">
                                                        <span className="name">{this.state.items[this.state.openStory].displayname}</span>
                                                        {
                                                            this.props.pageData.appSettings['users_follow'] == 1 && (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id != this.state.items[this.state.openStory].owner_id) ? 
                                                                <React.Fragment>
                                                                    <span>
                                                                        <span>&nbsp;</span>
                                                                        <span>·</span>
                                                                        <span>&nbsp;</span>
                                                                    </span>
                                                                    <Subscribe  {...this.props} nolink={true} className="follwbtn" type="members" user={{follower_id:this.state.items[this.state.openStory].follower_id, user_id:this.state.items[this.state.openStory].owner_id}} user_id={this.state.items[this.state.openStory].owner_id} />
                                                                </React.Fragment> 
                                                                
                                                            : null
                                                        }
                                                        {/* <span className="time"><Timeago {...this.props}>{this.state.items[this.state.openStory].stories[this.state.selectedStory].creation_date}</Timeago></span> */}
                                                        <div className="time">
                                                            <Timeago {...this.props}>{this.state.items[this.state.openStory].stories[this.state.selectedStory].creation_date}</Timeago>
                                                        </div>
                                                    </div>
                                                </a>
                                            </Link>
                                            <div className="optionStoryslid">
                                                {
                                                    this.state.items[this.state.openStory].stories[this.state.selectedStory].status == 1 ?
                                                    <div className="icon">
                                                        {
                                                            !this.state.playPause ? 
                                                                <span className="material-icons hidden" onClick={() => {
                                                                    this.setState({localUpdate:true,playPause:true},()=>{
                                                                        this.pausePlayMedia(true)
                                                                    })
                                                                }}>
                                                                    play_arrow
                                                                </span>
                                                            :
                                                                <span className="material-icons" onClick={() => {
                                                                    this.setState({localUpdate:true,playPause:false},()=>{
                                                                        this.pausePlayMedia(false)
                                                                    })
                                                                }}>
                                                                    pause
                                                                </span>
                                                        }

                                                    </div>
                                                    : null
                                                    }
                                                {
                                                    this.state.items[this.state.openStory].stories[this.state.selectedStory].status == 1 && (this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 2 || this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 1) ?
                                                    <React.Fragment>
                                                        
                                                        <div className="icon">
                                                        {
                                                            !this.state.muted ? 
                                                                <span className="material-icons" onClick={() => {
                                                                    this.setState({localUpdate:true,muted:true},()=>{
                                                                        this.mutedMedia(true)
                                                                    })
                                                                }}>
                                                                    volume_up
                                                                </span>
                                                        :
                                                            <span className="material-icons hidden" onClick={() => {
                                                                this.setState({localUpdate:true,muted:false},()=>{
                                                                    this.mutedMedia(false)
                                                                })
                                                            }}>
                                                                volume_off
                                                            </span>
                                                        }
                                                        </div>
                                                    </React.Fragment>
                                                : null
                                                }
                                                {
                                                    this.props.pageData.loggedInUserDetails ? 
                                                        <div className="icon">
                                                            
                                                            <a href="#" className="icon-Dvert" onClick={this.showMenu}>
                                                                <span className="material-icons" id="stories-drop-down">
                                                                    more_horiz
                                                                </span>
                                                            </a>
                                                            <ul className={`dropdown-menu dropdown-menu-right moreOptionsShow${this.state.showMenu ? ' show' : ""}`} ref={(element) => {
                                                                this.dropdownMenu = element;
                                                            }}>
                                                                {
                                                                    this.props.pageData.loggedInUserDetails && ( this.props.pageData.levelPermissions["stories.delete"] == 2 || (this.props.pageData.levelPermissions["stories.delete"] == 1 && this.props.pageData.loggedInUserDetails.user_id == this.state.items[this.state.openStory].owner_id)) ?
                                                                    <li>
                                                                        <a className="delete-stories" href="#" onClick={(e)=>{
                                                                            e.preventDefault();
                                                                            this.deleteStory(this.state.items[this.state.openStory].stories[this.state.selectedStory].story_id,this.state.items[this.state.openStory].stories[this.state.selectedStory].owner_id);
                                                                        }}>
                                                                            <span className="material-icons" data-icon="delete"></span>
                                                                            {this.props.t("Delete")}
                                                                        </a>
                                                                    </li>
                                                                : null
                                                                }

                                                                {
                                                                    this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id != this.state.items[this.state.openStory].owner_id ?
                                                                    <li>
                                                                        <a className="mute-stories" href="#" onClick={(e) => {
                                                                            e.preventDefault();
                                                                            this.muteStory(this.state.items[this.state.openStory].stories[this.state.selectedStory].story_id,this.state.items[this.state.openStory].stories[this.state.selectedStory].owner_id);
                                                                        }}>
                                                                            <span className="material-icons" data-icon="volume_off"></span>
                                                                            {this.props.t("Mute {{user}}",{user:this.state.items[this.state.openStory].displayname})}
                                                                        </a>
                                                                    </li>
                                                                : null
                                                                }
                                                            </ul>
                                                        </div>
                                                    : null
                                                    }
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        this.state.items[this.state.openStory].stories[this.state.selectedStory].status == 1 ?
                                        <React.Fragment>
                                    <div className="imageBox">
                                        {
                                            this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 2 ? 
                                                <React.Fragment>
                                                    <img style={{
                                                        display: `block`,
                                                    }} className="img-fluid" src={this.state.items[this.state.openStory].stories[this.state.selectedStory].type != 3 ? this.props.pageData.imageSuffix+this.state.items[this.state.openStory].stories[this.state.selectedStory].image : this.props.pageData.imageSuffix+this.state.items[this.state.openStory].stories[this.state.selectedStory].background_image } /> 
                                                </React.Fragment>
                                            : this.state.items[this.state.openStory].stories[this.state.selectedStory].type != 1 ? 
                                                <img style={{
                                                    display: `${this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 1 ? "none" : ""}`,
                                                }} className="img-fluid" src={this.state.items[this.state.openStory].stories[this.state.selectedStory].type != 3 ? this.props.pageData.imageSuffix+this.state.items[this.state.openStory].stories[this.state.selectedStory].image : this.props.pageData.imageSuffix+this.state.items[this.state.openStory].stories[this.state.selectedStory].background_image+"?id="+this.state.items[this.state.openStory].stories[this.state.selectedStory].story_id } onLoad={this.updateStoryTimer} />
                                            : null
                                        }
                                        {
                                            <React.Fragment>
                                                <video autoPlay={true} muted  ref={this.videoElement} onEnded={this.getNextStory} playsInline={true} style={{
                                                    display: `${this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 1 ? "block" : "none"}`,
                                                }}>
                                                    {
                                                        this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 1 ? 
                                                            <source src={this.props.pageData.imageSuffix+this.state.items[this.state.openStory].stories[this.state.selectedStory].file} type="video/mp4"/>
                                                        : null
                                                    }
                                                </video>
                                            </React.Fragment>
                                        }
                                        {
                                            <React.Fragment>
                                                <audio autoPlay={true} muted  ref={this.audioElement} onEnded={this.getNextStory} style={{
                                                    display: `none`,
                                                }}>
                                                    {
                                                        this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 2 ? 
                                                            <source src={this.props.pageData.imageSuffix+this.state.items[this.state.openStory].stories[this.state.selectedStory].file} type="audio/mp3"/>
                                                        : null
                                                    }
                                                </audio>
                                            </React.Fragment>
                                        }
                                    </div>
                                    <div className="stories-user-content">
                                            <ul>
                                            {
                                                this.props.pageData.appSettings[`${"story_like"}`] == 1 ?
                                                    <li>
                                                        <Like {...this.props} icon={true} like_count={this.state.items[this.state.openStory].stories[this.state.selectedStory].like_count} item={this.state.items[this.state.openStory].stories[this.state.selectedStory]} type={"story"} id={this.state.items[this.state.openStory].stories[this.state.selectedStory].story_id} />
                                                    </li>
                                                    : null
                                            }
                                            {
                                                this.props.pageData.appSettings[`${"story_dislike"}`] == 1 ?
                                                    <li>
                                                        <Dislike {...this.props} icon={true} dislike_count={this.state.items[this.state.openStory].stories[this.state.selectedStory].dislike_count} item={this.state.items[this.state.openStory].stories[this.state.selectedStory]} type={"story"} id={this.state.items[this.state.openStory].stories[this.state.selectedStory].story_id} />
                                                    </li>
                                                    : null
                                            } 
                                            {
                                                this.props.pageData.appSettings[`${"story_comment"}`] == 1 ?
                                                    <li>
                                                        <span onClick={(e) => {
                                                            this.playPauseMedia = this.state.playPause
                                                            this.setState({localUpdate:true,openComment:true,playPause:false},() => {
                                                                this.pausePlayMedia(false)
                                                            })
                                                            
                                                        }} className="icon" title={this.props.t('Comments')}>
                                                            <span className="material-icons-outlined md-18" data-icon="comment"></span>
                                                            {" " + `${ShortNumber(this.state.items[this.state.openStory].stories[this.state.selectedStory].comment_count ? this.state.items[this.state.openStory].stories[this.state.selectedStory].comment_count : 0)}`}
                                                        </span>
                                                    </li>
                                                    : null
                                            }
                                            {
                                                this.state.items[this.state.openStory].stories[this.state.selectedStory].image ?
                                                    <SocialShare {...this.props} hideTitle={true} className="story_share" buttonHeightWidth="30" tags="" url={`/reel/${this.state.items[this.state.openStory].stories[this.state.selectedStory].story_id}`} title={this.state.items[this.state.openStory].stories[this.state.selectedStory].title} imageSuffix={this.props.pageData.imageSuffix} media={this.state.items[this.state.openStory].stories[this.state.selectedStory].image} />
                                                : null
                                            }
                                            </ul>
                                        </div>
                                    </React.Fragment>
                                    :
                                    <div className="reel-processing">
                                        <div className="storyText-innr">                                                
                                            <div className="textShow fontset description" style={{color: "#ffffff"}}>
                                            {
                                                this.state.items[this.state.openStory].stories[this.state.selectedStory].status == 2 ?
                                                    <h5>{this.props.t("Story is processing, please wait...")}</h5>
                                                    :
                                                    <h5>{this.props.t("Story failed processing, please upload new story.")}</h5>
                                            }
                                            </div>
                                        </div>
                                    </div>
                                    }
                                    {
                                        this.state.items[this.state.openStory].stories[this.state.selectedStory].status == 1 && this.state.items[this.state.openStory].stories[this.state.selectedStory].type == 3 ?
                                            <div className="storyText-Content">
                                                <div className="storyText-innr">
                                                    <div className="textShow fontset" style={{color: this.state.items[this.state.openStory].stories[this.state.selectedStory].text_color}}>
                                                        {
                                                            this.state.items[this.state.openStory].stories[this.state.selectedStory].description
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        : null
                                    }
                                    {
                                        this.state.items[this.state.openStory].stories[this.state.selectedStory].status == 1 && this.state.items[this.state.openStory].stories[this.state.selectedStory].seemore ? 
                                            <div className="storyBtmOverlay">
                                                <div className="storyLike-wrap">
                                                    <a className="storyMoreBtn" target="_blank" href={this.state.items[this.state.openStory].stories[this.state.selectedStory].seemore}>{this.props.t("See More")}</a>
                                                </div>
                                            </div>
                                    : null
                                    }
                                </div>
                                <div className="btn-slide">
                                    {
                                        this.showNextButton() ? 
                                            <div className="btn-mcircle-40 next" onClick={(e) => {
                                                    this.getNextStory();
                                                }}>
                                                <span className="material-icons">
                                                    arrow_forward_ios
                                                </span>
                                            </div>
                                        : null
                                    }
                                    {
                                        this.showPrevButton() ? 
                                            <div className="btn-mcircle-40 prev" onClick={(e) => {
                                                    this.getPreviousStory();
                                                }}>
                                                <span className="material-icons">
                                                    arrow_back_ios
                                                </span>
                                            </div>
                                        : null
                                    }
                                </div>
                                {/* <div className="storyComentLike-wrap">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <div className="storyComment-wrap">
                                            <div className="inputtxt flex-grow-1">
                                                <input type="text" placeholder="Reply..." />
                                            </div>
                                            <div className="actnBtn">
                                                <div className="iconemgSnd hidden">
                                                    <span className="material-icons">
                                                        insert_emoticon
                                                    </span>
                                                </div>
                                                <div className="iconemgSnd hidden">
                                                    <span className="material-icons">
                                                        send
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {
                        this.state.items[this.state.openStory].stories[this.state.selectedStory].status == 1 && this.props.pageData.loggedInUserDetails && this.state.items[this.state.openStory].owner_id == this.props.pageData.loggedInUserDetails.user_id ?
                            <div className="Story-rightSide">
                                <div className="viewStory-ourInnr">
                                    <div className="fullpag-rightbar-header"></div>
                                    <div className="title">{this.props.t("Story details")}</div>
                                    {
                                        !this.state.items[this.state.openStory].stories[this.state.selectedStory].viewers ?
                                            <div className={`loader`}>
                                                <div className="duo duo1">
                                                    <div className="dot dot-a"></div>
                                                    <div className="dot dot-b"></div>
                                                </div>
                                                <div className="duo duo2">
                                                    <div className="dot dot-a"></div>
                                                    <div className="dot dot-b"></div>
                                                </div>
                                            </div>
                                        :
                                        this.state.items[this.state.openStory].stories[this.state.selectedStory].viewers.length == 0 ?
                                            <React.Fragment>
                                                <div className="title d-flex align-items-center">
                                                    <span className="material-icons">
                                                        visibility_off
                                                    </span> {this.props.t("No viewers yet")}
                                                </div>
                                                <p className="ml-3 mr-3">{this.props.t("As people view your story, you'll see details here.")}</p>
                                            </React.Fragment>
                                    :
                                        <div className="storySeePeople-wrap sidebar-scroll" id="stories-users-scrollableDiv">
                                            <div className="storySeePeople-innr">
                                                <div className="story-users-list">
                                                <InfiniteScroll
                                                        dataLength={this.state.items[this.state.openStory].stories[this.state.selectedStory].viewers.length}
                                                        next={this.updateStoryViewer}
                                                        hasMore={!this.state.items[this.state.openStory].stories[this.state.selectedStory].viewersPagging}
                                                        loader={<LoadMore {...this.props} loading={this.state.loadingViewer} itemCount={this.state.items[this.state.openStory].stories[this.state.selectedStory].viewers.length} />}
                                                        endMessage={
                                                            <EndContent {...this.props} text={""} itemCount={this.state.items[this.state.openStory].stories[this.state.selectedStory].viewers.length} />
                                                        }
                                                        scrollableTarget="stories-users-scrollableDiv"
                                                        pullDownToRefresh={false}
                                                    >
                                                    {
                                                        this.state.items[this.state.openStory].stories[this.state.selectedStory].viewers.map((item,index) => {
                                                            return(
                                                                <Link key={index} href="/member" customParam={`id=${item.user_username}`} as={`/${item.user_username}`}>
                                                                    <a key={index} className="nameTitme" onClick={(e) => {
                                                                        $("body").removeClass("stories-open");
                                                                        this.props.closePopup(''); }}>
                                                                        <div className="story-media">
                                                                            <img src={this.props.pageData.imageSuffix+item.avtar} alt="" />
                                                                        </div>
                                                                        <div className="story-text">
                                                                            <div className="story-username"> 
                                                                                {item.user_displayname}
                                                                            </div>
                                                                            <p> 
                                                                                <span className="story-time"><Timeago {...this.props}>{item.creation_date}</Timeago></span> 
                                                                            </p>
                                                                        </div>
                                                                    </a>
                                                                </Link>
                                                            )
                                                        })
                                                    }
                                                    </InfiniteScroll>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        : null
                    }
                </div>
                {archiveStories}
            </React.Fragment>
        )
    }

}


export default Stories