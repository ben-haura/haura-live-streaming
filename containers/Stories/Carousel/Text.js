import React from 'react';

class Text extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            storiesBackground:props.pageData.storiesBackground && props.pageData.storiesBackground.length > 0 ? props.pageData.storiesBackground : [],
            selectedStoryImage: props.pageData.storiesBackground && props.pageData.storiesBackground.length > 0 ? props.pageData.storiesBackground[0].attachment_id : 0,
            textValue:"",
            seemoreValue:"",
            textColor:"#ffffff",
            isSubmit:props.isSubmit,
            font:"clean"
        }
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
    getImagePath = () => {
        let index = this.getAttachment(this.state.selectedStoryImage);
        if(index > -1){
            let attachment = this.state.storiesBackground[index];
            return this.props.pageData.imageSuffix + attachment.file
        }
        return ""
    }
    getAttachment(id) {
        const attachments = [...this.state.storiesBackground];
        const index = attachments.findIndex(p => p.attachment_id == id);
        return index;
    }
    validateStory = () => {
        if(this.state.isSubmit){
            return;
        }
        if(!this.state.textValue){
            alert(this.props.t("Please select story text."));
            return;
        }
        this.setState({localUpdate:true,isSubmit:true})
        let formData = new FormData();
        let url = '/stories/create/text';
        formData.append("text", this.state.textValue)
        formData.append("seemore", this.state.seemoreValue)
        formData.append("textColor", this.state.textColor)
        formData.append("background", this.state.selectedStoryImage)
        formData.append("font", this.state.font)
        this.props.submitForm(formData,url);
    }
    render() {


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
                                <textarea className="storyTextarea form-control" rows="4" placeholder={this.props.t("Start Typing")} onChange={(e) => {
                                    this.setState({textValue:e.target.value})
                                }} value={this.state.textValue}></textarea>
                            </div>
                            
                            <div className="storyText-wrap mt-3">
                                <input type="url" className="storyTextarea form-control" placeholder={this.props.t("See More URL")} onChange={(e) => {
                                    this.setState({seemoreValue:e.target.value})
                                }} value={this.state.seemoreValue}></input>
                            </div>
                            {
                                this.state.isFont ? 
                                    <div className="storyFont-wrap mt-3">
                                        <select className="form-control" value={this.state.font} onChange={(e) => {
                                            this.setState({localUpdate:true,font:e.target.value})
                                        }}>
                                            <option value="clean">{this.props.t("Clean")}</option>
                                            <option value="simple">{this.props.t("Simple")}</option>
                                            <option value="casual">{this.props.t("Casual")}</option>
                                            <option value="fancy">{this.props.t("Fancy")}</option>
                                            <option value="headline">{this.props.t("Headline")}</option>
                                        </select>
                                    </div>
                            : null
                            }
                            <div className="storyFont-wrap mt-3">
                                <div className="title">{this.props.t("Text color")}</div>
                                <div className="storyBgApply">
                                    <input type="color" value={this.state.textColor} onChange={(e) => {
                                        this.setState({localUpdate:true,textColor:e.target.value})
                                    }} />
                                </div>
                                
                            </div>

                            <div className="storyBgimg-wrap mt-3">
                                <div className="title">{this.props.t("Backgrounds")}</div>
                                <div className="storyBgApply">
                                    {
                                        this.state.storiesBackground.map((story) =>{
                                            
                                            return (
                                                <div key={story.attachment_id} className={`storyBgSelect${this.state.selectedStoryImage == story.attachment_id ? " active" : ""}`} onClick={(e) => {
                                                    this.setState({localUpdate:true,selectedStoryImage:story.attachment_id})
                                                }}>
                                                    <div className="imgbg">
                                                        <img src={this.props.pageData.imageSuffix+story.file} />
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="storyShare-btnWrap">
                        <div className="storyShare-btnB">
                            <button className="btn btn-secondary" onClick={()=>this.props.discard()}>{this.props.t("Discard")}</button>
                            <button  className={`btn ${this.state.isSubmit ? 'btn-secondary' : 'btn-primary'}`} onClick={(e) => {
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
                                        <div className="storyPreview-title">{this.props.t("Preview")}</div>
                                        <div className="storyPreview-conent flex-column">
                                            <div className="storyDetails-cntent">
                                            <div className="imageBox">
                                                <img className="img-fluid" src={this.getImagePath()} />
                                            </div>
                                            <div className="storyText-Content">
                                                <div className="storyText-innr">
                                                    <div className="textShow fontset" style={{color: this.state.textColor}}>
                                                        {
                                                            this.state.textValue != "" ? 
                                                               this.state.textValue : this.props.t("Start Typing")
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
                    </div>
                </div>
        )

    };

}

export default Text