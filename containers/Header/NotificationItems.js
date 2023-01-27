import React from "react"
import Link from "../../components/Link/index";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Loader from "../LoadMore/Index"
import Translate from "../../components/Translate/Index"
import Timeago from "../Common/Timeago"
import Links from "./Links"
import Image from "../Image/Index"

import dynamic from 'next/dynamic'
import Router from 'next/router';
class Index extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            notifications : props.notifications,
            loading: props.loading,
            unread: props.unread,
            pagging:props.pagging
        }
    }
       
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(nextProps.notifications != prevState.notifications || nextProps.loading != prevState.loading || nextProps.unread != prevState.unread || nextProps.pagging != prevState.pagging){
            return {notifications:nextProps.notifications,loading:nextProps.loading,unread:nextProps.unread,pagging:nextProps.pagging}
        }else{
            return null
        }
    }
    
    
    
    liClicked(id, data, e) {
        if (jQuery(e.target).hasClass('prevent')) {
            return
        }
        if (jQuery(e.target).prop('nodeName') != "B") {
            if (data.type.indexOf('_comments_') > -1) {
                if(data.comment)
                    Router.push(`/comment?id=${data.comment['id']}`, `/comment/${data.comment['id']}`)
            } else if (data.type.indexOf('_reply_') > -1) {
                if(data.reply)
                    Router.push(`/reply?id=${data.reply['id']}`, `/reply/${data.reply['id']}`)
            } else {
                if ((data.object_type == "users" || data.object_type == "members")) {
                    if(data[data.object_type])
                        Router.push(`/member?id=${data[data.object_type].custom_url}`, `/${data[data.object_type].custom_url}`)
                } 
                else if (data.object_type == "channels") {
                    if(data['channels'])
                        Router.push(`/channel?id=${data['channels'].custom_url}`, `/channel/${data['channels'].custom_url}`)
                } else if (data.object_type == "blogs") {
                    if(data['blogs'])
                        Router.push(`/blog?id=${data['blogs'].custom_url}`, `/blog/${data['blogs'].custom_url}`)
                } else if (data.object_type == "reels") {
                    if(data['reels'])
                        Router.push(`/reel?id=${data['reels'].custom_url}`, `/reel/${data['reels'].custom_url}`)
                }else if (data.object_type == "stories") {
                    if(data['stories'])
                        Router.push(`/story?id=${data['stories'].custom_url}`, `/story/${data['stories'].custom_url}`)
                } else if (data.object_type == "artists") {
                    if(data['artists'])
                        Router.push(`/artist?id=${data['artists'].custom_url}`, `/artist/${data['artists'].custom_url}`)
                } else if (data.object_type == "playlists") {
                    if(data['playlists'])
                        Router.push(`/playlist?id=${data['playlists'].custom_url}`, `/playlist/${data['playlists'].custom_url}`)
                } else if (data.object_type == "videos") {
                    if(data['videos'])
                        Router.push(`/watch?id=${data['videos'].custom_url}`, `/watch/${data['videos'].custom_url}`)
                }else if (data.object_type == "movies") {
                    if(data['movies'])
                        Router.push(`/watch?id=${data['movies'].custom_url}`, `/watch/${data['movies'].custom_url}`)
                } else if (data.object_type == "audio") {
                    if(data['audio'])
                        Router.push(`/audio?id=${data['audio'].custom_url}`, `/audio/${data['audio'].custom_url}`)
                }else if (data.object_type == "package") {
                    Router.push(`/upgrade`, `/upgrade`)
                }
            }
        }
    }
    replacePatternToComponent = (text, pattern, array) => {
        const splitText = text.split(pattern);
        const matches = text.match(pattern);
        if (splitText.length <= 1) {
            return text;
        }
        return splitText.reduce((arr, element) => {
            if (!element) return arr;

            if (matches.includes(element)) {
                return [...arr, array[element]];
            }
            return [...arr, element];
        },
            []
        );
    };
    render(){
        let notiData = ""
        if (this.state.notifications && this.state.notifications.length) {
            notiData = this.state.notifications.map(notification => {
                const vars = JSON.parse(notification.vars)
                let body = Translate(this.props,notification.body)
                if(!body){
                    body = notification.body
                }
                const rx = /(\{.*?\})/gi;
                const matches = body.match(rx)
                const subjectImage = <Links data={notification.subject} >
                    <Image className="prevent" height="45" width="45" title={notification.title} image={ notification.subject ? notification.subject.image : ""} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                </Links>
                const array = {}
                if (matches && matches.length) {
                    let i = 0
                    matches.forEach(match => {
                        if (match.indexOf('_') < 0 || match == "{channel_posts}") {
                            let data = { ...notification[match.replace('{', '').replace('}', '')] }
                            if (data) {
                                if (vars[match.replace('{', '').replace('}', '')]) {
                                    data.title = vars[match.replace('{', '').replace('}', '')]
                                }
                                array[match] = <Links className="prevent" key={i} data={data} />
                            }
                        } else {
                            const matchOrg = match
                            let matchString = match.split('_')[0]
                            let data = { ...notification[matchString.replace('{', '')] }
                            array[matchOrg] = <Links className="prevent" key={i} data={{ title: data.title, type: match.replace('{', '').replace('}', '') }} />
                        }
                        i = i + 1;
                    });
                }
                const readUnread = notification.is_read == 0 ? " notifyUnread" : ""
                const pattern = /(\{stories\})|(\{reels\})|(\{subject\})|(\{audio\})|(\{videos\})|(\{movies\})|(\{channels\})|(\{blogs\})|(\{playlists\})|(\{comment\})|(\{reply\})|(\{comment_title\})|(\{reply_title\})|(\{members\})|(\{planName\})|(\{channel_posts\})|(\{period\})/g;
                
                let image = null
                if (notification.object_type == "channels") {
                    if(notification['channels'])
                        image = <Links className="prevent content-image" data={notification["channels"]}><Image height="50" width="50" className="prevent" title={notification["channels"].title} image={ notification["channels"].image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} /></Links>
                } else if (notification.object_type == "blogs") {
                    if(notification['blogs'])
                        image = <Links className="prevent content-image" data={notification["blogs"]}><Image height="50" width="50" className="prevent" title={notification["blogs"].title} image={ notification["blogs"].image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} /></Links>
                }else if (notification.object_type == "reels") {
                    if(notification['reels'])
                        image = <Links className="prevent content-image" data={notification["reels"]}><Image height="50" width="50" className="prevent" title={notification["reels"].title} image={ notification["reels"].image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} /></Links>
                }else if (notification.object_type == "stories") {
                    if(notification['stories'])
                        image = <Links className="prevent content-image" data={notification["stories"]}><Image height="50" width="50" className="prevent" title={"story"} image={ notification["stories"].image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} /></Links>
                } else if (notification.object_type == "artists") {
                    if(notification['artists'])
                        image = <Links className="prevent content-image" data={notification["artists"]}><Image height="50" width="50" className="prevent" title={notification["artists"].title} image={ notification["artists"].image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} /></Links>
                } else if (notification.object_type == "playlists") {
                    if(notification['playlists'])
                        image = <Links className="prevent content-image" data={notification["playlists"]}><Image height="50" width="50" className="prevent" title={notification["playlists"].title} image={ notification["playlists"].image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} /></Links>
                } else if (notification.object_type == "videos") {
                    if(notification['videos'])
                        image = <Links className="prevent content-image" data={notification["videos"]}><Image height="50" width="50" className="prevent" title={notification["videos"].title} image={ notification["videos"].image} imageSuffix={this.props.pageData.imageSuffix}  siteURL={this.props.pageData.siteURL}/></Links>
                }else if (notification.object_type == "movies") {
                    if(notification['movies'])
                        image = <Links className="prevent content-image" data={notification["movies"]}><Image height="50" width="50" className="prevent" title={notification["movies"].title} image={ notification["movies"].image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} /></Links>
                } else if (notification.object_type == "audio") {
                    if(notification['audio'])
                        image = <Links className="prevent content-image" data={notification["audio"]}><Image height="50" width="50" className="prevent" title={notification["audio"].title} image={ notification["audio"].image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} /></Links>
                }
               
                return (
                    <li style={{ cursor: "pointer" }} key={notification.notification_id} onClick={this.liClicked.bind(this, notification.notification_id, notification)}>
                        <div className={`notify-wrap clearfix${readUnread}`}>
                            <div className="notify-content">
                                <div className="notify-img">
                                    {subjectImage}
                                </div>
                                <div className="notify-text">
                                    <span className="message">
                                        {
                                            this.replacePatternToComponent(body, pattern, array)
                                        }
                                    </span>
                                    {
                                        image ? 
                                            image
                                        : null
                                    }
                                    <span className="timedate"><Timeago {...this.props}>{notification.creation_date}</Timeago></span>
                                    
                                </div>
                            </div>
                            <div className="notify-content-action">
                                    <span><span className="material-icons dropbtn show prevent notclosenotification parent" onClick={(e) => this.props.deleteNotification( notification.notification_id,e)}>close</span></span>
                                    {
                                        notification.is_read == 0 ? 
                                    <span className="markRead show prevent notclosenotification parent" data-bs-toggle="tooltip" onClick={(e) => this.props.markUnread( notification.notification_id,e)}></span>
                                    : null
                                    }
                                </div>
                        </div>
                    </li>
                )
            })
        }
    return (
        <div className={`custScrollBar notificationMenu${this.props.mobileMenu ? " MobNotification" : ""}`} id="scrollableDiv">
            <li>
                <div className="notify-header">
                    <div className="notify-header-title">{Translate(this.props,"Notifications")}</div>
                    <div className="notify-header-action">
                        <a href="#" className="notclosenotification parent" onClick={(e) => this.props.markUnread( 0,e)}>{Translate(this.props,"Mark all as read")}</a>
                        <Link href="/dashboard" customParam={`type=notifications`} as={`/dashboard/notifications`}>
                            <a>
                                {Translate(this.props,"Settings")}
                            </a>
                        </Link>
                    </div>
                </div>
            </li>
            {
                this.state.loading ?
                    <li>
                        <div className="notify-wrap notifyUnread clearfix">
                            <Loader {...this.props} loading={true} />
                        </div>
                    </li>
                    :
                    <InfiniteScroll
                        className="row"
                        dataLength={this.state.notifications.length}
                        next={this.props.loadMoreContent}
                        hasMore={this.state.pagging}
                        loader={<LoadMore {...this.props} loading={true} itemCount={this.state.notifications.length} />}
                        endMessage={
                            <EndContent {...this.props} text={Translate(this.props,'You have no new updates.')} notShow={true} itemCount={this.state.notifications.length} />
                        }
                        pullDownToRefresh={false}
                        scrollableTarget="scrollableDiv"
                    >
                        {notiData}
                    </InfiniteScroll>
            }
        </div>
    )
        }
}
 export default  Index