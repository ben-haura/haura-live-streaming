import React from "react"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Item from "./CastItem"
import Translate from "../../components/Translate/Index"

class  Cast extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            cast:props.cast,
            movie:props.movie,
            pagging:false
        }
        this.refreshContent = this.refreshContent.bind(this)
        this.loadMoreContent = this.loadMoreContent.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.movie && nextProps.movie != prevState.movie) {
            return { movie: nextProps.movie, page: 2,cast:nextProps.cast,pagging:false }
        } else{
            return null
        }
    }
    getItemIndex(item_id){
        if(this.state.cast){
            const artists = [...this.state.cast];
            const itemIndex = artists.findIndex(p => p["cast_crew_member_id"] == item_id);
            return itemIndex;
        }else{
            return -1;
        }
    }
    componentDidMount(){
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1 && type == "cast_crew_members") {
                const items = [...this.state.cast]
                const changedItem = items[itemIndex]
                changedItem.rating = rating
                this.setState({localUpdate:true, cast: items })
            }
        });
        this.props.socket.on('unfavouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "cast_crew_members"){
                const itemIndex = this.getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...this.state.cast]
                    const changedItem = items[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if(this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = null
                    }
                    this.setState({localUpdate:true,cast:items})
                }
            }
        });
        this.props.socket.on('favouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "cast_crew_members"){
                const itemIndex = this.getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...this.state.cast]
                    const changedItem = items[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if(this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = 1
                    }
                    this.setState({localUpdate:true,cast:items})
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
            if(itemType == "cast_crew_members"){
                const itemIndex = this.getItemIndex(itemId)
                if(itemIndex > -1){
                    const items = [...this.state.cast]
                    const changedItem = items[itemIndex]
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
                    this.setState({localUpdate:true,cast:items})
                }
            }
        });
    }
    refreshContent(){
        this.setState({localUpdate:true,page:1,cast:[]})
        this.loadMoreContent()
    }
    loadMoreContent(){
        this.getContent()
    }
    // eslint-disable-next-line no-dupe-class-members
    loadMoreContent(){
        this.setState({localUpdate:true,loading:true})
        let formData = new FormData();        
        formData.append('page',this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = "/videos/artists"
        if(this.props.channel_id){
            formData.append('channel_id',this.props.channel_id)
            url = `/channels/artists`;
        }else{
            formData.append('video_id',this.props.video_id)
        }
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.artists){
                let pagging = response.data.pagging
                this.setState({localUpdate:true,page:this.state.page+1,pagging:pagging,artists:[...this.state.artists,...response.data.artists],loading:false})
            }else{
                this.setState({localUpdate:true,loading:false})
            }
        }).catch(err => {
            this.setState({localUpdate:true,loading:false})
        });
    }
    render(){
        
        return (
            <InfiniteScroll
                dataLength={this.state.cast.length}
                next={this.loadMoreContent}
                hasMore={this.state.pagging}
                loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.cast.length} />}
                endMessage={
                    <EndContent {...this.props} text={Translate(this.props,"No cast found for this item.")} itemCount={this.state.cast.length} />
                }
                pullDownToRefresh={false}
                pullDownToRefreshContent={<Release release={false} {...this.props} />}
                releaseToRefreshContent={<Release release={true} {...this.props} />}
                refreshFunction={this.refreshContent}
            >
                <div className="gridContainer gridCast">
                {
                    this.state.cast.map(cast => {
                        return (
                            <div key={cast.cast_crew_id} className='gridColumn'>
                                <Item {...this.props} cast={cast} {...cast}  />
                            </div>
                        )
                    })
                }
                </div>                    
            </InfiniteScroll>
        )
    }
} 


  
export default Cast