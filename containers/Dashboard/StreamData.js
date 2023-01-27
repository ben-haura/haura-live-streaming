import React from "react"
import Form from '../../components/DynamicForm/Index'
import { connect } from 'react-redux';
import Validator from '../../validators';
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index";
import general from '../../store/actions/general';
import Currency from "../Upgrade/Currency"

class Index extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tips: props.pageData.tips ? props.pageData.tips : [{amount:0}],
            previousTips: props.pageData.tips ? props.pageData.tips : [{amount:0}],
            openAddTip:false,
            editItem:props.pageData.editItem ? props.pageData.editItem : null,
            category_id: props.pageData.editItem ? props.pageData.editItem.category_id : null,
            subcategory_id: props.pageData.editItem ? props.pageData.editItem.subcategory_id : null,
            subsubcategory_id: props.pageData.editItem ? props.pageData.editItem.subsubcategory_id : null,
            privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
            member: props.member,
            videoTags: props.pageData.editItem && props.pageData.editItem.tags ? props.pageData.editItem.tags.split(',') : null,
        }
        this.myRef = React.createRef();
    }
    
    componentDidMount(){
        
        var _this = this
        $(document).on('click','.add_tips',function(){
            //
            if(_this.props.pageData && !_this.props.pageData.loggedInUserDetails){
                document.getElementById('loginFormPopup').click();
            }else{
                _this.setState({localUpdate:true,openAddTip:true})
            }
        })
    }
    onCategoryChange = (category_id) => {
        this.setState({localUpdate:true, category_id: category_id, subsubcategory_id: 0, subcategory_id: 0 })
    }
    onSubCategoryChange = (category_id) => {
        this.setState({localUpdate:true, subcategory_id: category_id, subsubcategory_id: 0 })
    }
    onSubSubCategoryChange = (category_id) => {
        this.setState({localUpdate:true, subsubcategory_id: category_id })
    }
    onChangePrivacy = (value) => {
        this.setState({localUpdate:true, privacy: value })
    }
    
    onSubmit = model => {
        if (this.state.submitting) {
            return
        }

        if(this.props.pageData.appSettings['livestreaming_commission_type']  == 1 && this.props.pageData.appSettings['livestreaming_commission_value'] > 0){
            if(model['price'] && parseFloat(model['price']) > 0){
                if(model['price'] <=  this.props.pageData.appSettings['livestreaming_commission_value']){
                    let perprice = {}
                    perprice['package'] = { price: this.props.pageData.appSettings['livestreaming_commission_value'] }
                    this.setState({localUpdate:true,error:[{message:this.props.t("Price enter must be greater than {{price}}.",{price:Currency({...this.props,...perprice}).replace("<!-- -->","")})}]})
                    return;
                }
            }else{
                model['price'] = 0
            }
        }
        
        let formData = new FormData();
        for (var key in model) {
            if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        if(this.state.tips){
            formData.append("tips",JSON.stringify(this.state.tips));
        }
        if(this.state.removeElements){
            formData.append("removeTips",JSON.stringify(this.state.removeElements));
        }
        formData.append("owner_id", this.state.member.user_id)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/create-default';
        
        this.setState({localUpdate:true, submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) { 
                    window.scrollTo(0, this.myRef.current.offsetTop);
                    this.setState({localUpdate:true, error: response.data.error, submitting: false });
                } else {
                    this.setState({ submitting: false,localUpdate:true });
                    this.props.openToast(Translate(this.props,response.data.message), "success");
                }
            }).catch(err => {
                this.setState({localUpdate:true, submitting: false, error: err });
            });
    };
    
    closeTipPopup = () => {
        this.setState({openAddTip:false,localUpdate:true,tips:this.state.previousTips,removeElements:[]})
    }
    
    setAmount = (id,e) => {
        let tips = [...this.state.tips]
        if(!tips[id]){
            let item = {}
            item.amount = e.target.value
            tips.push(item)
        }else{
            tips[id]['amount'] = e.target.value
        }
        this.setState({localUpdate:true,tips:tips});
    }
    addMoreRow = (e) => {
        let row = {}
        row['amount'] = 0
        let tips = [...this.state.tips]
        tips.push(row)
        this.setState({localUpdate:true,tips:tips});
    }
    removeTip = (id,e) => {
        e.preventDefault();
        let tips = [...this.state.tips]
        let removeElements = !this.state.removeElements ? [] : this.state.removeElements
        if(tips[id].defaulttip_id){
            removeElements.push(tips[id].defaulttip_id)
        }
        tips.splice(id, 1);
        this.setState({localUpdate:true, tips: tips,removeElements:removeElements })

    }
    saveTips = (e) => {
        let valid = true
        let tips = [...this.state.tips]
        let perprice = {}
        perprice['package'] = { price: this.props.pageData.appSettings['videotip_commission_value'] }
        tips.forEach((item,index) => {
            if(parseFloat(item.amount) > 0){
                if(parseFloat(this.props.pageData.appSettings['videotip_commission_value']) > 0 && parseInt(this.props.pageData.appSettings['videotip_commission_type']) == 1 && parseFloat(item.amount) <= parseFloat(this.props.pageData.appSettings['videotip_commission_value'])){
                    valid = false
                    item.error = this.props.t("Price enter must be greater than {{price}}.",{price:Currency({...this.props,...perprice}).replace("<!-- -->","")})
                }else{
                    item.error = null
                }
            }else{
                item.error = this.props.t("Enter amount must be greater than {{price}}.",{price : parseFloat(this.props.pageData.appSettings['videotip_commission_value']) > 0 && parseInt(this.props.pageData.appSettings['videotip_commission_type']) == 1 ? Currency({...this.props,...perprice}).replace("<!-- -->","") : 0});
                valid = false;
            }
        })
        let update = {localUpdate:true,tips:tips}
        if(valid){
            update['openAddTip'] = false
            update['previousTips'] = [...tips]
        }
        this.setState(update)
    }
    render(){
        

        let tips = null
        if(this.state.openAddTip){
            let perprice = {}
            perprice['package'] = { price: this.props.pageData.appSettings['videotip_commission_value'] }
            tips = <div className="popup_wrapper_cnt">
                <div className="popup_cnt">
                    <div className="comments">
                        <div className="VideoDetails-commentWrap tip_cnt">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(this.props, "Create Tips")}</h2>
                                <a onClick={this.closeTipPopup} className="_close"><i></i></a>
                            </div>
                            <div className="user_wallet">
                                <div className="row">
                                    <form>
                                        {
                                        parseFloat(this.props.pageData.appSettings['videotip_commission_value']) > 0 && parseInt(this.props.pageData.appSettings['videotip_commission_type']) == 1 ?
                                                <p className="tip_amount_min">{this.props.t("Price enter must be greater than {{price}}.",{price:Currency({...this.props,...perprice}).replace("<!-- -->","")})}</p>
                                            : null
                                        }
                                        {
                                            this.state.tips.length > 0 ? 
                                                this.state.tips.map((item,i) => {
                                                    return (
                                                        <div className="form-group" key={i}>
                                                            <div className="tip_input">
                                                                <input type="number" className="form-control" value={item.amount} disabled={item.defaulttip_id ? true : false} placeholder={Translate(this.props,'Enter Tip Amount')} onChange={this.setAmount.bind(this,i)} />
                                                                {
                                                                    this.state.tips.length > 1 ?
                                                                        <a href="#" onClick={this.removeTip.bind(this,i)} className="remove">{this.props.t("remove")}</a>
                                                                    : null
                                                                }
                                                            </div>
                                                            {
                                                                item.error ?
                                                                    <p className="error">{item.error}</p>
                                                                : null
                                                            }
                                                        </div>
                                                    )     
                                                })
                                            : null
                                        }
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label"></label>
                                            <button type="button" onClick={this.saveTips.bind(this)}>{Translate(this.props, "Save")}</button>
                                            <button type="button" className="add_more_tip" onClick={this.addMoreRow.bind(this)}>{Translate(this.props, "Add More")}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        }

    

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
        let formFields = []
        
        if(this.props.pageData.appSettings['antserver_media_singlekey'] == 1){
            formFields.push(
                { key: "streamURL", label: "RTMP URL", value: "rtmp://"+(this.props.pageData.liveStreamingServerURL ? this.props.pageData.liveStreamingServerURL.replace("https://","").replace("http://","") : "")+`/${this.props.pageData.streamingAppName}`,props:{readOnly: true}},
                { key: "streamKey", label: "Stream Key", value: this.state.member ? this.state.member.streamkey : "",props:{readOnly: true}}
            )
        }

        formFields.push(
            { key: "title", label: "Title", value: this.state.editItem ? this.state.editItem.title : "Live Streaming" ,isRequired:true},
            { key: "description", label: "Description", type: "textarea", value: this.state.editItem ? this.state.editItem.description : "" }    
        )

        //set tip options
        if(parseInt(this.props.pageData.appSettings['video_tip']) == 1){
            formFields.push({ key: "addTips", type:"content",content:"<button class='add_tips' type='button'>"+Translate(this.props,"Add Tips")+"</button>" });
        }

        

        if (this.props.pageData.categoriesVideos) {
            let categories = []
            categories.push({ key: 0, value: 0, label: "Please Select Category" })
            this.props.pageData.categoriesVideos.forEach(res => {
                categories.push({ key: res.category_id, label: res.title, value: res.category_id })
            })
            formFields.push({
                key: "category_id",
                label: "Category",
                type: "select",
                value:  this.state.editItem ? this.state.editItem.category_id : "" ,
                onChangeFunction: this.onCategoryChange,
                options: categories
            })

            //get sub category
            if (this.state.category_id) {
                let subcategories = []

                this.props.pageData.categoriesVideos.forEach(res => {
                    if (res.category_id == this.state.category_id) {
                        if (res.subcategories) {
                            subcategories.push({ key: 0, value: 0, label: "Please Select Sub Category" })
                            res.subcategories.forEach(rescat => {
                                subcategories.push({ key: rescat.category_id, label: rescat.title, value: rescat.category_id })
                            })
                        }
                    }
                })


                if (subcategories.length > 0) {
                    formFields.push({
                        key: "subcategory_id",
                        label: "Sub Category",
                        value: this.state.editItem ? this.state.editItem.subcategory_id : "" ,
                        type: "select",
                        onChangeFunction: this.onSubCategoryChange,
                        options: subcategories
                    })

                    if (this.state.subcategory_id) {
                        let subsubcategories = []

                        this.props.pageData.categoriesVideos.forEach(res => {
                            if (res.category_id == this.state.category_id) {
                                if (res.subcategories) {
                                    res.subcategories.forEach(rescat => {
                                        if (rescat.category_id == this.state.subcategory_id) {
                                            if (rescat.subsubcategories) {
                                                subsubcategories.push({ key: 0, value: 0, label: "Please Select Sub Sub Category" })
                                                rescat.subsubcategories.forEach(ressubcat => {
                                                    subsubcategories.push({ key: ressubcat.category_id, label: ressubcat.title, value: ressubcat.category_id })
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })

                        if (subsubcategories.length > 0) {
                            formFields.push({
                                key: "subsubcategory_id",
                                label: "Sub Sub Category",
                                type: "select",
                                value: this.state.editItem ? this.state.editItem.subsubcategory_id : "" ,
                                onChangeFunction: this.onSubSubCategoryChange,
                                options: subsubcategories
                            });
                        }
                    }
                }
            }
        }
        formFields.push({
            key: "tags",
            label: "Tags",
            type: "tags"
        })

        validator.push({
            key: "price",
            validations: [
                {
                    "validator": Validator.price,
                    "message": "Please provide valid price"
                }
            ]
        })
        formFields.push({ key: "price", label: "Price (Leave empty for free livestreaming)", value: this.state.editItem ? this.state.editItem.price : null,isRequired:true })
        if(this.props.pageData.appSettings['livestreaming_commission_type']  == 1 && this.props.pageData.appSettings['livestreaming_commission_value'] > 0){
            let perprice = {}
            perprice['package'] = { price: this.props.pageData.appSettings['livestreaming_commission_value'] }
            formFields.push({
                key: "price_desc_1",
                type: "content",
                content: '<span>' + this.props.t("Price enter must be greater than {{price}}.",{price:Currency({...this.props,...perprice}).replace("<!-- -->","")}) + '</span>'
            })
        }

        formFields.push({
            key: "enable_chat",
            label: "",
            type: "checkbox",
            subtype:"single",
            value: this.state.editItem ? [this.state.editItem.enable_chat ? "1" : "0"] : ["1"],
            options: [
                {
                    value: "1", label: "Allow chat", key: "allow_chat_1"
                }
            ]
        })

        if (this.props.pageData.appSettings.video_adult == "1") {
            formFields.push({
                key: "adult",
                label: "",
                subtype:"single",
                type: "checkbox",
                value: this.state.editItem ? [this.state.editItem.adult ? "1" : "0"] : ["0"],
                options: [
                    {
                        value: "1", label: "Mark as Adult", key: "adult_1"
                    }
                ]
            })
        }

        

       

        if(this.props.pageData.appSettings['enable_comment_approve'] == 1){
            let comments = []
            comments.push({ value: "1", key: "comment_1", label: "Display automatically" })
            comments.push({ value: "0", key: "comment_0", label: "Don't display until approved" })
            formFields.push({
                key: "comments",
                label: "Comments Setting",
                type: "select",
                value: this.state.editItem  ? this.state.editItem.autoapprove_comments.toString() : "1",
                options: comments
            })
        }
        let privacyOptions = [
            {
                value: "everyone", label: "Anyone", key: "everyone"
            },
            {
                value: "onlyme", label: "Only me", key: "onlyme"
            },
            {
                value: "password", label: "Only people with password", key: "password"
            },
            {
                value: "link", label: "Only to people who have link", key: "link"
            }
        ]

        if (this.props.pageData.appSettings.user_follow == "1") {
            privacyOptions.push({
                value: "follow", label: "Only people I follow", key: "follow"
            })
        }
        if(this.props.pageData.appSettings['whitelist_domain'] == 1){
            privacyOptions.push(
                {
                    value: "whitelist_domain", label: "Whitelist Domain", key: "whitelist_domain"
                }
            )
        }
        formFields.push({
            key: "privacy",
            label: "Privacy",
            type: "select",
            value: this.state.editItem ? this.state.editItem.view_privacy : "everyone",
            onChangeFunction: this.onChangePrivacy,
            options: privacyOptions
        })
        if (this.state.privacy == "password") {
            formFields.push({
                key: "password", label: "Password", 'type': "password", value:  this.state.editItem ? this.state.editItem.password : "",isRequired:true
            })
            validator.push({
                key: "password",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Password is required field"
                    }
                ]
            })
        }
        let defaultValues = {}
        if(!this.firstLoad){
            this.firstLoad = true
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
            })
            if (this.state.videoTags) {
                defaultValues['tags'] = this.state.videoTags
            }
        }
        
        if (this.state.category_id) {
            defaultValues['category_id'] = this.state.category_id
        }
        if (this.state.subcategory_id) {
            defaultValues['subcategory_id'] = this.state.subcategory_id
        }
        if (this.state.privacy) {
            defaultValues['privacy'] = this.state.privacy
        }
        if (this.state.subsubcategory_id) {
            defaultValues['subsubcategory_id'] = this.state.subsubcategory_id
        }
       

        var empty = false
        if(this.empty){
            empty = true
            this.empty = false
        }
        return (
            <React.Fragment>
                 {
                    tips
                }
                <div ref={this.myRef}>
                <Form
                    className="form"
                    title={"Default Stream Data"}
                    defaultValues={defaultValues}
                    {...this.props}
                    empty={empty}
                    generalError={this.state.error}
                    validators={validator}
                    submitText={!this.state.submitting ? "Save Changes" : "Saving Changes..."}
                    model={formFields}
                    onSubmit={model => {
                        this.onSubmit(model);
                    }}
                />
                </div>
            </React.Fragment>
        )
    }

}



const mapDispatchToProps = dispatch => {
    return {
        openToast: (message, typeMessage) => dispatch(general.openToast(message, typeMessage)),
    };
};
export default connect(null, mapDispatchToProps)(Index);