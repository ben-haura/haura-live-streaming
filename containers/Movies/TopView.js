import React from "react"
import Image from "../Image/Index"
import SocialShare from "../SocialShare/Index"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import Translate from "../../components/Translate/Index"
import CensorWord from "../CensoredWords/Index"

class TopView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            cast: props.cast
        }
    }
    componentDidMount() {
        
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "cast_crew_members") {
                if (this.state.cast.cast_crew_member_id == id) {
                    const changedItem = { ...this.state.cast }
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    this.setState({ cast: changedItem })
                }
            }
        });
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "cast_crew_members") {
                if (this.state.cast.cast_crew_member_id == id) {
                    const changedItem = { ...this.state.cast }
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    this.setState({ cast: changedItem })
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
            if (itemType == "cast_crew_members") {
                if (this.state.cast.cast_crew_member_id == itemId) {
                    const changedItem = { ...this.state.cast }
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
                    this.setState({ cast: changedItem })
                }
            }
        });
    }
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12 position-relative">
                        <div className="channelInfo-wrap artistDetailsWrap">
                            <div className="playlist-profile-img">
                                <Image title={this.state.cast.title} width="170" height="170" image={this.state.cast.image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                            </div>
                            <div className="playList-profileRight"> 
                            <div className="playlist-profile-title">
                                <h4>{Translate(this.props,this.state.cast.name) + " "} {
                                    this.state.cast.verified ?
                                        <span className="verifiedUser" title={Translate(this.props, "verified")}><span className="material-icons" data-icon="check"></span>
                                        </span>
                                        : null
                                }</h4>
                            </div>
                            
                            <div className="LikeDislikeWrap">
                                <ul className="LikeDislikeList">
                                    <li> 
                                        <Like  {...this.props} icon={true} like_count={this.state.cast.like_count} item={this.state.cast}  type="cast_crew_member" id={this.state.cast.cast_crew_member_id} />{"  "}
                                    </li>
                                    <li>
                                        <Dislike  {...this.props} icon={true} dislike_count={this.state.cast.dislike_count} item={this.state.cast}  type="cast_crew_member" id={this.state.cast.cast_crew_member_id} />{"  "}
                                    </li>
                                    <li>
                                        <Favourite  {...this.props} icon={true} favourite_count={this.state.cast.favourite_count} item={this.state.cast}  type="cast_crew_member" id={this.state.cast.cast_crew_member_id} />{"  "}
                                    </li>
                                    <SocialShare {...this.props} hideTitle={true} buttonHeightWidth="30" url={`/cast-and-crew/${this.state.cast.cast_crew_member_id}`} title={CensorWord("fn",this.props,this.state.cast.title)} imageSuffix={this.props.pageData.imageSuffix} media={this.state.cast.image} />
                                </ul>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default TopView