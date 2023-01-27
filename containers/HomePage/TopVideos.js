import React from "react"
import Item from "../Video/Item"
import Link from "../../components/Link/index"
import Translate from "../../components/Translate/Index"
import dynamic from 'next/dynamic'
const Carousel = dynamic(() => import("../Slider/Index"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="heading shimmer"></div>
        <div className="grid">
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
        </div>
    </div>
});
class TopVideos extends React.Component {
    constructor(props){
        super(props)
        let propsData = {...props}
        this.state = {
            videos:props.videos,
            language:propsData.i18n.language
        }
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if(nextProps.videos != prevState.videos || nextProps.i18n.language != prevState.language){
            return {videos:nextProps.videos,language:nextProps.i18n.language}
        } else{
            return null
        }
    }
    componentDidMount(){
        this.props.socket.on('removeScheduledVideo', data => {
            let id = data.id
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...this.state.videos]
                const changedItem = {...items[itemIndex]}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.scheduled_video_id = null
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, videos: items })
            }
        });
        this.props.socket.on('scheduledVideo', data => {
            let id = data.id
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...this.state.videos]
                const changedItem = {...items[itemIndex]}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.scheduled_video_id = 1
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, videos: items })
            }
        });
        this.props.socket.on('videoDeleted',data => {
            let id = data.video_id
            const itemIndex = this.getItemIndex(id)
            if(itemIndex > -1){
                const items = [...this.state.videos]
                items.splice(itemIndex, 1);
                this.setState({localUpdate:true,videos:items})
            }
        });
        this.props.socket.on('unwatchlater',data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if(itemIndex > -1){
                const items = [...this.state.videos]
                const changedItem = {...items[itemIndex]}
                if(this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                    changedItem.watchlater_id = null
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true,videos:items})
            }
        });
        this.props.socket.on('watchlater',data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if(itemIndex > -1){
                const items = [...this.state.videos]
                const changedItem = {...items[itemIndex]}
                if(this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                    changedItem.watchlater_id = 1
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true,videos:items})
            }
        });
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1 && type == "videos") {
                const items = [...this.state.videos]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, videos: items })
            }
        });

        this.props.socket.on('unfavouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "videos"){
                const itemIndex = this.getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...this.state.videos]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if(this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true,videos:items})
                }
            }
        });
        this.props.socket.on('favouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "videos"){
                const itemIndex = this.getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...this.state.videos]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if(this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true,videos:items})
                }
            }
        });


        this.props.socket.on('likeDislike',data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId =  data.ownerId
            let removeLike  = data.removeLike
            let removeDislike  = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike =  data.insertDislike
            if(itemType == "videos"){
                const itemIndex = this.getItemIndex(itemId)
                if(itemIndex > -1){
                    const items = [...this.state.videos]
                    const changedItem = {...items[itemIndex]}
                    let loggedInUserDetails = {}
                    if(this.props.pageData && this.props.pageData.loggedInUserDetails){
                        loggedInUserDetails = this.props.pageData.loggedInUserDetails
                    }
                    if(removeLike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['like_count'] = parseInt(changedItem['like_count']) - 1
                    }
                    if(removeDislike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) - 1
                    }
                    if(insertLike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "like"
                        changedItem['like_count'] = parseInt(changedItem['like_count']) + 1
                    }
                    if(insertDislike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "dislike"
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) + 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true,videos:items})
                }
            }
        });
    }
    getItemIndex(item_id){
        if(this.state.videos){
            const videos = [...this.state.videos];
            const itemIndex = videos.findIndex(p => p["video_id"] == item_id);
            return itemIndex;
        }
        return -1;
    }
    
    render(){
        
        const content = this.state.videos.map(video => {
                return (
                    this.props.pageData.appSettings['video_carousel_home'] == 1 ?
                        <Item key={video.video_id} openPlaylist={this.props.openPlaylist} {...this.props} {...video} video={video} />
                    :
                        <div key={video.video_id} className="gridColumn">
                            <Item openPlaylist={this.props.openPlaylist} {...this.props} {...video} video={video} />
                        </div>
                )
            })
        

        return (
            <div className="VideoRoWrap">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="titleWrap">
                            {
                                this.props.pageData.themeType == 2 && this.props.seemore?
                                    <Link href={`/videos?${this.props.subType ? this.props.subType : (this.props.type ? "type" : "sort")}=${this.props.type ? this.props.type : this.props.sort}`}>
                                        <a className="link">
                                            <span className="title">
                                                <React.Fragment>
                                                    {
                                                        this.props.headerTitle ? 
                                                            this.props.headerTitle : 
                                                            null
                                                    }
                                                    {Translate(this.props,this.props.title)}
                                                </React.Fragment>
                                            </span>
                                        </a>
                                    </Link>
                                :
                                <span className="title">
                                    <React.Fragment>
                                        {
                                            this.props.headerTitle ? 
                                                this.props.headerTitle : 
                                                null
                                        }
                                        {Translate(this.props,this.props.title)}
                                    </React.Fragment>
                                    </span>
                            }
                                {
                                    this.props.seemore && this.state.videos.length > 3 ? 
                                    <Link href={`/videos?${this.props.subType ? this.props.subType : (this.props.type ? "type" : "sort")}=${this.props.type ? this.props.type : this.props.sort}`}>
                                        <a className="seemore_link">
                                            {Translate(this.props,"See more")}
                                        </a>
                                    </Link>
                                    : null
                                }
                                
                              
                            </div>
                        </div>
                    </div>
                    {
                        this.props.pageData.appSettings['video_carousel_home'] == 1 ?
                            <Carousel {...this.props} carouselType="video" items={content} itemAt1024={5} itemAt1200={5} itemAt900={4} itemAt600={2} itemAt480={1} >
                                {content}
                            </Carousel>
                        :
                            <div className="gridContainer gridVideo">
                                {content}
                            </div>
                    }
                    </div>
            </div>
        )
        
    }
}




export default TopVideos