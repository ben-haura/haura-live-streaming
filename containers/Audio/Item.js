import React from "react"
import Image from "../Image/Index"

import UserTitle from "../User/Title"
import Link from "../../components/Link/index";

import SocialShare from "../SocialShare/Index"

import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import ShortNumber from "short-number"
import CensorWord from "../CensoredWords/Index"
import Translate from "../../components/Translate/Index";

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            audio: props.audio
        }
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.audio && nextProps.audio != prevState.audio) {
            return { audio: nextProps.audio }
        } else{
            return null
        }
    }
    
    render() {
        let item = this.state.audio
        return (
            <React.Fragment>
                {
                this.props.pageData.appSettings["audio_advgrid"] == 1 ? 
                    <div className="ThumbBox-wrap audio-container">
                        <Link href={`/audio`} customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                            <a className="ThumbBox-link" onClick={this.props.closePopUp}>
                                <div className="ThumbBox-coverImg">
                                    <span>
                                        <Image image={item.image} title={item.title} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                    </span>
                                </div>
                            </a>
                        </Link>     
                                <div className="miniplay">
                                    {
                                        this.props.song_id != item.audio_id || this.props.pausesong_id == item.audio_id ?
                                        <div className="playbtn"  onClick={() => this.props.playSong(item.audio_id,item)}>
                                            <i className="fas fa-play"></i>
                                        </div>
                                        :
                                        <div className="playbtn"  onClick={() => this.props.pauseSong(item.audio_id,item)}>
                                            <i className="fas fa-pause" ></i>
                                        </div>
                                    }
                                </div>
                                <div className="ThumbBox-Title hide-on-expand">
                                    <div className="PlayIcon">
                                        <span className="material-icons-outlined">
                                            play_arrow
                                        </span>
                                    </div>
                                    <div className="title ellipsize2Line">
                                        <h4 className="m-0">{<CensorWord {...this.props} text={item.title} />}</h4>
                                    </div>
                                </div>
                                <div className="ItemDetails">
                                    <div className="d-flex justify-content-between VdoTitle ">
                                    <Link href={`/audio`} customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                                        <a className="ThumbBox-Title-expand d-flex align-items-center" onClick={this.props.closePopUp}>
                                            <div className="PlayIcon">
                                                <span className="material-icons-outlined">
                                                    play_arrow
                                                </span>
                                            </div>
                                            <div className="title ellipsize2Line">
                                                <h4 className="m-0">{<CensorWord {...this.props} text={item.title} />}</h4>
                                            </div>
                                        </a>
                                        </Link>
                                        {
                                            this.props.canDelete || this.props.canEdit ? 
                                        <div className="moreOptions">
                                            <a href="#" className="icon-Dvert" data-bs-toggle="dropdown" aria-expanded="false">
                                                <span className="material-icons">
                                                    more_vert
                                                </span>
                                            </a>

                                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start moreOptionsShow">
                                            {
                                                this.props.canEdit ?
                                                    <li>
                                                        <Link href="/create-audio" customParam={`id=${item.custom_url}`} as={`/create-audio/${item.custom_url}`}>
                                                            <a className="addPlaylist addEdit"  title={Translate (this.props, "Edit")}>
                                                            <span className="material-icons" data-icon="edit"></span>
                                                            {Translate(this.props, "Edit")}
                                                            </a>
                                                        </Link>
                                                    </li>
                                                    : null
                                            }
                                            {
                                                    this.props.canDelete ?
                                                    <li>
                                                        <a className="addPlaylist addDelete" title={Translate(this.props, "Delete")} href="#" onClick={this.deleteAudio}>
                                                        <span className="material-icons" data-icon="delete"></span>
                                                        {Translate(this.props, "Delete")}
                                                        </a>
                                                    </li>
                                                    : null
                                            }
                                            {
                                                this.props.canEdit ?
                                                        <li>
                                                            <a href="#" className="addPlaylist addEdit" onClick={this.analytics} title={Translate(this.props, "Analytics")}>
                                                            <span className="material-icons" data-icon="show_chart"></span>
                                                            {Translate(this.props, "Analytics")}
                                                            </a>
                                                        </li>
                                                    : null
                                            }
                                            <SocialShare {...this.props} buttonHeightWidth="30" tags={item.tags} url={`/audio/${item.custom_url}`} title={CensorWord("fn",this.props,item.title)} imageSuffix={this.props.pageData.imageSuffix} media={item.image} />                                            
                                        </ul>
                                    </div>
                                    : null    
                                    }

                                    </div>
                                    <div className="Vdoinfo d-flex flex-column">
                                        
                                        <UserTitle childPrepend={true}  className="user" data={item} ></UserTitle>
                                        
                                        <span className="videoViewDate">
                                            <span title="play">
                                                <i className="fas fa-play"></i>{" "}
                                                {`${ShortNumber(item.play_count ? item.play_count : 0)}`}{" "}{this.props.t("play_count", { count: item.play_count ? item.play_count : 0 })}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="likeDislike-Wrap mt-2">
                                        <ul className="likeDislike-List">
                                            <li>
                                                <Like icon={true} {...this.props} like_count={item.like_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                            </li>
                                            <li>
                                                <Dislike icon={true} {...this.props} dislike_count={item.dislike_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                            </li>
                                            <li>
                                                <Favourite icon={true} {...this.props} favourite_count={item.favourite_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                            </li>
                                            <SocialShare {...this.props} hideTitle={true} buttonHeightWidth="30" url={`/audio/${item.custom_url}`} title={item.title} imageSuffix={this.props.pageData.imageSuffix} media={item.image} />
                                        </ul>
                                    </div>
                                </div>
                            
                    </div>  
                    :
                    <div key={item.audio_id} className={`${this.props.from_user_profile ? 'adiodiv' : "adiodiv"}`}>
                    <div className="audio-grid">
                        <div className="audioGrid-content">
                            
                                    <div className="audio-track-img">
                                    <Link href={`/audio`} customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                                        <a className="d-block">
                                            <Image image={item.image} title={item.title} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                        </a>
                                    </Link>
                                        <div className="audioPlayBtn-wrap">
                                            {
                                                this.props.song_id != item.audio_id || this.props.pausesong_id == item.audio_id ?
                                                <div className="audioPlayBtn" onClick={() => this.props.playSong(item.audio_id,item)}>
                                                    <i className="fas fa-play"></i>
                                                </div>
                                                :
                                                <div className="audioPlayBtn" onClick={() => this.props.pauseSong(item.audio_id,item)}>
                                                    <i className="fas fa-pause"></i>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div className="audioName">
                                    <Link href={`/audio`} customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                                        <a className="d-block">
                                            <CensorWord {...this.props} text={item.title} />
                                        </a>
                                    </Link>
                                    </div>
                                
                            <UserTitle childPrepend={true}  className="audioUserName d-inline-flex align-items-center user" data={item} ></UserTitle>

                            <div className="LikeDislikeWrap audiolikedisshr mt-3">
                                <ul className="LikeDislikeList">
                                <li>
                                    <Like icon={true} {...this.props} like_count={item.like_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                </li>

                                <li>
                                    <Dislike icon={true} {...this.props} dislike_count={item.dislike_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                </li>
                                <li>
                                    <Favourite icon={true} {...this.props} favourite_count={item.favourite_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                </li>
                                <SocialShare {...this.props} hideTitle={true} buttonHeightWidth="30" url={`/audio/${item.custom_url}`} title={item.title} imageSuffix={this.props.pageData.imageSuffix} media={item.image} />                                
                                <li>
                                    <span title="play">
                                        <i className="fas fa-play"></i>&nbsp;&nbsp;
                                        {`${ShortNumber(item.play_count ? item.play_count : 0)}`}{this.props.t("play_count", { count: item.play_count ? item.play_count : 0 })}
                                    </span>
                                </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }
            </React.Fragment>
        )
    }
}
export default Index