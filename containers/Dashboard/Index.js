import React from "react"
import { connect } from "react-redux";
import * as actions from '../../store/actions/general';
import axios from "../../axios-orders"
import dynamic from 'next/dynamic'
import Router from 'next/router';
const StreamData = dynamic(() => import("./StreamData"), {
    ssr: false
});
const Channels = dynamic(() => import("./Channels"), {
    ssr: false
});
const Videos = dynamic(() => import("./Videos"), {
    ssr: false
});
const Movies = dynamic(() => import("./Movies"), {
    ssr: false
});
const Playlists = dynamic(() => import("./Playlists"), {
    ssr: false
});
const Audio = dynamic(() => import("./Audio"), {
    ssr: false
});
const Blogs = dynamic(() => import("./Blogs"), {
    ssr: false
});
const Members = dynamic(() => import("./Members"), {
    ssr: false
});
 const Ads = dynamic(() => import("./Ads"), {
    ssr: false
});
const Delete = dynamic(() => import("./Delete"), {
    ssr: false
});
const Verification = dynamic(() => import("./Verification"), {
    ssr: false
});
const Password = dynamic(() => import("./Password"), {
    ssr: false
});
const General = dynamic(() => import("./General"), {
    ssr: false
});
const Profile = dynamic(() => import("./Profile"), {
    ssr: false
});
import Cover from "../Cover/User"

import Alert from "./Alert"
const Monetization = dynamic(() => import("./Monetization"), {
    ssr: false
});
const Balance = dynamic(() => import("./Balance"), {
    ssr: false
});
import Translate from "../../components/Translate/Index"
const Purchase = dynamic(() => import("./Purchases"), {
    ssr: false
});
const Earning = dynamic(() => import("./Earning"), {
    ssr: false
});
const Points = dynamic(() => import("./Points"), {
    ssr: false
});

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            filter: props.pageData ? props.pageData.filter : "",
            type: props.pageData ? props.pageData.type : "general",
            member: props.pageData ? props.pageData.member : {},
            items: props.pageData ? props.pageData.items.results : null,
            pagging: props.pageData ? props.pageData.items.pagging : null,
            notificationTypes: props.pageData ? props.pageData.notificationTypes : null,
            user:props.pageData ? props.pageData.user : "",
            userShowBalance:props.pageData ? props.pageData.userShowBalance : "",
            memberMonetization:props.pageData ? props.pageData.memberMonetization : "",
            monetization_threshold_amount:props.pageData ? props.pageData.monetization_threshold_amount : null,
            statsData:props.pageData ? props.pageData.statsData : null,
            width:props.isMobile ? props.isMobile : 993
        }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    } 
    updateWindowDimensions() {
        this.setState({localUpdate:true, width: window.innerWidth });
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    componentDidMount(){
        if(this.props.pageData.appSettings["fixed_header"] == 1 && this.props.hideSmallMenu && !this.props.menuOpen){
            this.props.setMenuOpen(true)
         }
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (id == this.state.member.user_id && type == "members") {
                if (this.state.member.user_id == id) {
                    const data = { ...this.state.member }
                    data.favourite_count = data.favourite_count - 1
                    if (this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = null
                    }
                    this.setState({localUpdate:true, member: data })
                }
            }
        });
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (id == this.state.member.user_id && type == "members") {
                if (this.state.member.user_id == id) {
                    const data = { ...this.state.member }
                    data.favourite_count = data.favourite_count + 1
                    if (this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = 1
                    }
                    this.setState({localUpdate:true, member: data })
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
            if (itemType == "members" && this.state.member.user_id == itemId) {
                const item = { ...this.state.member }
                let loggedInUserDetails = {}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails) {
                    loggedInUserDetails = this.props.pageData.loggedInUserDetails
                }
                if (removeLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['like_count'] = parseInt(item['like_count']) - 1
                }
                if (removeDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['dislike_count'] = parseInt(item['dislike_count']) - 1
                }
                if (insertLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "like"
                    item['like_count'] = parseInt(item['like_count']) + 1
                }
                if (insertDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "dislike"
                    item['dislike_count'] = parseInt(item['dislike_count']) + 1
                }
                this.setState({localUpdate:true, member: item })
            }
        });


        this.props.socket.on('userCoverReposition', data => {
            let id = data.user_id
            if (id == this.state.member.user_id) {
                const item = {...this.state.member}
                item.cover_crop = data.image
                item.showCoverReposition = false
                this.setState({localUpdate:true, member: item, loadingCover: false })
                this.props.openToast(Translate(this.props,data.message), "success");
            }
        });
        this.props.socket.on('userMainPhotoUpdated', data => {
            let id = data.user_id
            if (id == this.state.member.user_id) {
                const item = {...this.state.member}
                item.avtar = data.image
                this.setState({localUpdate:true, member: item, loadingCover: false })
                this.props.openToast(Translate(this.props,data.message), "success");
            }
        });
        this.props.socket.on('userCoverUpdated', data => {
            let id = data.user_id
            if (id == this.state.member.user_id) {
                const item = {...this.state.member}
                item.cover = data.image
                item.usercover = true;
                item.cover_crop = null;
                item.showCoverReposition = true
                this.setState({localUpdate:true, member: item, loadingCover: false })
                this.props.openToast(Translate(this.props,data.message), "success");
            }
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.type != prevState.type || nextProps.filter != prevState.filter) {
            return {
                filter: nextProps.pageData ? nextProps.pageData.filter : "",
                type: nextProps.pageData ? nextProps.pageData.type : "general",
                member: nextProps.pageData ? nextProps.pageData.member : {},
                items: nextProps.pageData ? nextProps.pageData.items.results : null,
                pagging: nextProps.pageData ? nextProps.pageData.items.pagging : null,
                notificationTypes: nextProps.pageData ? nextProps.pageData.notificationTypes : null,
                user:nextProps.pageData ? nextProps.pageData.user : "",
                userShowBalance:nextProps.pageData ? nextProps.pageData.userShowBalance : "",
                memberMonetization:nextProps.pageData ? nextProps.pageData.memberMonetization : "",
                monetization_threshold_amount:nextProps.pageData ? nextProps.pageData.monetization_threshold_amount : null,
                statsData:nextProps.pageData ? nextProps.pageData.statsData : null
            }
        }else{
            return null
        }
    }

    changeType(type, e) {
        e.preventDefault()
        let subtype = `/dashboard?type=${type}`
        let asPath = `/dashboard/${type}`
        if(this.state.user){
            subtype = subtype+"&user="+this.state.user
            asPath = asPath + "?user="+this.state.user
        }
        Router.push(
            `${subtype}`,
            `${asPath}`,
        )
    }
    changeFilter = (e) => {
        e.preventDefault()
        let type = e.target.value
        let subtype = `/dashboard?type=${type}`
        let asPath = `/dashboard/${type}`
        if(this.state.user){
            subtype = subtype+"&user="+this.state.user
            asPath = asPath + "?user="+this.state.user
        }
        Router.push(
            `${subtype}`,
            `${asPath}`,
        )
    }
    clearHistory = (type,changeFunction) => {
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: Translate(this.props, "Are you sure want to clear history!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('type', type)
                    formData.append('user_id', this.state.member.user_id)
                    const url = "/dashboard/clear-history"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                            } else {
                                changeFunction();
                            }
                        }).catch(err => {
                            //console.log(err)
                            swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }

    render() {
        let user = ""
        let isOwner = true
        if(this.state.user){
            user = "?user="+this.state.user
            if(this.state.user == this.props.pageData.loggedInUserDetails.username){
                isOwner = true
            }else{
                isOwner = false;
            }
        }
        
        const options = {}
        
        if(this.state.member.canEdit) {
            options['general'] = Translate(this.props,'General');
            options['profile'] = Translate(this.props,'Profile');
        }
        options['password'] = Translate(this.props,'Password');
        if(this.state.memberMonetization && isOwner)
            options['monetization'] = Translate(this.props,'Monetization');
        if(this.state.userShowBalance && isOwner)
            options['balance'] = Translate(this.props,'Balance');
        if(this.state.member.verificationFunctionality && isOwner)
         options['verification'] = Translate(this.props,'Verification');

        if(isOwner){
            options['notifications'] = Translate(this.props,'Notifications Alert');
            options['emails'] = Translate(this.props,'Emails Alert');
            options['videos'] = Translate(this.props,'Videos');
            if(this.props.pageData['livestreamingtype'] == 0 && this.props.pageData.appSettings['antserver_media_singlekey'] == 1)
                options['streamdata'] = Translate(this.props,'Default Stream Data');


            if((this.props.pageData.levelPermissions["movie.edit"] == 1 || this.props.pageData.levelPermissions["movie.edit"] == 2) && this.props.pageData.appSettings["enable_movie"] == 1)
                options['movies'] = Translate(this.props,'Movies');
            if((this.props.pageData.levelPermissions["movie.edit"] == 1 || this.props.pageData.levelPermissions["movie.edit"] == 2) && this.props.pageData.appSettings["enable_movie"] == 1)
                options['series'] = Translate(this.props,'Series');

            if((this.props.pageData.levelPermissions["channel.edit"] == 1 || this.props.pageData.levelPermissions["channel.edit"] == 2) && this.props.pageData.appSettings["enable_channel"] == 1)
                options['channels'] = Translate(this.props,'Channels');
            if((this.props.pageData.levelPermissions["blog.edit"] == 1 || this.props.pageData.levelPermissions["blog.edit"] == 2) && this.props.pageData.appSettings["enable_blog"] == 1)
                options['blogs'] = Translate(this.props,'Blogs');
            options['members'] = Translate(this.props,'Members');
            if((this.props.pageData.levelPermissions["playlist.create"] == 1 || this.props.pageData.levelPermissions["playlist.edit"] == 2) && this.props.pageData.appSettings["enable_playlist"] == 1)
                options['playlists'] = Translate(this.props,'Playlists');
            if((this.props.pageData.levelPermissions["audio.create"] == 1 || this.props.pageData.levelPermissions["audio.edit"] == 2) && this.props.pageData.appSettings["enable_audio"] == 1)
                options['audio'] = Translate(this.props,'Audio');
            options['purchases'] = Translate(this.props,'Purchases');
            if(this.state.userShowBalance)
                options['earning'] = Translate(this.props,'Earning');
            if((this.props.pageData.levelPermissions["member.ads"] == 1) && this.props.pageData.appSettings["enable_ads"] == 1)
                options['ads'] = Translate(this.props,'Advertisements');
        }
        if( this.state.member.canDelete)
            options['delete'] = Translate(this.props,'Delete Account');
        return (
            <React.Fragment>
                <Cover {...this.props} profile={true}  settings={true} {...this.state.member} member={this.state.member} type="member" id={this.state.member.user_id} />
                    <div className="container-fluid mt-5">
                        <div className="row">
                            <div className="col-lg-2">
                                <div className="sdBarSettBox">
                                    {
                                        this.state.width > 992 ? 
                                    <ul className="nav nav-tabs tabsLeft">

                                        {
                                            this.state.member.canEdit ?
                                                <li >
                                                    <a href={`${this.props.pageData.subFolder}dashboard/general${user}`} onClick={this.changeType.bind(this, 'general')} className={this.state.type == "general" ? "active" : ""}>{Translate(this.props, "General")}</a>
                                                </li>
                                                : null
                                        }

                                        {
                                            this.state.member.canEdit ?
                                                <li >
                                                    <a href={`${this.props.pageData.subFolder}dashboard/profile${user}`} onClick={this.changeType.bind(this, 'profile')} className={this.state.type == "profile" ? "active" : ""}>{Translate(this.props, "Profile")}</a>
                                                </li>
                                                : null
                                        }
                                        <li >
                                            <a href={`${this.props.pageData.subFolder}dashboard/password${user}`} onClick={this.changeType.bind(this, 'password')} className={this.state.type == "password" ? "active" : ""}>{Translate(this.props, "Password")}</a>
                                        </li>
                                        {
                                            this.state.memberMonetization && isOwner ?
                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/monetization${user}`} onClick={this.changeType.bind(this, 'monetization')} className={this.state.type == "monetization" ? "active" : ""}>{Translate(this.props, "Monetization")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            this.state.userShowBalance && isOwner ?
                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/balance${user}`} onClick={this.changeType.bind(this, 'balance')} className={this.state.type == "balance" || this.state.type == "withdraw" ? "active" : ""}>{Translate(this.props, "Balance")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            this.props.pageData.appSettings['enable_ponts'] == 1 && isOwner ?
                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/points${user}`} onClick={this.changeType.bind(this, 'points')} className={this.state.type == "points" ? "active" : ""}>{Translate(this.props, "Points")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            this.state.member.verificationFunctionality && isOwner ?
                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/verification${user}`} onClick={this.changeType.bind(this, 'verification')} className={this.state.type == "verification" ? "active" : ""}>{Translate(this.props, "Verification")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner ? 
                                        <li>
                                            <a href={`${this.props.pageData.subFolder}dashboard/notifications${user}`} onClick={this.changeType.bind(this, 'notifications')} className={this.state.type == "notifications" ? "active" : ""} >{Translate(this.props, "Notifications Alert")}</a>
                                        </li>
                                        : null
                                        }
                                        {
                                            isOwner && this.props.pageData['livestreamingtype'] == 0 && this.props.pageData.appSettings['antserver_media_singlekey'] == 1 ?
                                            <li>
                                                <a href={`${this.props.pageData.subFolder}dashboard/streamdata${user}`} onClick={this.changeType.bind(this, 'streamdata')} className={this.state.type == "streamdata" ? "active" : ""} >{Translate(this.props, "Default Stream Data")}</a>
                                            </li>
                                            : null
                                        }
                                        {
                                            isOwner ? 
                                            <React.Fragment>
                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/emails${user}`} onClick={this.changeType.bind(this, 'emails')} className={this.state.type == "emails" ? "active" : ""} >{Translate(this.props, "Emails Alert")}</a>
                                                </li>
                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/videos${user}`} onClick={this.changeType.bind(this, 'videos')} className={this.state.type == "videos" ? "active" : ""} >{Translate(this.props, "Videos")}</a>
                                                </li>
                                            </React.Fragment>
                                        : null
                                        }
                                        {
                                            isOwner && (this.props.pageData.levelPermissions["movie.edit"] == 1 || this.props.pageData.levelPermissions["movie.edit"] == 2) && this.props.pageData.appSettings["enable_movie"] == 1 ?

                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/movies${user}`} onClick={this.changeType.bind(this, 'movies')} className={this.state.type == "movies" ? "active" : ""}>{Translate(this.props, "Movies")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (this.props.pageData.levelPermissions["movie.edit"] == 1 || this.props.pageData.levelPermissions["movie.edit"] == 2) && this.props.pageData.appSettings["enable_movie"] == 1 ?

                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/series${user}`} onClick={this.changeType.bind(this, 'series')} className={this.state.type == "series" ? "active" : ""}>{Translate(this.props, "Series")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (this.props.pageData.levelPermissions["channel.edit"] == 1 || this.props.pageData.levelPermissions["channel.edit"] == 2) && this.props.pageData.appSettings["enable_channel"] == 1 ?

                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/channels${user}`} onClick={this.changeType.bind(this, 'channels')} className={this.state.type == "channels" ? "active" : ""}>{Translate(this.props, "Channels")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (this.props.pageData.levelPermissions["blog.edit"] == 1 || this.props.pageData.levelPermissions["blog.edit"] == 2) && this.props.pageData.appSettings["enable_blog"] == 1 ?

                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/blogs${user}`} onClick={this.changeType.bind(this, 'blogs')} className={this.state.type == "blogs" ? "active" : ""}>{Translate(this.props, "Blogs")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner ? 
                                                <li>
                                                    <a href={`${this.props.pageData.subFolder}dashboard/members${user}`} onClick={this.changeType.bind(this, 'members')} className={this.state.type == "members" ? "active" : ""}>{Translate(this.props, "Members")}</a>
                                                </li>
                                        : null
                                        }
                                        {
                                            isOwner && (this.props.pageData.levelPermissions["playlist.create"] == 1 || this.props.pageData.levelPermissions["playlist.edit"] == 2) && this.props.pageData.appSettings["enable_playlist"] == 1 ?

                                                <li >
                                                    <a href={`${this.props.pageData.subFolder}dashboard/playlists${user}`} onClick={this.changeType.bind(this, 'playlists')} className={this.state.type == "playlists" ? "active" : ""}>{Translate(this.props, "Playlists")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (this.props.pageData.levelPermissions["audio.create"] == 1 || this.props.pageData.levelPermissions["audio.edit"] == 2) && this.props.pageData.appSettings["enable_audio"] == 1 ?

                                                <li >
                                                    <a href={`${this.props.pageData.subFolder}dashboard/audio${user}`} onClick={this.changeType.bind(this, 'audio')} className={this.state.type == "audio" ? "active" : ""}>{Translate(this.props, "Audio")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner ? 
                                                <li >
                                                    <a href={`${this.props.pageData.subFolder}dashboard/purchases${user}`} onClick={this.changeType.bind(this, 'purchases')} className={this.state.type == "purchases" ? "active" : ""}>{Translate(this.props, "Purchases")}</a>
                                                </li>   
                                        : null
                                        }         
                                        {
                                            isOwner && this.state.userShowBalance ? 
                                                <li >
                                                    <a href={`${this.props.pageData.subFolder}dashboard/earning${user}`} onClick={this.changeType.bind(this, 'earning')} className={this.state.type == "earning" ? "active" : ""}>{Translate(this.props, "Earning")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (this.props.pageData.levelPermissions["member.ads"] == 1) && this.props.pageData.appSettings["enable_ads"] == 1 && (this.props.pageData.appSettings['video_ffmpeg_path'] || this.props.pageData.loggedInUserDetails.level_id == 1) ?

                                                <li >
                                                    <a href={`${this.props.pageData.subFolder}dashboard/ads${user}`} onClick={this.changeType.bind(this, 'ads')} className={this.state.type == "ads" ? "active" : ""}>{Translate(this.props, "Advertisements")}</a>
                                                </li>
                                                : null
                                        }

                                        {
                                            this.state.member.canDelete ?
                                                <li >
                                                    <a href={`${this.props.pageData.subFolder}dashboard/delete${user}`} onClick={this.changeType.bind(this, 'delete')} className={this.state.type == "delete" ? "active" : ""}>{Translate(this.props, "Delete Account")}</a>
                                                </li>
                                                : null
                                        }
                                    </ul>
                                    : 
                                    <div className="formFields">
                                        <div className="form-group">
                                            <select className="form-control form-select" value={this.state.type} onChange={this.changeFilter}>
                                                {
                                                    Object.keys(options).map(function(key) {
                                                        return (
                                                            <option value={key} key={key}>{options[key]}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                }
                                </div>
                            </div>
                            <div className="col-lg-10 bgSecondry">
                                <div className="tab-content dashboard">
                                    {
                                        this.state.type == "purchases" ?
                                            <Purchase  {...this.props} contentType={this.state.type} member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.props.pageData.appSettings['enable_ponts'] == 1 && this.state.type == "points" ?
                                            <Points {...this.props} contentType={this.state.type} member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.userShowBalance && this.state.type == "earning" ? 
                                            <Earning  {...this.props} statsData={this.state.statsData} items={this.state.items} contentType={this.state.type} member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.type == "general" ?
                                            <General  {...this.props} member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.type == "monetization" ?
                                            <Monetization  {...this.props} member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.type == "balance" || this.state.type == "withdraw" ?
                                            <Balance  {...this.props} member={this.state.member} type={this.state.type} />
                                        : null
                                    }

                                    {
                                        this.state.type == "profile" ?
                                            <Profile {...this.props}  member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.type == "streamdata" ?
                                            <StreamData {...this.props}  member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.type == "password" ?
                                            <Password {...this.props}  member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.type == "verification" ?
                                            <Verification {...this.props}  member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.type == "notifications" ?
                                            <Alert {...this.props}  type={this.state.type} member={this.state.member} notificationTypes={this.state.notificationTypes} />
                                        : null
                                    }
                                    {
                                        this.state.type == "emails" ?
                                            <Alert {...this.props}  type={this.state.type} member={this.state.member} notificationTypes={this.state.notificationTypes} />
                                        : null
                                    }
                                    {
                                        this.state.type == "videos" ?
                                            <Videos {...this.props}  member={this.state.member} clearHistory={this.clearHistory} />
                                        : null
                                    }
                                    {
                                        this.state.type == "movies" || this.state.type == "series"?
                                            <Movies {...this.props}  member={this.state.member} clearHistory={this.clearHistory} />
                                        : null
                                    }
                                    
                                    {
                                        this.state.type == "channels" ?
                                            <Channels {...this.props}  member={this.state.member} clearHistory={this.clearHistory} />
                                        : null
                                    }
                                    {
                                        this.state.type == "blogs" ?
                                            <Blogs {...this.props}  member={this.state.member} clearHistory={this.clearHistory} />
                                        : null
                                    }
                                    {
                                        this.state.type == "members" ?
                                            <Members {...this.props}  member={this.state.member} clearHistory={this.clearHistory} />
                                        : null
                                    }
                                    {
                                        this.state.type == "playlists" ?
                                            <Playlists {...this.props}  member={this.state.member} clearHistory={this.clearHistory} />
                                        : null
                                    }
                                    {
                                        this.state.type == "audio" ?
                                            <Audio {...this.props}  member={this.state.member} clearHistory={this.clearHistory} />
                                        : null
                                    }
                                    {
                                        this.state.type == "ads" ?
                                            <Ads {...this.props}  member={this.state.member} />
                                        : null
                                    }
                                    {
                                        this.state.type == "delete" ?
                                            <Delete {...this.props}  member={this.state.member} />
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

const mapStateToProps = state => {
    return {
        menuOpen:state.search.menuOpen
    };
};
const mapDispatchToProps = dispatch => {
    return {
        setMenuOpen: (status) => dispatch(actions.setMenuOpen(status)),
        openToast: (message, typeMessage) => dispatch(actions.openToast(message, typeMessage)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index)