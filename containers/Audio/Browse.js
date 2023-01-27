import React from "react"
import { connect } from "react-redux";
import Translate from "../../components/Translate/Index";
import Audio from "./Item"
import playlist from '../../store/actions/general';
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Search from "../Search/Index"
import axios from "../../axios-orders"
import dynamic from 'next/dynamic'
import Router from 'next/router';
class Browse extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            page: 2,
            audios: props.pageData.audios ? props.pageData.audios : props.audios,
            pagging: props.pageData.pagging ? props.pageData.pagging : props.pagging,
            search:props.pageData.search,
            updateComponent:props.updateComponent
        }
        this.pauseSong = this.pauseSong.bind(this)
        this.playSong = this.playSong.bind(this)
        //this.playPauseSong = this.playPauseSong.bind(this)
        this.loadMoreContent = this.loadMoreContent.bind(this)
        this.refreshContent = this.refreshContent.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.pageData.filter && nextProps.pageData.filter != prevState.filter) {
            return {
                page:2, 
                audios: nextProps.pageData.audios ? nextProps.pageData.audios : nextProps.audios, 
                pagging: nextProps.pageData.pagging ? nextProps.pageData.pagging : nextProps.pagging,
                filter:nextProps.pageData.filter
            }
        }else if (nextProps.pageData.search != prevState.search) {
            return {
                page:2, 
                audios: nextProps.pageData.audios ? nextProps.pageData.audios : nextProps.audios, 
                pagging: nextProps.pageData.pagging ? nextProps.pageData.pagging : nextProps.pagging,
                search:nextProps.pageData.search
            }
        }if (nextProps.audios && nextProps.audios != prevState.audios) {
            return {
                page:2, 
                audios: nextProps.pageData.audios ? nextProps.pageData.audios : nextProps.audios, 
                pagging: nextProps.pageData.pagging ? nextProps.pageData.pagging : nextProps.pagging,
                search:nextProps.pageData.search
            }
        }else{
            return null
        }
    }


    getItemIndex(item_id) {
        if(!this.state.audios){
            return -1
        }
        const items = [...this.state.audios];
        const itemIndex = items.findIndex(p => p["audio_id"] == item_id);
        return itemIndex;
    }
    playSong = (song_id,audio,e) =>{
        if(!audio.audio_file){
            Router.push(`/audio?id=${audio.custom_url}`, `/audio/${audio.custom_url}`)
            return;
        }
        let audios = [...this.state.audios]
        audios.forEach( (audio, itemIndex) => {
            if(!audio.audio_file){
                audios.splice(itemIndex, 1);
            }
        });
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
        let audios = [...this.state.audios]
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
        let audios = [...this.state.audios]
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
    
    componentDidMount() {
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = this.getItemIndex(id)
            if (this.state.audios && itemIndex > -1 && type == "audio") {
                const items = [...this.state.audios]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                if(this.props.updateParentItems)
                    this.props.updateParentItems("audio",null,items);
                this.setState({localUpdate:true, audios: items })
            }
        });
        this.props.socket.on('audioDeleted', data => {
            let id = data.audio_id
            const itemIndex = this.getItemIndex(id)
            if (this.state.audios && itemIndex > -1) {
                const items = [...this.state.audios]
                items.splice(itemIndex, 1);
                if(this.props.updateParentItems)
                    this.props.updateParentItems("audio",null,items);
                this.setState({localUpdate:true, audios: items })
            }
        });
       
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.audios && type == "audio") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.audios]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    if(this.props.updateParentItems)
                    this.props.updateParentItems("audio",null,items);
                    this.setState({localUpdate:true, audios: items })
                }
            }
        }); 
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.audios && type == "audio") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.audios]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    if(this.props.updateParentItems)
                    this.props.updateParentItems("audio",null,items);
                    this.setState({localUpdate:true, audios: items })
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
            if (this.state.audios && itemType == "audio") {
                const itemIndex = this.getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...this.state.audios]
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
                    if(this.props.updateParentItems)
                    this.props.updateParentItems("audio",null,items);
                    this.setState({localUpdate:true, audios: items })
                }
            }
        });
    }
    draw (peaks) {
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#333333';
        peaks.forEach((peak) => {
          ctx.fillRect(...peak)
        });
      }
      refreshContent(){
        this.setState({localUpdate:true,page:1,audios:[]})
        this.loadMoreContent()
    }
    searchResults(values){
        this.setState({localUpdate:true,page:1})
        this.loadMoreContent(values)
    }
    loadMoreContent(values){
        this.setState({localUpdate:true,loading:true})
        let formData = new FormData();        
        formData.append('page',this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        let url = `/audio/browse`;
        if(this.props.userowner_id){
            formData.append("owner_id",this.props.userowner_id)
        }
        let queryString = ""
        if(this.props.contentType){
            let queryUser = ""
            if(this.props.userContent){
                queryUser = "?user="+this.props.userContent
            }
            url = `/dashboard/audio/${this.props.contentType}${queryUser}`;
            
        }else if(this.props.pageData.search){
            queryString = Object.keys(this.props.pageData.search).map(key => key + '=' + this.props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        }
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.audios){
                let pagging = response.data.pagging
                this.setState({localUpdate:true,page:this.state.page+1,pagging:pagging,audios:[...this.state.audios,...response.data.audios],loading:false})
            }else{
                this.setState({localUpdate:true,loading:false})
            }
        }).catch(err => {
            this.setState({localUpdate:true,loading:false})
        });
    } 
    render() {
        let items = this.state.audios.map(item => {
            return <div key={item.audio_id} className="item gridColumn"><Audio {...this.props} key={item.audio_id} playSong={this.playSong} pauseSong={this.pauseSong} closePopUp={this.closePopUp}  {...item} audio={item}  /></div>

        })

        return (
            <React.Fragment>
                <div className={`${this.props.from_user_profile ? 'audio-cnt' : ""}`}>
                        {
                            !this.props.search ? 
                        <div className="container">
                            <Search  {...this.props} type="audio"/>
                        </div>
                            : null
                        } 
                        {
                            !this.props.from_user_profile ? 
                                <InfiniteScroll
                                        dataLength={this.state.audios.length}
                                        next={this.loadMoreContent}
                                        hasMore={this.state.pagging}
                                        loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.audios.length}  />}
                                        endMessage={
                                            <EndContent {...this.props} text={Translate(this.props,"No audio found.")} itemCount={this.state.audios.length} />
                                        }
                                        pullDownToRefresh={false}
                                        pullDownToRefreshContent={<Release release={false} {...this.props} />}
                                        releaseToRefreshContent={<Release release={true} {...this.props} />}
                                        refreshFunction={this.refreshContent}
                                    >
                                        {
                                            this.props.fromUserProfile ? 
                                                <div className="gridContainer gridAudio">
                                                    {
                                                        items
                                                    }
                                                </div>
                                            :
                                            <div className="container">
                                                <div className="gridContainer gridAudio">
                                                    {
                                                        items
                                                    }
                                                </div>
                                            </div>
                                        }
                                </InfiniteScroll>
                            :
                            <InfiniteScroll
                                    dataLength={this.state.audios.length}
                                    next={this.loadMoreContent}
                                    hasMore={this.state.pagging}
                                    loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.audios.length}  />}
                                    endMessage={
                                        <EndContent {...this.props} text={Translate(this.props,"No audio found.")} itemCount={this.state.audios.length} />
                                    }
                                    pullDownToRefresh={false}
                                    pullDownToRefreshContent={<Release release={false} {...this.props} />}
                                    releaseToRefreshContent={<Release release={true} {...this.props} />}
                                    refreshFunction={this.refreshContent}
                                >
                                    <div className="container">
                                        <div className="gridContainer gridVideo">
                                            {
                                                items
                                            }
                                        </div>
                                    </div>
                            </InfiniteScroll>
                        }
                        </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        song_id:state.audio.song_id,
        pausesong_id:state.audio.pausesong_id,

    };
};
const mapDispatchToProps = dispatch => {
    return {
        updateAudioData: (audios, song_id,pausesong_id,submitText,passwordText) => dispatch(playlist.updateAudioData(audios, song_id,pausesong_id,submitText,passwordText))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Browse)