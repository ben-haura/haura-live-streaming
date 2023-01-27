import React from "react"
import Item from "../Playlist/Item"

import Link from "../../components/Link"

import Translate from "../../components/Translate/Index"

class CarouselPlaylist extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playlists: props.playlists
        }

    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if(nextProps.playlists != prevState.playlists){
            return {playlists:nextProps.playlists}
        } else{
            return null
        }
    }
    componentDidMount() {
        this.props.socket.on('playlistDeleted', data => {
            let id = data.playlist_id
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const playlists = [...this.state.playlists]
                playlists.splice(itemIndex, 1);
                this.setState({localUpdate:true, playlists: playlists })
            }
        })
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1 && type == "playlists") {
                const items = [...this.state.playlists]
                const changedItem = { ...items[itemIndex] }
                changedItem.rating = rating
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, playlists: items })
            }
        });
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "playlists") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.playlists]
                    const changedItem = { ...items[itemIndex] }
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, playlists: items })
                }
            }
        });
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "playlists") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.playlists]
                    const changedItem = { ...items[itemIndex] }
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, playlists: items })
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
            if (itemType == "playlists") {
                const itemIndex = this.getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...this.state.playlists]
                    const changedItem = { ...items[itemIndex] }
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
                    this.setState({localUpdate:true, playlists: items })
                }
            }
        });
    }
    getItemIndex(item_id) {
        if (this.state.playlists) {
            const items = [...this.state.playlists];
            const itemIndex = items.findIndex(p => p.playlist_id == item_id);
            return itemIndex;
        }
        return -1;
    }

    render() {
        if (!this.state.playlists || !this.state.playlists.length) {
            return null
        }

        return (
            <div className="VideoRoWrap">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="titleWrap">
                                <span className="title">
                                    <React.Fragment>
                                        {
                                            this.props.headerTitle ?
                                                this.props.headerTitle :
                                                null
                                        }
                                        {Translate(this.props, this.props.title ? this.props.title : `Related Playlists`)}
                                    </React.Fragment>
                                </span>
                                {
                                    this.props.seemore && this.state.playlists.length > 3 ?
                                        <Link href={`/playlists?${this.props.type ? "type" : "sort"}=${this.props.type ? this.props.type : this.props.sort}`}>
                                            <a className="seemore_link">
                                                {
                                                    Translate(this.props, "See more")
                                                }
                                            </a>
                                        </Link>
                                        : null
                                }

                            </div>
                        </div>
                    </div>

                    <div className="gridContainer gridPlaylist">
                        {
                            // <this.props.OwlCarousel {...options} className="btn-slide" >
                            this.state.playlists.map(result => {
                                return <div key={result.playlist_id} className="gridColumn"><Item {...this.props} {...result} playlist={result} /></div>
                            })
                            // </this.props.OwlCarousel>
                        }
                    </div>


                </div>
            </div>
        )
    }
}


export default CarouselPlaylist