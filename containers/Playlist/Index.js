import React from "react"
import axios from "../../axios-orders"
import { connect } from "react-redux";
import playlist from '../../store/actions/general';
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import VideoItem from "../Video/Item"
import TopView from "./TopView"
import Linkify from "react-linkify"
import Comment from "../Comments/Index"
import Link from "../../components/Link/index"
import Date from "../Date"
import dynamic from 'next/dynamic'
import swal from "sweetalert"
import Router from 'next/router';
import Translate from "../../components/Translate/Index";
import CensorWord from "../CensoredWords/Index"

import Rating from "../Rating/Index"
const CarouselPlaylists = dynamic(() => import("./CarouselPlaylist"), {
    ssr: false
});
import Plans from "../User/Plans"

 
class Playlist extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            page: 2,
            playlist: props.pageData.playlist,
            items: props.pageData.playlist && props.pageData.playlist.videos ? props.pageData.playlist.videos.results : null,
            pagging: props.pageData.playlist && props.pageData.playlist.videos ? props.pageData.playlist.videos.pagging : null,
            adult:props.pageData.adultPlaylist,
            relatedPlaylists:props.pageData.relatedPlaylists,
            needSubscription:props.pageData.needSubscription,
            plans:props.pageData.plans,
            tabType:props.pageData.tabType ? props.pageData.tabType : "videos"
        }
        this.refreshContent = this.refreshContent.bind(this)
        this.loadMoreContent = this.loadMoreContent.bind(this)
        this.deletePlaylist = this.deletePlaylist.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.pageData.playlist != prevState.playlist) {
            return {
                page:2, 
                playlist: nextProps.pageData.playlist, 
                items: nextProps.pageData.playlist && nextProps.pageData.playlist.videos ? nextProps.pageData.playlist.videos.results : null,
                pagging: nextProps.pageData.playlist && nextProps.pageData.playlist.videos? nextProps.pageData.playlist.videos.pagging : null,
                adult:nextProps.pageData.adultPlaylis,
                relatedPlaylists:nextProps.pageData.relatedPlaylists,
                needSubscription:nextProps.pageData.needSubscription,
                plans:nextProps.pageData.plans,
                tabType:nextProps.pageData.tabType ? nextProps.pageData.tabType : "videos"
            }
        } else{
            return null
        }
    }


    getItemIndex(item_id) {
        if(!this.state.items){
            return -1
        }
        const items = [...this.state.items];
        const itemIndex = items.findIndex(p => p["video_id"] == item_id);
        return itemIndex;
    }
    componentDidMount() {
        if($(".nav-tabs > li > a.active").length == 0){
            if(this.state.needSubscription){
                this.pushTab("plans")
            }else{
                this.pushTab("videos")
            }
        }
        if(this.state.needSubscription){
            return
        }
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = this.getItemIndex(id)
            if (this.state.playlist && itemIndex > -1 && type == "playlists") {
                const items = [...this.state.items]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, items: items })
            }
        });
        this.props.socket.on('videoPlaylistDeleted', data => {
            let id = data.video_id
            let playlist_id = data.playlist_id
            if(playlist_id == this.state.playlist.playlist_id){
                const itemIndex = this.getItemIndex(id)
                if (this.state.playlist && itemIndex > -1) {
                    const items = [...this.state.items]
                    items.splice(itemIndex, 1);
                    this.setState({localUpdate:true, items: items })
                }
            }
        });
        this.props.socket.on('removeScheduledVideo', data => {
            let id = data.id
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...this.state.items]
                const changedItem = {...items[itemIndex]}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.scheduled_video_id = null
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, items: items })
            }
        });
        this.props.socket.on('scheduledVideo', data => {
            let id = data.id
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...this.state.items]
                const changedItem = {...items[itemIndex]}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.scheduled_video_id = 1
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, items: items })
            }
        });
        this.props.socket.on('unwatchlater', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (this.state.playlist && itemIndex > -1) {
                const items = [...this.state.items]
                const changedItem = {...items[itemIndex]}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.watchlater_id = null
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, items: items })
            }
        });
        this.props.socket.on('watchlater', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (this.state.playlist && itemIndex > -1) {
                const items = [...this.state.items]
                const changedItem = {...items[itemIndex]}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.watchlater_id = 1
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, items: items })
            }
        });
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.playlist && type == "videos") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, items: items })
                }
            }
        }); 
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.playlist && type == "videos") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, items: items })
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
            if (this.state.playlist && itemType == "videos") {
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
    refreshContent() {
        this.setState({localUpdate:true, page: 1, items: [] })
        this.loadMoreContent()
    }
    loadMoreContent() {
        this.getContent()
    }
    loadMoreContent() {
        this.setState({localUpdate:true, loading: true })
        let formData = new FormData();
        formData.append('page', this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = "/playlist-view"
        formData.append("id", this.state.playlist.playlist_id)
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.items) {
                    let pagging = response.data.pagging
                    this.setState({localUpdate:true, page: this.state.page + 1, pagging: pagging, items: [...this.state.items, ...response.data.items], loading: false })
                } else {
                    this.setState({localUpdate:true, loading: false })
                }
            }).catch(err => {
                this.setState({localUpdate:true, loading: false })
            });

    }
    deletePlaylist = (e) => {
        e.preventDefault()
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: Translate(this.props, "Once deleted, you will not be able to recover this playlist!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', this.state.playlist.custom_url)
                    const url = "/playlists/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                            } else {
                                Router.push(`/dashboard?type=playlists`, `/dashboard/playlists`)
                            }
                        }).catch(err => {
                            swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    pushTab = (type) => {
        if(this.state.tabType == type || !this.state.playlist){
            return
        }
        this.setState({tabType:type,localUpdate:true})
        Router.push(`/playlist?id=${this.state.playlist.custom_url}`, `/playlist/${this.state.playlist.custom_url}?type=${type}`,{ shallow: true })
      }
    deleteVideo = (e,video_id) => {
        e.preventDefault()
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: Translate(this.props, "Are you sure want to delete this!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('video_id', video_id)
                    formData.append('id', this.state.playlist.custom_url)
                    const url = "/playlists/video-delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                            } else {
                                
                            }
                        }).catch(err => {
                            swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    render() {
        let deleteItem = null

        if(this.state.playlist.canDelete){
            deleteItem = this.deleteVideo
        }

        return (
            <React.Fragment>
                {
                    this.state.playlist && this.state.playlist.approve != 1 ? 
                        <div className="col-md-12  approval-pending">
                            <div className="generalErrors">
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    {Translate(this.props,'This playlist still waiting for admin approval.')}
                                </div>
                            </div>
                        </div>
                    : null
                }
                {
                    !this.state.adult ? 
                        <TopView {...this.props} deletePlaylist={this.deletePlaylist}  playlist={this.state.playlist} />
                    : null 
                }
                <div className="userDetailsWraps">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                            {
                                this.state.adult ?
                                    <div className="adult-wrapper">
                                        {Translate(this.props,'This playlist contains adult content.To view this playlist, Turn on adult content setting from site footer.')}
                                    </div>
                                :
                                <div className="details-tab">
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    {
                                        this.state.needSubscription ? 
                                        <li className="nav-item">
                                        <a className={`nav-link${this.state.tabType == "plans" ? " active" : ""}`} onClick={
                                            () => this.pushTab("plans")
                                        } data-bs-toggle="tab" href="#plans" role="tab" aria-controls="discription" aria-selected="false">{Translate(this.props,"Choose Plan")}</a>
                                        </li>
                                        : null
                                    }
                                    {
                                        !this.state.needSubscription ? 
                                        <li className="nav-item">
                                            <a className={`nav-link${this.state.tabType == "videos" ? " active" : ""}`} onClick={
                                            () => this.pushTab("videos")
                                        }  data-bs-toggle="tab" href="#videos" role="tab" aria-controls="videos" aria-selected="true">{Translate(this.props, "Videos")}</a>
                                        </li>
                                        : null
                                    }
                                        {
                                            this.props.pageData.appSettings[`${"playlist_comment"}`] == 1 && this.state.playlist.approve == 1 ?
                                                <li className="nav-item">
                                                    <a className={`nav-link${this.state.tabType == "comments" ? " active" : ""}`} onClick={
                                                            () => this.pushTab("comments")
                                                        }  data-bs-toggle="tab" href="#comments" role="tab" aria-controls="comments" aria-selected="true">{`${Translate(this.props,"Comments")}`}</a>
                                                </li>
                                                : null
                                        }
                                        <li className="nav-item">
                                            <a className={`nav-link${this.state.tabType == "about" ? " active" : ""}`} onClick={
                                                () => this.pushTab("about")
                                            }  data-bs-toggle="tab" href="#about" role="tab" aria-controls="about" aria-selected="true">{Translate(this.props, "About")}</a>
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
                                                <Plans {...this.props} userSubscription={this.state.needSubscription.loggedin_package_id ? true : false} userSubscriptionID={this.state.needSubscription.loggedin_package_id} itemObj={this.state.playlist} member={this.state.playlist.owner} user_id={this.state.playlist.owner_id} plans={this.state.plans} />
                                            </div>
                                            </div>
                                        : null
                                    }
                                    {
                                        !this.state.needSubscription ? 
                                        <div className={`tab-pane fade${this.state.tabType == "videos" ? " active show" : ""}`} id="videos" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <InfiniteScroll
                                                        dataLength={this.state.items.length}
                                                        next={this.loadMoreContent}
                                                        hasMore={this.state.pagging}
                                                        loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.items.length} />}
                                                        endMessage={
                                                            <EndContent {...this.props} text={Translate(this.props,'No video created in this playlist yet.')} itemCount={this.state.items.length} />
                                                        }
                                                        pullDownToRefresh={false}
                                                        pullDownToRefreshContent={<Release release={false} {...this.props} />}
                                                        releaseToRefreshContent={<Release release={true} {...this.props} />}
                                                        refreshFunction={this.refreshContent}
                                                    >
                                                        <div className="gridContainer gridVideo">
                                                            {
                                                                this.state.items.map(video => {
                                                                    return (
                                                                        <div key={video.video_id} className="gridColumn">
                                                                            <VideoItem deletePlaytistVideo={deleteItem}  playlist_id={this.state.playlist.custom_url} {...this.props} video={video} {...video} />
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </InfiniteScroll>
                                                </div>
                                            </div>
                                       : null
                                    }
                                       <div className={`tab-pane fade${this.state.tabType == "about" ? " active show" : ""}`} id="about" role="tabpanel">
                                                <div className="details-tab-box">
                                                {
                                                    this.props.pageData.appSettings[`${"playlist_rating"}`] == 1 && this.state.playlist.approve == 1 ?
                                                    <React.Fragment>
                                                        <div className="tabInTitle">
                                                            <h6>{Translate(this.props, "Rating")}</h6>
                                                            <div className="rating">
                                                                <div className="animated-rater rating">
                                                                    <Rating {...this.props} rating={this.state.playlist.rating} type="playlist" id={this.state.playlist.playlist_id} />
                                                                </div>                                                                        
                                                            </div>
                                                        </div>
                                                        
                                                    </React.Fragment>
                                                        : null
                                                    }
                                                    <React.Fragment>
                                                        <div className="tabInTitle">
                                                            <h6>{Translate(this.props, "Owner")}</h6>
                                                            <div className="owner_name">
                                                                <Link href="/member" customParam={`id=${this.state.playlist.owner.username}`} as={`/${this.state.playlist.owner.username}`}>
                                                                    <a className="name">
                                                                        <React.Fragment>
                                                                            {this.state.playlist.owner.displayname}
                                                                            {
                                                                                this.props.pageData.appSettings['member_verification'] == 1 &&  this.state.playlist.owner.verified ?
                                                                                    <span className="verifiedUser" title={Translate(this.props, "verified")}><span className="material-icons" data-icon="check"></span></span>
                                                                                    : null
                                                                            }
                                                                        </React.Fragment>
                                                                    </a>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        
                                                    </React.Fragment>
                                                    <React.Fragment>
                                                        <div className="tabInTitle">
                                                            <h6>{Translate(this.props, "Created On")}</h6>
                                                            <div className="creation_date">
                                                                {
                                                                    <span dangerouslySetInnerHTML={{__html:Date(this.props,this.state.playlist.creation_date,this.props.initialLanguage,'dddd, MMMM Do YYYY',this.props.pageData.defaultTimezone)}}></span>
                                                                }
                                                            </div>
                                                        </div>
                                                        
                                                    </React.Fragment>
                                                    {
                                                        this.state.playlist.description ?
                                                            <React.Fragment>
                                                                <div className="tabInTitle">
                                                                    <h6>{Translate(this.props, "Description")}</h6>
                                                                    <div className="channel_description">
                                                                        <Linkify properties={{ target: '_blank' }}>{CensorWord("fn",this.props,this.state.playlist.description)}</Linkify>
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                            : null
                                                    }
                                                </div>
                                            </div>                                        
                                        {
                                            this.props.pageData.appSettings[`${"playlist_comment"}`] == 1 && this.state.playlist.approve == 1 ?
                                                <div className={`tab-pane fade${this.state.tabType == "comments" ? " active show" : ""}`} id="comments" role="tabpanel">
                                                    <div className="details-tab-box">
                                                        <Comment  {...this.props}  owner_id={this.state.playlist.owner_id} hideTitle={true} appSettings={this.props.pageData.appSettings} commentType="playlist" type="playlists" comment_item_id={this.state.playlist.playlist_id} />
                                                    </div>
                                                </div>
                                            : null
                                        }
                                    </div>
                                </div>
                            }
                            </div>
                        </div>
                    </div>
                </div>
                {
                  this.state.relatedPlaylists && this.state.relatedPlaylists.length ?
                  <React.Fragment>
                    <div className="container"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                    <CarouselPlaylists {...this.props}  {...this.props} carouselType="playlist" playlists={this.state.relatedPlaylists} />
                    </React.Fragment>
                    : null
              }
            </React.Fragment>
        )
    }
}


const mapDispatchToProps = dispatch => {
    return {
        openPlaylist: (open, video_id) => dispatch(playlist.openPlaylist(open, video_id)),
    };
};
export default connect(null, mapDispatchToProps)(Playlist)