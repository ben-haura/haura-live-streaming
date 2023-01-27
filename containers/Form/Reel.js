import React, { Component } from "react"
import Breadcrum from "../../components/Breadcrumb/Form"
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"
import Router from 'next/router';
import moment from "moment-timezone"

class Reel extends Component {
    constructor(props) {
        super(props)
        
        if(props.chooseVideos){
            props.pageData.editItem = null
        }
        this.state = {
            processing:false,
            percentCompleted:0,
            chooseType: "upload",
            editItem: props.pageData.editItem,
            reelTitle: props.pageData.editItem ? props.pageData.editItem.title : null,
            reelDescription: props.pageData.editItem ? props.pageData.editItem.description : null,
            reelImage: null,
            success: props.pageData.editItem ? true : false,
            error: null,           
            privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
        }
        this.myRef = React.createRef();
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else {
            if(nextProps.chooseVideos){
                nextProps.pageData.editItem = null
            }            
            return {
                processing:false,
                percentCompleted:0,
                chooseType:  "upload",
                editItem: nextProps.pageData.editItem,
                reelTitle: nextProps.pageData.editItem ? nextProps.pageData.editItem.title : null,
                reelDescription: nextProps.pageData.editItem ? nextProps.pageData.editItem.description : null,
                reelImage: null,
                success: nextProps.pageData.editItem ? true : false,
                error: null,
                privacy: nextProps.pageData.editItem ? nextProps.pageData.editItem.view_privacy : "everyone",
            }
        }
    }
    componentDidMount(){
        var _this = this
        
    }
    componentDidUpdate(prevProps,prevState){
        if(this.props.editItem != prevProps.editItem){
            this.empty = true
            this.firstLoaded = false
        }
    }
    onSubmit = model => {
        if (this.state.submitting) {
            return
        }
       

        let formData = new FormData();
        for (var key in model) {
            if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        if (this.state.id) {
            formData.append("id", this.state.id)
            formData.append("videoResolution", this.state.videoWidth)
        }

        
        //image
        if (model['image']) {
            let image = typeof model['image'] == "string" ? model['image'] : false
            if (image) {
                formData.append('reelImage', image)
            }
        }


        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/reels/create';
        if (this.state.editItem) {
            url = "/reels/create";
            formData.append("fromEdit", 1)
            formData.append("id", this.state.editItem.reel_id)
        }
        this.setState({localUpdate:true, submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, this.myRef.current.offsetTop);
                    this.setState({localUpdate:true, error: response.data.error, submitting: false });
                } else {
                    if(this.props.chooseVideos){
                        this.props.chooseVideos()
                    }else{
                        Router.push(`/reel?id=${response.data.reel_id}`, `/reel/${response.data.reel_id}`)
                    }
                }
            }).catch(err => {
                this.setState({localUpdate:true, submitting: false, error: err });
            });
    };
    
    onChangePrivacy = (value) => {
        this.setState({localUpdate:true, privacy: value })
    }
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    uploadMedia = (e) => {
        let res_field = e.name
       var extension = res_field.substr(res_field.lastIndexOf('.') + 1).toLowerCase();
       var allowedExtensions = ['mp4','mov','webm','mpeg','3gp','avi','flv','ogg','mkv','mk3d','mks','wmv'];
       if(!this.props.pageData.appSettings["video_ffmpeg_path"] || this.props.pageData.appSettings["video_ffmpeg_path"] == ""){
            allowedExtensions = ["mp4"]
       }
        if (allowedExtensions.indexOf(extension) === -1) 
        {
            alert(this.props.t('Invalid file Format. Only {{data}} are allowed.',{data:allowedExtensions.join(', ')}));
            return false;
        }else if( parseInt(this.props.pageData.appSettings['reel_video_upload']) > 0 && e.size > parseInt(this.props.pageData.appSettings['reel_video_upload'])*1000000){
            alert(this.props.t('Maximum upload limit is {{upload_limit}}',{upload_limit:this.formatBytes(parseInt(this.props.pageData.appSettings['reel_video_upload'])*1000000)}));
            return false;
        }
        this.onSubmitUploadImport({ "upload": e })
    }
    onSubmitUploadImport = (model) => {
        if (this.state.validating) {
            return
        }
        const formData = new FormData();
        for (var key in model) {
            formData.append(key, model[key]);
        }
        
        var config = {};

        if(key == "upload"){
            config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                    this.setState({localUpdate:true,percentCompleted:percentCompleted,processing:percentCompleted == 100 ? true : false})
                }
            };
        }else{
            config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
        }
        formData.append("type","reel")
        let url = '/reels/' + key;
        if (this.state.isEdit) {
            url = "/reels/create/" + this.state.isEdit;
        }
        this.setState({localUpdate:true, validating: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, this.myRef.current.offsetTop);
                    this.setState({localUpdate:true, error: response.data.error, validating: false });
                } else {
                    this.setState({localUpdate:true, videoWidth: response.data.videoWidth, validating: false, id: response.data.id, success: true, reelTitle: response.data.name, reelImage: response.data.images[0] });
                }
            }).catch(err => {
                this.setState({localUpdate:true, validating: false, error: err });
            });
    }
    render() {

        let validator = [
            {
                key: "title",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Title is required field"
                    }
                ]
            }
        ]

        let imageUrl = null
        if(this.state.editItem && this.state.editItem.image){
            if(this.state.editItem.image.indexOf("http://") == 0 || this.state.editItem.image.indexOf("https://") == 0){
                imageUrl = this.state.editItem.image
            }else{
                imageUrl = this.props.pageData.imageSuffix+this.state.editItem.image
            }
        }
        let formFields = [
            { key: "title", label: "Reel Title", value: this.state.editItem ? this.state.editItem.title : null ,isRequired:true},
            { key: "description", label: "Reel Description", type: "textarea", value: this.state.editItem ? this.state.editItem.description : null }    
        ]

        formFields.push({ key: "image", label: "Upload Reel Image", type: "file", value: imageUrl })
       
        
        let defaultValues = {}
        if (this.state.chooseType) {
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
            })
        }
        if (!this.firstLoaded && (this.state.reelTitle || this.state.reelImage || this.state.reelDescription)) {
            if (this.state.reelTitle) {
                defaultValues['title'] = this.state.reelTitle
            }
            if (this.state.reelImage) {
                defaultValues['image'] = this.state.reelImage
            }
            if (this.state.reelDescription) {
                defaultValues['description'] = this.state.reelDescription
            }
            
            this.firstLoaded = true
        }
        if (this.state.privacy) {
            defaultValues['privacy'] = this.state.privacy
        }
        let validatorUploadImport = []
        let fieldUploadImport = []
        if (this.state.chooseType == "upload" && !this.state.editItem) {
            validatorUploadImport.push({
                key: "upload",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Upload reel is required field."
                    }
                ]
            })
            fieldUploadImport.push({ key: "upload", label: "", type: "video", defaultText: "Drag & Drop Video File Here", onChangeFunction: this.uploadMedia })
        }  
        // if(this.state.editItem && this.state.editItem.scheduled){
        let value = this.state.editItem && this.state.editItem.scheduled && this.state.editItem.scheduled != "" ? new Date(this.state.editItem.scheduled.toString())  : new Date();
        let minDateValue = new Date();
        let dateS = moment(value)

        let currentTime = dateS.isValid() ? dateS.tz(this.props.pageData.defaultTimezone) : null;
        let minDate = moment(minDateValue).tz(this.props.pageData.defaultTimezone).toDate();
        if(currentTime){
            currentTime = currentTime.toDate()
        }
        formFields.push({
            key: "scheduled",
            label: "Schedule Reel",
            type: "datetime", 
            minDate: minDate,
            value:  currentTime
        })
        // }
        let privacyOptions = [
            {
                value: "everyone", label: "Anyone", key: "everyone"
            },
            {
                value: "onlyme", label: "Only me", key: "onlyme"
            },
            {
                value: "link", label: "Only to people who have video link", key: "link"
            }
        ]
        if (this.props.pageData.appSettings.user_follow == "1") {
            privacyOptions.push({
                value: "follow", label: "Only people I follow", key: "follow"
            })
        }
        // if(this.state.plans.length > 0){
        //     this.state.plans.forEach(item => {
        //         let perprice = {}
        //         perprice['package'] = { price: item.price }
        //         privacyOptions.push({
        //             value:"package_"+item.member_plan_id,label:this.props.t("Limited to {{plan_title}} ({{plan_price}}) and above",{plan_title:item.title,plan_price:Currency({...this.props,...perprice})}),key:"package_"+item.member_plan_id
        //         })
        //     })
        // }
        
        formFields.push({
            key: "privacy",
            label: "Privacy",
            type: "select",
            value: this.state.editItem ? this.state.editItem.view_privacy : "everyone",
            onChangeFunction: this.onChangePrivacy,
            options: privacyOptions
        })
        


        var empty = false
        if(this.empty){
            empty = true
            this.empty = false
        }

        
        return (
            <React.Fragment>
                
                {
                    this.state.success ?
                        <React.Fragment>
                            <Breadcrum {...this.props}  image={this.props.pageData['pageInfo']['banner'] ? this.props.pageData['pageInfo']['banner'] : this.props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} title={`${this.state.editItem ? "Edit" : "Create"} Reel`} />
                            <div className="mainContentWrap">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-md-12 position-relative">
                                            <div className="formBoxtop loginp content-form" ref={this.myRef}>
                                                <Form
                                                    className="form"
                                                    defaultValues={defaultValues}
                                                    {...this.props}
                                                    empty={empty}
                                                    generalError={this.state.error}
                                                    validators={validator}
                                                    submitText={!this.state.submitting ? "Submit" : "Submitting..."}
                                                    model={formFields}
                                                    onSubmit={model => {
                                                        this.onSubmit(model);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                        :
                        <div className="videoBgWrap container" ref={this.myRef}>
                            {
                                <div className="user-area">
                                    <div className="container">
                                        <div className="BtnUpld"></div>
                                    </div>
                                </div>
                            }
                            {
                                this.state.chooseType ?
                                    //upload file
                                    <React.Fragment>
                                        <Form
                                            className="form"
                                            videoKey="video"
                                            generalError={this.state.error}
                                            title={ "Upload Video"}
                                            validators={validatorUploadImport}
                                            model={fieldUploadImport}
                                            empty={empty}
                                            submitText={"Fetch Video"}
                                            {...this.props}
                                            percentCompleted={this.state.percentCompleted}
                                            processing={this.state.processing}
                                            textProgress="Video is processing, this may take few minutes."
                                            submitHide={this.state.chooseType == "upload" ? true : false}
                                            loading={this.state.validating ? true : false}
                                            onSubmit={model => {
                                                this.onSubmitUploadImport(model);
                                            }}
                                        />
                                    </React.Fragment>
                                    : null
                            }
                        </div>
                }
            </React.Fragment>
        )
    }
}



export default Reel