import React from "react"

import Item from "./Item"
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
import Link from "../../components/Link"
class CarouselChannel extends React.Component {
    constructor(props) {
        super(props)
        let propsData = {...props}
        this.state = {
            channels: propsData.channels,
            key: 1,
            language:propsData.i18n.language,
        }
        this.slider = null
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.channels != prevState.channels || nextProps.i18n.language != prevState.language) {
            return { channels: nextProps.channels,language:nextProps.i18n.language }
        } else{
            return null
        }

    }
    componentDidUpdate() {
        // if(this.slider)
        //     this.slider.destory();
    }
    componentDidMount() {
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1 && type == "channels") {
                const items = [...this.state.channels]
                const changedItem = { ...items[itemIndex] }
                changedItem.rating = rating
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, channels: items })
            }
        });
        this.props.socket.on('unfollowUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1 && type == "channels") {
                const items = [...this.state.channels]
                const changedItem = { ...items[itemIndex] }
                if (id == changedItem.channel_id) {
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.follower_id = null
                    }
                    changedItem.follow_count = (changedItem.follow_count ? changedItem.follow_count : 0) - 1
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, channels: items })
                }
            }
        });
        this.props.socket.on('followUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1 && type == "channels") {
                const items = [...this.state.channels]
                const changedItem = { ...items[itemIndex] }
                if (id == changedItem.channel_id) {
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.follower_id = 1
                    }
                    changedItem.follow_count = (changedItem.follow_count ? changedItem.follow_count : 0) + 1
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, channels: items })
                }
            }
        });
        this.props.socket.on('channelDeleted', data => {
            let id = data.channel_id
            if (type == "channels") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const channels = [...this.state.channels]
                    channels.splice(itemIndex, 1);
                    this.setState({localUpdate:true, channels: channels })
                }
            }
        })
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "channels") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.channels]
                    const changedItem = { ...items[itemIndex] }
                    changedItem.favourite_count = parseInt(changedItem.favourite_count) - 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, channels: items })
                }
            }
        });
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "channels") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.channels]
                    const changedItem = { ...items[itemIndex] }
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, channels: items })
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
            if (itemType == "channels") {
                const itemIndex = this.getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...this.state.channels]
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
                    this.setState({localUpdate:true, channels: items },()=>{})
                }
            }
        });
    }
    getItemIndex(item_id) {
        if (this.state.channels) {
            const items = [...this.state.channels];
            const itemIndex = items.findIndex(p => p.channel_id == item_id);
            return itemIndex;
        } else {
            return -1;
        }
    }
    
    render() {

        if (!this.state.channels || !this.state.channels.length) {
            return null
        }
       
        const content = this.state.channels.map(result => {
            return <div  key={result.channel_id}><Item {...this.props} {...result} channel={result} /></div>
        })

        return (
            <div className="VideoRoWrap">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="titleWrap">
                                {
                                this.props.pageData.themeType == 2 && this.props.seemore && ( this.props.type || this.props.sort ) ?
                                <Link href={`/channels?${this.props.type ? "type" : "sort"}=${this.props.type ? this.props.type : this.props.sort}`}>
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
                                            {Translate(this.props, this.props.title ? this.props.title : `Related Channels`)}
                                        </React.Fragment>
                                    </span>
                                }
                                {
                                    this.props.seemore && this.state.channels.length > 4 ?
                                        <Link href={`/channels?${this.props.type ? "type" : "sort"}=${this.props.type ? this.props.type : this.props.sort}`}>
                                            <a className="seemore_link">
                                                {Translate(this.props, "See more")}
                                            </a>
                                        </Link>
                                        : null
                                }

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            {
                                <Carousel {...this.props} items={content} carouselType="channel" itemAt1024={this.props.pageData.themeType == 2 ? 4 : 3} itemAt600={this.props.pageData.themeType == 2 ? 3 : 2} itemAt480={this.props.pageData.themeType == 2 ? 2 : 1}  />
                            }
                        </div>
                    </div>


                </div>
            </div>
        )
    }
}


export default CarouselChannel