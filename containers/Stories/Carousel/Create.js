import React from 'react';
import { connect } from "react-redux";
import dynamic from 'next/dynamic'
import axios from "../../../axios-orders"

const StoryArchive = dynamic(() => {
    return import('./Archive')
});

const MusicVideo = dynamic(() => import("./MusicVideo"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="slider shimmer"> </div>
    </div>
});

const Image = dynamic(() => import("./Image"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="slider shimmer"> </div>
    </div>
});

const Text = dynamic(() => import("./Text"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="slider shimmer"> </div>
    </div>
});

class Create extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            type:null,
            imageType:null,
            privacy:props.pageData.storyPrivacy ? props.pageData.storyPrivacy : "public",
            defaultPrivacy:props.pageData.storyPrivacy ? props.pageData.storyPrivacy : "public"
        }
        this.imageref = React.createRef();
        this.musicref = React.createRef();
        this.videoref = React.createRef();
        this.changeImage = this.changeImage.bind(this)
        this.changeVideo = this.changeVideo.bind(this)
        this.changeMusic = this.changeMusic.bind(this)
        this.openSettings = this.openSettings.bind(this)
    }
    componentDidMount(){
        $("body").addClass("stories-open");
        this.getPrivacy();
        if(this.props.fromDirect){
            this.props.closePopupFirst(true);
        }
    }
    discard = () => {
        if(confirm(this.props.t("Are you sure you want to discard this story? Your story won't be saved."))){
            this.setState({localUpdate:true,type:null,imageType:null});
        }
    }
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    changeMusic = (picture) => {
        var url = picture.target.value;
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        var allowedExtensions = ["mp3","m4a","aac","wav","mp4","wma"];
        if (allowedExtensions.indexOf(ext) === -1) 
        {
            alert(this.props.t('Invalid file Format. Only {{data}} are allowed.',{data:allowedExtensions.join(', ')}));
            return false;
        }else if (picture.target.files && picture.target.files[0]) {

            if( parseInt(this.props.pageData.appSettings['stories_audio_upload']) > 0 && picture.target.files[0].size > parseInt(this.props.pageData.appSettings['stories_audio_upload'])*1000000){
                alert(this.props.t('Maximum upload limit is {{upload_limit}}',{upload_limit:  this.props.pageData.appSettings['stories_audio_upload']+"MB"}));
                return false;
            }

            this.setState({localUpdate:true,type:"music",imageType:picture.target.files[0]},() => {
                picture.target.value = "";
            })
        }
    }
    changeVideo = (picture) => {
        var url = picture.target.value;
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        var allowedExtensions = ['mp4','mov','webm','mpeg','3gp','avi','flv','ogg','mkv','mk3d','mks','wmv'];
        if (allowedExtensions.indexOf(ext) === -1) 
        {
            alert(this.props.t('Invalid file Format. Only {{data}} are allowed.',{data:allowedExtensions.join(', ')}));
            return false;
        }else if (picture.target.files && picture.target.files[0]) {
            if( parseInt(this.props.pageData.appSettings['stories_video_upload']) > 0 && picture.target.files[0].size > parseInt(this.props.pageData.appSettings['stories_video_upload'])*1000000){
                alert(this.props.t('Maximum upload limit is {{upload_limit}}',{upload_limit:  this.props.pageData.appSettings['stories_video_upload']+"MB"}));
                return false;
            }

            this.setState({localUpdate:true,type:"video",imageType:picture.target.files[0],videoExt:ext},() => {
                picture.target.value = "";
            })
        }
    }
    changeImage = (picture) => {
        var url = picture.target.value;
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        if (picture.target.files && picture.target.files[0] && (ext === "png" || ext === "jpeg" || ext === "jpg" || ext === 'PNG' || ext === 'JPEG' || ext === 'JPG' || ext === 'gif' || ext === 'GIF')) {
            this.setState({localUpdate:true,type:"image",imageType:picture.target.files[0]},() => {
                //picture.target.value = "";
            })
        }else{
            alert(this.props.t("Only jpeg,png and gif images are allowed."))
        }
    }
    submitForm = (formData,url) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
       
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                alert(this.props.t("Error uploading story, please try again later."))
                this.setState({isSubmit:false,localUpdate:true})
            }else{
                if(this.props.newDataPosted){
                    this.props.newDataPosted(response.data.story)
                }
                this.props.closePopup('close');
            }
        }).catch(err => {
            alert(this.props.t("Error uploading story, please try again later."))
            this.setState({isSubmit:false,localUpdate:true})
        });
    }
    getPrivacy = () => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/get-privacy';
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                
            }else{
                this.setState({localUpdate:true,defaultPrivacy:response.data.privacy,privacy:response.data.privacy})
            }
        }).catch(err => {
            
        });
    }
    submitPrivacy = (e) => {
        e.preventDefault();
        this.setState({isSubmit:false,localUpdate:true,settingMenu:false,defaultPrivacy:this.state.privacy});
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/privacy';
        formData.append('privacy',this.state.privacy);
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                
            }else{
                
            }
        }).catch(err => {
            
        });
    }
    openSettings = (e) => {
        this.setState({localUpdate:true,settingMenu:true,privacy:this.state.defaultPrivacy})
    }
    render() {
        
        let allowedTypes = this.props.pageData.levelPermissions["stories.allowed_types"]
        let image = null
        let video = null
        let audio = null;
        if(allowedTypes){
            if(allowedTypes.indexOf("video") > -1){
                video = true;
            }
            if(allowedTypes.indexOf("music") > -1){
                audio = true;
            }
            if(allowedTypes.indexOf("image") > -1){
                image = true;
            }
        }

        let type = this.state.type
        let createContentData = null
        if(type == "image"){
            createContentData = <Image {...this.props} openSettings={this.openSettings} isSubmit={this.state.isSubmit} submitForm={this.submitForm} discard={this.discard} imageType={this.state.imageType} />
        }else if(type == "video"){
            createContentData = <MusicVideo {...this.props} openSettings={this.openSettings} isSubmit={this.state.isSubmit} submitForm={this.submitForm} discard={this.discard} videoExt={this.state.videoExt} videoType={this.state.imageType} />
        }else if(type == "music"){
            createContentData = <MusicVideo {...this.props} openSettings={this.openSettings} isSubmit={this.state.isSubmit} submitForm={this.submitForm} discard={this.discard} musicType={this.state.imageType} />
        }else if(type == "text"){
            createContentData = <Text {...this.props} openSettings={this.openSettings} isSubmit={this.state.isSubmit} submitForm={this.submitForm} discard={this.discard} />
        }

        let settings = null;
        if(this.state.settingMenu){
            settings = <div className="popup_wrapper_cnt">
                            <div className="popup_cnt">
                                <div className="comments">
                                    <div className="VideoDetails-commentWrap">
                                        <div className="popup_wrapper_cnt_header">
                                            <h2>{this.props.t("Story Privacy")}</h2>
                                            <a onClick={(e)=>{
                                                this.setState({localUpdate:true,settingMenu:false})
                                            }} className="_close"><i></i></a>
                                        </div>
                                        <div className="stories_privacy">
                                            <form className="formFields px-3" method="post" onSubmit={this.submitPrivacy}>
                                                <div className="form-check">
                                                    <input type="radio" 
                                                    className="form-check-input"
                                                    checked={this.state.privacy === "public"}
                                                    onChange={(e) => {
                                                        this.setState({localUpdate:true,privacy:e.target.value})
                                                    }}
                                                    id="public_pr" name="privacy" value="public" /> 
                                                    <label className="form-check-label" htmlFor="public_pr">{this.props.t("Public")}</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="radio" 
                                                     className="form-check-input"
                                                    checked={this.state.privacy === "onlyme"}
                                                    onChange={(e) => {
                                                        this.setState({localUpdate:true,privacy:e.target.value})
                                                    }}
                                                    id="onlyme_pr" name="privacy" value="onlyme" /> 
                                                    <label className="form-check-label" htmlFor="onlyme_pr">{this.props.t("Only Me")}</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="radio" 
                                                     className="form-check-input"
                                                    checked={this.state.privacy === "follow"}
                                                    onChange={(e) => {
                                                        this.setState({localUpdate:true,privacy:e.target.value})
                                                    }}
                                                    id="foll_pr" name="privacy" value="follow" /> 
                                                    <label className="form-check-label" htmlFor="foll_pr">{this.props.t("People I Follow")}</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="radio"
                                                     className="form-check-input"
                                                    checked={this.state.privacy === "followers"}
                                                    onChange={(e) => {
                                                        this.setState({localUpdate:true,privacy:e.target.value})
                                                    }}
                                                    id="mefoll_pr" name="privacy" value="followers" /> 
                                                    <label className="form-check-label" htmlFor="mefoll_pr">{this.props.t("People Follow Me")}</label>
                                                </div>
                                                <div className="input-group">
                                                    <button type="submit">{this.props.t("Save")}</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
        }

        let archiveStories = null
        if(this.state.archiveStories){
            archiveStories = <StoryArchive {...this.props} closePopup={(e)=>{
                e.preventDefault();
                this.setState({localUpdate:true,archiveStories:false})
            }}></StoryArchive>
        }
        let logo = ""
        if (this.props.pageData.themeMode == "dark") {
            logo = this.props.pageData['imageSuffix'] + this.props.pageData.appSettings['darktheme_logo']
        } else {
            logo = this.props.pageData['imageSuffix'] + this.props.pageData.appSettings['lightheme_logo']
        }
        return (
            <React.Fragment>
                {settings}
                <div className={`story-details`}>
                    <div className='popupHeader'>
                        <div className='HeaderCloseLogo'>
                        <a className='closeBtn' href="#" onClick={(e) => {
                            e.preventDefault();
                            this.props.closePopup(this.props.fromDirect ? "" : "notClose");
                        }}><span className="material-icons">close</span></a>
                            <div className='HeaderCloseLogo-logo'>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    this.props.closePopup(this.props.fromDirect ? "" : "notClose");
                                }}>
                                    <img src={logo} className="img-fluid" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="story-sidebar">
                        <div className="d-flex align-items-center justify-content-between my-3">
                            <h2 className="heading-sdbar"> {this.props.t("Your Story")} </h2>
                            <div className="options">
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    this.setState({localUpdate:true,archiveStories:true})
                                }}> {this.props.t("Archive")}</a>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    this.setState({localUpdate:true,settingMenu:true,privacy:this.state.defaultPrivacy})
                                }}> {this.props.t("Setting")}</a>
                            </div>
                        </div>
                        <div className="storyList">
                            <div className="storyListBox sidebar-scroll">
                                {/* <h3 className="sdTitleStory">{this.props.t("Your story")}</h3> */}
                                <div className="story-users-list">
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault()
                                    }}>
                                        <div className="story-media">
                                            <img src={this.props.pageData.imageSuffix + this.props.pageData.loggedInUserDetails.avtar} alt={this.props.pageData.loggedInUserDetails.displayname} />
                                        </div>
                                        <div className="story-text">
                                            <div className="story-username">{this.props.pageData.loggedInUserDetails.displayname}</div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="story-content position-relative">                        
                        <div className="storyDetails-contentWrap">
                            <div className="createstory-content">
                                <div className="box460330">
                                    {
                                        image ? 
                                    <div className="boxes create-story-photo-box" onClick={(e) => {
                                        this.imageref.current.click();
                                        
                                    }}>
                                    <input className="fileNone" accept="image/*" onChange={this.changeImage.bind(this)}  ref={this.imageref} type="file" />
                                        <div className="icon">
                                            <span className="material-icons">
                                                insert_photo
                                            </span>
                                        </div>
                                        <div className="name">{this.props.t("Create a photo story")}</div>
                                    </div>
                                    : null
                                    }
                                    <div className="boxes create-story-text-box" onClick={(e) => {
                                        this.setState({localUpdate:true,type:"text"})
                                    }}>
                                        <div className="icon">
                                            <span className="material-icons">
                                                text_format
                                            </span>
                                        </div>
                                        <div className="name">{this.props.t("Create a text story")}</div>
                                    </div>
                                    {
                                        video ? 
                                    <div className="boxes create-story-text-box" onClick={(e) => {
                                        this.videoref.current.click();
                                    }}>
                                        <input className="fileNone" onChange={this.changeVideo.bind(this)} accept="video/*"  ref={this.videoref} type="file" />
                                        <div className="icon">
                                            <span className="material-icons">
                                                videocam
                                            </span>
                                        </div>
                                        <div className="name">{this.props.t("Create a video story")}</div>
                                    </div>
                                    : null
                                    }
                                    {
                                        audio ? 
                                            <div className="boxes create-story-text-box" onClick={(e) => {
                                                this.musicref.current.click();
                                            }}>
                                                <input className="fileNone" onChange={this.changeMusic.bind(this)} accept="audio/*"  ref={this.musicref} type="file" />
                                                <div className="icon">
                                                    <span className="material-icons">
                                                        audiotrack
                                                    </span>
                                                </div>
                                                <div className="name">{this.props.t("Create a audio story")}</div>
                                            </div>
                                    : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {createContentData}
                {archiveStories}
            </React.Fragment>
        )
    }

}


export default Create