import React from "react"
import Image from "../Image/Index"

import Link from "../../components/Link/index";

import SocialShare from "../SocialShare/Index"
import ShortNumber from "short-number"

import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import Subscribe from "../User/Follow"
import  Translate  from "../../components/Translate/Index"

class Item extends React.Component {
    constructor(props) {
        super(props)
        let propsData = {...props}
        this.state = {
            member: propsData.member,
            language:propsData.i18n.language

        }
    }
    shouldComponentUpdate(nextProps,nextState){
        if(nextProps.member != this.props.member || nextProps.i18n.language != this.state.language){
            return true
        }
        return false
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if (prevState.member != nextProps.member || nextProps.i18n.language != prevState.language) {
           return { member: nextProps.member }
        } else{
            return null
        }

    }
    render() {
        return (
            this.props.pageData.appSettings.member_advanced_grid != 1 ? 
                <div className="member-block">
                    <div className="member-img-block">
                        <Link href="/member" customParam={`id=${this.state.member.username}`} as={`/${this.state.member.username}`}>
                            <a  onClick={this.props.closePopUp}>
                                <Image title={this.state.member.displayname} image={this.state.member.avtar} imageSuffix={this.props.pageData.imageSuffix}  siteURL={this.props.pageData.siteURL} />
                            </a>
                        </Link>
                        <div className="lbletop">
                            {
                                this.props.pageData.appSettings['users_featuredlabel'] == 1 && this.props.pageData.appSettings['member_featured'] == 1 && this.state.member.is_featured == 1 ?
                                    <span className="lbl-Featured" title={Translate(this.props,"Featured Member")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            {
                                this.props.pageData.appSettings['users_sponsoredLabel'] == 1 && this.props.pageData.appSettings['member_sponsored'] == 1 && this.state.member.is_sponsored == 1 ?
                                    <span className="lbl-Sponsored" title={Translate(this.props,"Sponsored Member")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            {
                                this.props.pageData.appSettings['users_hotLabel'] == 1 && this.props.pageData.appSettings['member_hot'] == 1 && this.state.member.is_hot == 1 ?
                                    <span className="lbl-Hot" title={Translate(this.props,"Hot Member")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                        </div>
                    </div>
                    <Link href="/member" customParam={`id=${this.state.member.username}`} as={`/${this.state.member.username}`}>
                        <a className="name" onClick={this.props.closePopUp}>
                            <React.Fragment>
                                {this.state.member.displayname}
                                {
                                    this.props.pageData.appSettings['member_verification'] == 1 && this.state.member.verified == 1 ?
                                        <span className="verifiedUser" title={Translate(this.props,"verified")}><span className="material-icons" data-icon="check"></span></span>
                                        : null
                                }
                            </React.Fragment>
                        </a>
                    </Link>

                    <div className="member-content">
                        <div className="member-stats">
                        {
                            this.props.pageData.appSettings["users_views"] == "1" ?
                            <span>{`${ShortNumber(this.state.member.view_count ? this.state.member.view_count : 0)}`}{" "}{this.props.t("view_count", { count: this.state.member.view_count ? this.state.member.view_count : 0 })}</span>
                            : null
                        }
                        {
                        this.props.pageData.appSettings["users_views"] == "1" && this.props.pageData.appSettings["users_followers"] == "1" ?
                            <span className="seprater">|</span>
                        : null
                        }
                        {
                        this.props.pageData.appSettings["users_followers"] == "1" ?
                            <span>{`${ShortNumber(this.state.member.follow_count ? this.state.member.follow_count : 0)}`}{" "}{this.props.t("follow_count", { count: this.state.member.follow_count ? this.state.member.follow_count : 0 })}</span>
                        : null
                        }
                        </div>
                        {
                            this.props.pageData.appSettings['users_follow'] == 1 ? 
                                <Subscribe  {...this.props} className="follwbtn" type="members" user={this.state.member} user_id={this.state.member.user_id} />
                        : null
                        }
                        <div className="LikeDislikeWrap">
                            <ul className="LikeDislikeList">
                            {
                            this.props.pageData.appSettings['users_like'] == 1 ? 
                                <li>
                                    <Like icon={true} {...this.props} like_count={this.state.member.like_count} item={this.state.member} type="member" id={this.state.member.user_id} />{"  "}
                                </li>
                                : null
                            }
                            {
                            this.props.pageData.appSettings['users_dislike'] == 1 ? 
                                <li>
                                    <Dislike icon={true} {...this.props} dislike_count={this.state.member.dislike_count} item={this.state.member} type="member" id={this.state.member.user_id} />{"  "}
                                </li>
                                :null
                            }
                            {
                            this.props.pageData.appSettings['users_favourite'] == 1 ? 
                                <li>
                                    <Favourite icon={true} {...this.props} favourite_count={this.state.member.favourite_count} item={this.state.member} type="member" id={this.state.member.user_id} />{"  "}
                                </li>
                                : null
                            }
                            {
                            this.props.pageData.appSettings['users_share'] == 1 ? 
                            <SocialShare {...this.props} hideTitle={true} buttonHeightWidth="30" url={`/${this.state.member.username}`} title={this.state.member.displayname} imageSuffix={this.props.pageData.imageSuffix} media={this.state.member.avtar} />
                                : null
                            }
                            </ul>
                        </div>
                    </div>
                </div>
                :
                <div className="ThumbBox-wrap member-container">
                    <Link href="/member" customParam={`id=${this.state.member.username}`} as={`/${this.state.member.username}`}>
                        <a className="ThumbBox-link" onClick={this.props.closePopUp}>
                            <div className="ThumbBox-coverImg">
                                <span>
                                <Image title={this.state.member.displayname} image={this.state.member.avtar} imageSuffix={this.props.pageData.imageSuffix}  siteURL={this.props.pageData.siteURL} />
                                </span>
                            </div>
                        </a>
                    </Link>
                            <div className="labelBtn">
                            {
                                this.props.pageData.appSettings['users_featuredlabel'] == 1 && this.props.pageData.appSettings['member_featured'] == 1 && this.state.member.is_featured == 1 ?
                                    <span className="lbl-Featured" title={Translate(this.props,"Featured Member")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            {
                                this.props.pageData.appSettings['users_sponsoredLabel'] == 1 && this.props.pageData.appSettings['member_sponsored'] == 1 && this.state.member.is_sponsored == 1 ?
                                    <span className="lbl-Sponsored" title={Translate(this.props,"Sponsored Member")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            {
                                this.props.pageData.appSettings['users_hotLabel'] == 1 && this.props.pageData.appSettings['member_hot'] == 1 && this.state.member.is_hot == 1 ?
                                    <span className="lbl-Hot" title={Translate(this.props,"Hot Member")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            </div>
                            <div className="ThumbBox-Title hide-on-expand">
                                <div className="title ellipsize2Line">
                                    <a className="name m-0">{
                                        <React.Fragment>
                                        {this.state.member.displayname}
                                        {
                                            this.props.pageData.appSettings['member_verification'] == 1 && this.state.member.verified == 1 ?
                                                <span className="verifiedUser" title={Translate(this.props,"verified")}><span className="material-icons" data-icon="check"></span></span>
                                                : null
                                        }
                                    </React.Fragment>
                                    }</a>
                                </div>
                            </div>
                            <div className="ItemDetails">
                                <div className="d-flex justify-content-between VdoTitle ">
                                <Link href="/member" customParam={`id=${this.state.member.username}`} as={`/${this.state.member.username}`}>
                                    <a className="ThumbBox-Title-expand d-flex align-items-center" onClick={this.props.closePopUp}>
                                        <div className="title ellipsize2Line">
                                            <div className="name m-0">
                                            {
                                                <React.Fragment>
                                                {
                                                    this.state.member.displayname
                                                }
                                                {
                                                    this.props.pageData.appSettings['member_verification'] == 1 && this.state.member.verified == 1 ?
                                                        <span className="verifiedUser" title={Translate(this.props,"verified")}><span className="material-icons" data-icon="check"></span></span>
                                                        : null
                                                }
                                                </React.Fragment>
                                            }
                                            </div>
                                        </div>
                                    </a>
                                    </Link>
                                </div>
                                <div className="Vdoinfo d-flex flex-column">
                                    <span className="videoViewDate">
                                    {
                                        this.props.pageData.appSettings["users_views"] == "1" ?
                                        <span>{`${ShortNumber(this.state.member.view_count ? this.state.member.view_count : 0)}`}{" "}{this.props.t("view_count", { count: this.state.member.view_count ? this.state.member.view_count : 0 })}</span>
                                        : null
                                    }
                                    {
                                    this.props.pageData.appSettings["users_views"] == "1" && this.props.pageData.appSettings["users_followers"] == "1" ?
                                        <span className="seprater">|</span>
                                    : null
                                    }
                                    {
                                    this.props.pageData.appSettings["users_followers"] == "1" ?
                                        <span>{`${ShortNumber(this.state.member.follow_count ? this.state.member.follow_count : 0)}`}{" "}{this.props.t("follow_count", { count: this.state.member.follow_count ? this.state.member.follow_count : 0 })}</span>
                                    : null
                                    }
                                    </span>
                                </div>
                                <div className="cn-subscribe">
                                    { 
                                        this.props.pageData.appSettings['users_follow'] == 1 ? 
                                            <Subscribe  {...this.props} hideButton={true} className="subscribe" type="members" user={this.state.member} user_id={this.state.member.user_id} />
                                    : null
                                    }
                                </div>
                                <div className="likeDislike-Wrap mt-2">
                                    <ul className="likeDislike-List">
                                    
                                    {
                                        this.props.pageData.appSettings['users_like'] == 1 ? 
                                        <li>
                                            <Like icon={true} {...this.props} like_count={this.state.member.like_count} item={this.state.member} type="member" id={this.state.member.user_id} />{"  "}
                                        </li>
                                        : null
                                    }
                                    {
                                        this.props.pageData.appSettings['users_dislike'] == 1 ? 
                                        <li>
                                            <Dislike icon={true} {...this.props} dislike_count={this.state.member.dislike_count} item={this.state.member} type="member" id={this.state.member.user_id} />{"  "}
                                        </li>
                                        :null
                                    }
                                    {
                                        this.props.pageData.appSettings['users_favourite'] == 1 ? 
                                        <li>
                                            <Favourite icon={true} {...this.props} favourite_count={this.state.member.favourite_count} item={this.state.member} type="member" id={this.state.member.user_id} />{"  "}
                                        </li>
                                        : null
                                    }
                                    {
                                        this.props.pageData.appSettings['users_share'] == 1 ? 
                                            <SocialShare {...this.props} hideTitle={true} buttonHeightWidth="30" url={`/${this.state.member.username}`} title={this.state.member.displayname} imageSuffix={this.props.pageData.imageSuffix} media={this.state.member.avtar} />
                                            : null
                                    }
                                    </ul>
                                </div>
                            </div>
                        
                </div>     
        )
    }
}

export default Item;