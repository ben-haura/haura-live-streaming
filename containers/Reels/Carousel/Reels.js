import React from 'react';
import swal from "sweetalert"
import ShortNumber from "short-number"
import dynamic from 'next/dynamic'
import axios from "../../../axios-orders"
import Timeago from "../../Common/Timeago"
import Link from '../../../components/Link/index';
import Router from 'next/router';
import FixedMenu from "../../Menu/Fixed"
import Subscribe from "../../User/Follow"
import Like from "../../Like/Index"
import Dislike from "../../Dislike/Index"
import SocialShare from "../../SocialShare/Index"

const Comment = dynamic(() => import("../../../containers/Comments/Index"), {
    ssr: false,
});
class Reels extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            items:props.pageData.reels,
            pagging:props.pageData.pagging,
            openReel:0,
            timer:0,
            muted:false,
            playPause:true,
            showMenu:false,
        }
       this.timerId = null;
       this.getNextReel = this.getNextReel.bind(this)
       this.closeMenu = this.closeMenu.bind(this)
       this.showMenu = this.showMenu.bind(this)
       this.playMediaElement = this.playMediaElement.bind(this)
       this.videoElement = React.createRef();
       this.dropdownMenu = React.createRef();
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if(nextProps.pageData.reels && nextProps.pageData.reels != prevState.reels){
            let items = nextProps.pageData.reels
            let nextP = {...nextProps}
            return {
                ...prevState,
                items:items,
                pagging:nextP.pageData.pagging,
                timer:0
            }
        } else{
            return null;
        }
    }
    
    
    

    componentDidMount(){        
        //check first item in selected story
        this.playMediaElement();
        $("body").addClass("stories-open");
        if(this.videoElement.current)
        this.videoElement.current.muted = false;

        this.props.socket.on('reelsCreated', data => {
            let id = data.id;
            if (this.state.items[this.state.openReel] && this.state.items[this.state.openReel].reel_id == id) {
                Router.push(`/reel?id=${id}`, `/reel/${id}`)
            }
        });

        this.props.socket.on('unfollowUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            let changed = false;
            if (type == "members") {
                let items = [...this.state.items]
                for(let i=0;i<items.length;i++){
                    if(id == items[i].owner_id ){
                        if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                            changed = true;
                            items[i].follower_id = null
                        }
                    }
                }
                if(changed)
                    this.setState({localUpdate:true, items: items })
            }
        });
        this.props.socket.on('followUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            let changed = false;
            if (type == "members") {
                let items = [...this.state.items]
                for(let i=0;i<items.length;i++){
                    if(id == items[i].owner_id ){
                        if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                            changed = true;
                            items[i].follower_id = 1
                        }
                    }
                }
                if(changed)
                    this.setState({localUpdate:true, items: items })
            }
        });

        this.props.socket.on('reelDeleted', data => {
            let id = data.reel_id
            let itemIndex = this.getItemIndex(id);
            if(itemIndex > -1){
                let items = [...this.state.items]
                items.splice(itemIndex, 1);

                //open reel
                let openReel = this.state.openReel
                if(this.state.openReel > items.length){
                    openReel = 0;
                }
                if(items.length == 0){
                    // close and redirect to home
                    Router.push("/","/")
                }
                this.setState({localUpdate:true, items: items,openReel:openReel })
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
            if (itemType == "reels") {
                const itemIndex = this.getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...this.state.items]
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
                    this.setState({localUpdate:true, items: items })
                }
            }
        });
    }
    getItemIndex(item_id) {
        const items = [...this.state.items];
        const itemIndex = items.findIndex(p => p["reel_id"] == item_id);
        return itemIndex;
    }
   
    
    loadMoreContent() {
        if(this.state.fetchingData){
            return;
        }
        this.setState({localUpdate:true,fetchingData:true});
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let ids = []
        //get current reels
        this.state.items.forEach(reel => {
            ids.push(reel.reel_id)
        })
        formData.append('ids',ids)
        if(this.props.pageData.member_user_id)
        formData.append('user_id',this.props.pageData.member_user_id)
        let url = '/reels/get-reels';
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                //silent
            }else{
                if(response.data.reels){
                    this.setState({localUpdate:true,fetchingData:false,items:[...this.state.items,...response.data.reels],pagging:response.data.pagging})
                }
            }
        }).catch(err => {
            //silent
        });
    }
    playMediaElement(){
        if(!this.state.items[this.state.openReel]){
            return;
        }
        clearInterval(this.timerId)
        if(this.videoElement.current){
            this.videoElement.current.currentTime = 0
            this.videoElement.current.play();
            this.videoElement.current.load();
            this.videoElement.current.addEventListener('timeupdate', this.updateTimerMedia);
        }
        
    }
   
    
    updateTimerMedia = () => {
        let progress = 0
        if(this.videoElement.current){
            progress = (this.videoElement.current.currentTime / this.videoElement.current.duration) * 100;
        }
        this.setState({
            localUpdate:true, timer: progress
        })
    }
    componentWillUnmount(){
        $("body").removeClass("stories-open");
        if(this.timerId)
            clearInterval(this.timerId);
        this.removeVideoRefs();
    }
    showNextButton = () => {
        var isValid = false;
        let stories = this.state.items
        if(this.state.openReel < stories.length - 1){
            isValid = true;
        }
        return isValid;
    }
    getNextReel = () => {
        var _ = this
        let stories = _.state.items
        this.removeVideoRefs();

        if(this.state.items.length > 4 && _.state.openReel < this.state.items.length - 4 && this.state.pagging)
            this.loadMoreContent()

        if(_.state.openReel < stories.length - 1){
            if(this.timerId)
                clearInterval(this.timerId)
            _.videoElement.current.currentTime = 0
            _.setState({localUpdate:true,openReel:_.state.openReel+1,timer:0,playPause:true},() => {
                _.playMediaElement()
            });
        }
    }
    showPrevButton = () => {
        var isValid = false;
        if(this.state.openReel != 0){
            isValid = true;
        }else{
            if(this.state.openReel != 0){
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
        if(_.state.openReel != 0){
            if(this.timerId)
                clearInterval(this.timerId)
            _.videoElement.current.currentTime = 0
            _.setState({localUpdate:true,openReel:_.state.openReel-1,timer:0,playPause:true},() => {
                _.playMediaElement()
            });
        }
    }
    removeVideoRefs = () => {
        if(this.videoElement.current){
            this.videoElement.current.pause()
            this.videoElement.current.removeEventListener('timeupdate', this.updateTimerMedia);
            this.videoElement.current.removeEventListener('ended', this.getNextReel);
        }
    }
    
    
    mutedMedia = (type) => {
        if(type)
            this.videoElement.current.muted = true;
        else
            this.videoElement.current.muted = false;
        
    }
    pausePlayMedia = (type) => {
        if(type)
            this.videoElement.current.play()
        else
            this.videoElement.current.pause()
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

    editReel = (id) => {
        
        Router.push(`/create-reel?id=${id}`,"create-reel/"+id);
    }
    
    deleteReel = (id) => {
        swal({
            title: this.props.t("Delete Reel?"),
            text: this.props.t("Are you sure want to delete this reel?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    this.setState({timer: 0,localUpdate:true},()=>{
                        this.removeVideoRefs();
                        if(this.timerId)
                            clearInterval(this.timerId)
                        if(this.videoElement.current)
                            this.videoElement.current.currentTime = 0
                       
                        if(this.playPauseMedia){
                            setTimeout(() =>{
                                this.playMediaElement();
                            },100);
                        }
                        const config = {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            }
                        };
                        let formData = new FormData();
                        let url = '/reels/delete/'+id;
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
                
        if(!this.state.items[this.state.openReel]){
            return null;
        }

        let image = null;
        image =  this.state.items[this.state.openReel].image
        
 
        
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
                                this.setState({localUpdate:true,openComment:false});
                            }} className="_close"><i></i></a>
                        </div>
                        <div className="reel_comment">
                            <div className="row">
                                <Comment  {...this.props}  owner_id={this.state.items[this.state.openReel].owner_id} hideTitle={true} appSettings={this.props.pageData.appSettings} commentType="reel" type="reels" comment_item_id={this.state.items[this.state.openReel].reel_id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            
        }

        return ( 
            <React.Fragment> 
                {
                    comment
                }
                <div className={`story-details stories-view reel-view`}>
                    <div className='popupHeader reel-header'>
                        <div className='HeaderCloseLogo'>
                        <a className='closeBtn' href="#" onClick={(e) => {
                        e.preventDefault();
                        if(this.props.pageData.member_user_id)
                            Router.push(`/member?id=${this.props.pageData.member_username}`,`/${this.props.pageData.member_username}`)
                        else
                            Router.push(`/`,`/`)
                    }}><span className="material-icons">close</span></a>
                            <div className='HeaderCloseLogo-logo'>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    if(this.props.pageData.member_user_id)
                                        Router.push(`/member?id=${this.props.pageData.member_username}`,`/${this.props.pageData.member_username}`)
                                    else
                                        Router.push(`/`,`/`)
                                }}>
                                    <img src={logo} className="img-fluid" />
                                </a>
                            </div>
                        </div>
                    </div>                
                   
                    <div className="story-content position-relative">
                        {
                            this.props.layout !="mobile" ?
                                this.props.pageData.appSettings["fixed_header"] == 1 ?
                                    <FixedMenu {...this.props} />
                                : null
                            : null
                        }
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
                                        
                                        <div className="storyDetails-userName">
                                            <Link href="/member" customParam={`id=${this.state.items[this.state.openReel].user_username}`} as={`/${this.state.items[this.state.openReel].user_username}`}>
                                                <a className="nameTitme" onClick={(e) => {
                                                }}>
                                                    <div className="img">
                                                        <img className="avatar-40 rounded-circle" src={
                                                            this.props.pageData.imageSuffix+this.state.items[this.state.openReel].avtar
                                                        } alt="" />
                                                    </div>
                                                    <div className="nameTime">
                                                        <span className="name">{this.state.items[this.state.openReel].user_displayname}</span>
                                                        {
                                                            this.props.pageData.appSettings['users_follow'] == 1 && (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id != this.state.items[this.state.openReel].owner_id) ? 
                                                                <React.Fragment>
                                                                    <span>
                                                                        <span>&nbsp;</span>
                                                                        <span>·</span>
                                                                        <span>&nbsp;</span>
                                                                    </span>
                                                                    <Subscribe  {...this.props} nolink={true} className="follwbtn" type="members" user={{follower_id:this.state.items[this.state.openReel].follower_id, user_id:this.state.items[this.state.openReel].owner_id}} user_id={this.state.items[this.state.openReel].owner_id} />
                                                                </React.Fragment> 
                                                                
                                                            : null
                                                        }
                                                        <div className="time">
                                                            <Timeago {...this.props}>{this.state.items[this.state.openReel].creation_date}</Timeago>
                                                        </div>
                                                    </div>
                                                </a>
                                            </Link>
                                            {
                                                this.state.items[this.state.openReel].video_location ?
                                            <div className="optionStoryslid">
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
                                                
                                                {
                                                    this.props.pageData.loggedInUserDetails && (this.state.items[this.state.openReel].canEdit || this.state.items[this.state.openReel].canDelete) ? 
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
                                                                    this.state.items[this.state.openReel].canEdit ?
                                                                    <li>
                                                                        <a className="edit-stories" href="#" onClick={(e)=>{
                                                                            e.preventDefault();
                                                                            this.editReel(this.state.items[this.state.openReel].reel_id);
                                                                        }}>
                                                                            <span className="material-icons" data-icon="edit"></span>
                                                                            {this.props.t("Edit")}
                                                                        </a>
                                                                    </li>
                                                                : null
                                                                }
                                                                {
                                                                    this.state.items[this.state.openReel].canDelete ?
                                                                    <li>
                                                                        <a className="delete-stories" href="#" onClick={(e)=>{
                                                                            e.preventDefault();
                                                                            this.deleteReel(this.state.items[this.state.openReel].reel_id);
                                                                        }}>
                                                                            <span className="material-icons" data-icon="delete"></span>
                                                                            {this.props.t("Delete")}
                                                                        </a>
                                                                    </li>
                                                                : null
                                                                }
                                                            </ul>
                                                        </div>
                                                    : null
                                                    }
                                            </div>
                                            :null
                                            }
                                        </div>
                                        
                                    </div>
                                   
                                    {
                                        this.state.items[this.state.openReel].video_location ?
                                    <React.Fragment>
                                        <div className="imageBox">                                        
                                            {
                                                <React.Fragment>
                                                    <video autoPlay={true} muted ref={this.videoElement} loop playsInline={true} style={{
                                                    }}>
                                                        {
                                                            <source src={this.props.pageData.imageSuffix+this.state.items[this.state.openReel].video_location} type="video/mp4"/>
                                                        }
                                                    </video>
                                                </React.Fragment>
                                            }
                                        
                                        </div>
                                        {
                                            this.state.items[this.state.openReel].title || this.state.items[this.state.openReel].description ?
                                                <div className="storyText-Content">
                                                    <div className="storyText-innr">
                                                        {
                                                            this.state.items[this.state.openReel].title ? 
                                                        <div className="textShow fontset" style={{color: "#ffffff"}}>
                                                            {
                                                                this.state.items[this.state.openReel].title
                                                            }
                                                        </div>
                                                        : null
                                                        }
                                                        {
                                                            this.state.items[this.state.openReel].description ? 
                                                        <div className="textShow fontset description" style={{color: "#ffffff"}}>
                                                            {
                                                                this.state.items[this.state.openReel].description
                                                            }
                                                        </div>
                                                        : null
                                                        }
                                                    </div>
                                                </div>
                                            : null
                                        } 
                                        <div className="reels-user-content">
                                            <ul>
                                            {
                                                this.props.pageData.appSettings[`${"reel_like"}`] == 1 ?
                                                    <li>
                                                        <Like {...this.props} icon={true} like_count={this.state.items[this.state.openReel].like_count} item={this.state.items[this.state.openReel]} type={"reel"} id={this.state.items[this.state.openReel].reel_id} />
                                                    </li>
                                                    : null
                                            }
                                            {
                                                this.props.pageData.appSettings[`${"reel_dislike"}`] == 1 ?
                                                    <li>
                                                        <Dislike {...this.props} icon={true} dislike_count={this.state.items[this.state.openReel].dislike_count} item={this.state.items[this.state.openReel]} type={"reel"} id={this.state.items[this.state.openReel].reel_id} />
                                                    </li>
                                                    : null
                                            } 
                                            {
                                                this.props.pageData.appSettings[`${"reel_comment"}`] == 1 ?
                                                    <li>
                                                        <span onClick={(e) => {
                                                            this.setState({localUpdate:true,openComment:true})
                                                        }} className="icon" title={this.props.t('Comments')}>
                                                            <span className="material-icons-outlined md-18" data-icon="comment"></span>
                                                            {" " + `${ShortNumber(this.state.items[this.state.openReel].comment_count ? this.state.items[this.state.openReel].comment_count : 0)}`}
                                                        </span>
                                                    </li>
                                                    : null
                                            }
                                                <li>
                                                    <span onClick={(e) => {
                                                        
                                                    }} className="icon" title={this.props.t('Views')}>
                                                        <span className="material-icons-outlined md-18" data-icon="visibility"></span>
                                                        {" " + `${ShortNumber(this.state.items[this.state.openReel].view_count ? this.state.items[this.state.openReel].view_count : 0)}`}
                                                    </span>
                                                </li>
                                                {
                                                    <SocialShare {...this.props} hideTitle={true} className="reel_share" buttonHeightWidth="30" tags="" url={`/reel/${this.state.items[this.state.openReel].reel_id}`} title={this.state.items[this.state.openReel].title} imageSuffix={this.props.pageData.imageSuffix} media={this.state.items[this.state.openReel].image} />
                                                }
                                            </ul>
                                        </div>
                                    </React.Fragment>
                                        : 
                                        <div className="reel-processing">
                                            <div className="storyText-innr">                                                
                                                <div className="textShow fontset description" style={{color: "#ffffff"}}>
                                                {
                                                    this.state.items[this.state.openReel].status == 2 ?
                                                        <h5>{this.props.t("Reel is processing, please wait...")}</h5>
                                                        :
                                                        <h5>{this.props.t("Reel failed processing, please upload new reel.")}</h5>
                                                }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {
                                    this.state.items[this.state.openReel].video_location ?
                                <div className="btn-slide">
                                    {
                                        this.showNextButton() ? 
                                            <div className="btn-mcircle-40 next" onClick={(e) => {
                                                    this.getNextReel();
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
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }

}


export default Reels