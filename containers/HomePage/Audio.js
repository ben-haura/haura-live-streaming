
import React from "react"
import { connect } from "react-redux";
import playlist from '../../store/actions/general';
import Translate from "../../components/Translate/Index";
import dynamic from 'next/dynamic'
import Router from 'next/router';
import AudioItem from "../Audio/Item"
import Link from "../../components/Link/index"

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
class Audio extends React.Component {
    constructor(props) {
        super(props)
        let propsData = {...props}
        this.state = {
            audios: propsData.audio,
            language:propsData.i18n.language,
        }
        this.slider = null
        this.pauseSong = this.pauseSong.bind(this)
        this.playSong = this.playSong.bind(this)
        this.playPauseSong = this.playPauseSong.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.audio != prevState.audios || nextProps.i18n.language != prevState.language) {
            return { audios: nextProps.audio,language:nextProps.i18n.language }
        } else{
            return null
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
                this.setState({localUpdate:true, audios: items })
            }
        });
        this.props.socket.on('audioDeleted', data => {
            let id = data.audio_id
            const itemIndex = this.getItemIndex(id)
            if (this.state.audios && itemIndex > -1) {
                const items = [...this.state.audios]
                items.splice(itemIndex, 1);
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
                    this.setState({localUpdate:true, audios: items })
                }
            }
        });
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
    
    render() {
        
        if (!this.state.audios || !this.state.audios.length) {
            return null
        }

        const content = this.state.audios.map(item => {
            return <AudioItem fromslider={true} {...this.props} key={item.audio_id} playSong={this.playSong} pauseSong={this.pauseSong} closePopUp={this.closePopUp}  {...item} audio={item}  />
        })

        return (
            <div className="VideoRoWrap">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="titleWrap">
                            {
                                this.props.pageData.themeType == 2 && this.props.seemore?
                                    <Link href={`/audio?${"type"}=${this.props.type ? this.props.type : this.props.sort}`}>
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
                                        {Translate(this.props, this.props.titleHeading ? this.props.titleHeading : `Recent Audio`)}
                                    </React.Fragment>

                                </span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            {
                                <Carousel {...this.props} carouselType="audio" defaultItemCount={this.props.pageData.appSettings["audio_advgrid"] == 1 ? 5 : 5} itemAt1024={this.props.pageData.appSettings["audio_advgrid"] == 1 ? 4 : 4} itemAt900={this.props.pageData.appSettings["audio_advgrid"] == 1 ? 3 : 3} itemAt1200={3} itemAt1500={this.props.pageData.appSettings["audio_advgrid"] == 1 ? 5 : 5} itemAt600={this.props.pageData.appSettings["audio_advgrid"] == 1 ? 2 : 2} itemAt480={1} >
                                    {content}
                                </Carousel>
                            }
                        </div>
                    </div>


                </div>
            </div>
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
export default connect(mapStateToProps, mapDispatchToProps, null)(Audio)