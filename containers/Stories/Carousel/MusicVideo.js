import React from 'react';

class MusicVideo extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            videoType:props.videoType,
            musicType:props.musicType,
            seemoreValue:"",
            videoExt:props.videoExt,
            isSubmit:props.isSubmit
        }
        this.changeImage = this.changeImage.bind(this)

    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if(nextProps.isSubmit != prevState.isSubmit){
            return {...prevState,isSubmit:nextProps.isSubmit}
        }
        return null;
    }

    changeImage = (picture) => {
        var url = picture.target.value;
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        if (picture.target.files && picture.target.files[0] && (ext === "png" || ext === "jpeg" || ext === "jpg" || ext === 'PNG' || ext === 'JPEG' || ext === 'JPG' || ext === 'gif' || ext === 'GIF')) {
            this.setState({localUpdate:true,imageType:picture.target.files[0]},() => {
                //picture.target.value = "";
            })
        }else{
            alert(this.props.t("Only jpeg,png and gif images are allowed."))
        }
    }
    validateStory = () => {
        if(this.state.isSubmit){
            return;
        }
        if(this.state.videoType && !this.state.imageType && parseInt(this.props.pageData.appSettings["stories_video_image"]) == 1){
            alert(this.props.t("Please select image to upload."))
            return;
        }else if(this.state.musicType && !this.state.imageType && parseInt(this.props.pageData.appSettings["stories_audio_image"]) == 1){
            alert(this.props.t("Please select image to upload."))
            return;
        }
        this.setState({localUpdate:true,isSubmit:true})
        let formData = new FormData();
        let url = '/stories/create/video';
        if(this.state.videoType)
            formData.append("videoStories", this.state.videoType)
        else if(this.state.musicType){
            url = '/stories/create/audio';
            formData.append("audioStories", this.state.musicType)
        }
        if(this.state.imageType)
            formData.append("image", this.state.imageType,this.state.imageType.name);
        formData.append("seemore", this.state.seemoreValue);
        this.props.submitForm(formData,url);
    }
    render() {
        var createObjectURL = (URL || webkitURL || {}).createObjectURL || function(){};
        let updatedWidth = {}

        if(this.state.musicType == "mp3" || this.state.musicType == "wav" || this.state.videoExt == "mp4" || this.state.videoExt == "3gp" || this.state.videoExt == "webp" || this.state.videoExt == "mov"){

        }else{
            updatedWidth.width = "100%"
        }
        return (
            <div className="story-details story-details-create">
                    <div className="story-sidebar">
                        <div className="d-flex align-items-center justify-content-between my-3">
                            <h2 className="heading-sdbar"> {this.props.t("Your Story")} </h2>
                            <a href="#" onClick={(e) => {
                                e.preventDefault();
                                this.props.openSettings()
                            }}> {this.props.t("Setting")}</a>
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
                            <div className="storyText-wrap mt-3">
                                <input type="url" className="storyTextarea form-control" placeholder={this.props.t("See More URL")} onChange={(e) => {
                                    this.setState({seemoreValue:e.target.value})
                                }} value={this.state.seemoreValue}></input>
                            </div>
                            <div className="storyBgimg-wrap mt-3">
                                <div className="title">{this.props.t("Image")}</div>
                                <div className="storyBgApply">
                                    <input type="file" name="image" accept="image/*" onChange={this.changeImage.bind(this)} />
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="storyShare-btnWrap">
                        <div className="storyShare-btnB">
                            <button className="btn btn-secondary" onClick={()=>this.props.discard()}>{this.props.t("Discard")}</button>
                            <button className={`btn ${this.state.isSubmit ? 'btn-secondary' : 'btn-primary'}`} onClick={(e) => {
                                this.validateStory();
                            }}>{this.props.t("Share to Story")}</button>
                        </div>
                    </div>
                    </div>
                    <div className="story-content position-relative">                        
                        <div className="storyDetails-contentWrap">
                            <div className="createstory-content">
                                <div className="storyPreview-wrap">
                                    <div className="storyPreview-innr">
                                        <div className="storyPreview-title">Preview</div>
                                        <div className="storyPreview-conent flex-column">
                                            <div className="storyDetails-cntent" style={{...updatedWidth}}>
                                                <div className="align-items-center d-flex imageBox justify-content-center imageBox">
                                                    {
                                                        this.state.imageType && !this.state.videoType ? 
                                                            <img className="img-fluid position-absolute" src={this.state.imageType ? createObjectURL(this.state.imageType) : ""} />
                                                        : null
                                                    }
                                                    {
                                                        this.state.musicType == "mp3" || this.state.musicType == "wav" ? 
                                                            <audio controls autoPlay={true} loop>
                                                                <source src={this.state.musicType ? createObjectURL(this.state.musicType) : ""} type="audio/mpeg" />
                                                            </audio>
                                                        :
                                                        this.state.videoExt == "mp4" || this.state.videoExt == "3gp" || this.state.videoExt == "webp" || this.state.videoExt == "mov" ? 
                                                            <video style={{width:"100%"}} controls autoPlay={true} playsInline={true} loop>
                                                                <source src={this.state.videoType ? createObjectURL(this.state.videoType) : ""} type="video/mp4" />
                                                            </video>
                                                        :
                                                        this.state.videoType ? 
                                                        <div className="no-content text-center">
                                                            {
                                                                this.props.t("Format not supported for preview, video will be available after video conversion completed on server once story submitted successfully.")
                                                            }
                                                        </div>
                                                        :
                                                        <div className="no-content text-center">
                                                            {
                                                                this.props.t("Format not supported for preview, audio will be available after audio conversion completed on server once story submitted successfully.")
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                       
                    </div>
                </div>
        )

    };

}

export default MusicVideo