import React, { Component } from "react"

import Breadcrum from "../../components/Breadcrumb/Form"

import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';

import axios from "../../axios-orders"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import Currency from "../Upgrade/Currency"
import Translate from "../../components/Translate/Index";
class Ads extends Component {
    constructor(props) {
        super(props)

        this.state = {
            editor: false,
            editItem: props.pageData.editItem,
            title: props.pageData.editItem ? "Edit Advertisement" : "Create Advertisement",
            category_id: props.pageData.editItem ? props.pageData.editItem.category_id : null,
            subcategory_id: props.pageData.editItem ? props.pageData.editItem.subcategory_id : null,
            subsubcategory_id: props.pageData.editItem ? props.pageData.editItem.subsubcategory_id : null,
            success: false,
            error: null,
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
            return { 
                editor: false,
                editItem: nextProps.pageData.editItem,
                title: nextProps.pageData.editItem ? "Edit Advertisement" : "Create Advertisement",
                category_id: nextProps.pageData.editItem ? nextProps.pageData.editItem.category_id : null,
                subcategory_id: nextProps.pageData.editItem ? nextProps.pageData.editItem.subcategory_id : null,
                subsubcategory_id: nextProps.pageData.editItem ? nextProps.pageData.editItem.subsubcategory_id : null,
                success: false,
                error: null,
            }
        }
    }
    componentDidUpdate(prevProps,prevState){
        if(this.props.editItem != prevProps.editItem){
            this.empty = true
            this.firstLoaded = false
            this.myRef = React.createRef();
        }
    }
    componentDidMount() {
        this.setState({localUpdate:true,localUpdate:true, editor: true })
        $(document).on('click','.recharge_wallet',function(e){
            e.preventDefault();
            Router.push(`/dashboard?type=ads&recharge=1`, `/dashboard/ads`)
        })
    }

    onSubmit = model => {
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
            return false;
        }
        if (this.state.submitting) {
            return
        }
        let formData = new FormData();
        for (var key in model) {
            formData.append(key, model[key]);
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        let url = '/ads/create';
        if (this.state.editItem) {
            formData.append("fromEdit", 1)
            formData.append("ad_id", this.state.editItem.ad_id)
        }
        this.setState({localUpdate:true,localUpdate:true, submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, this.myRef.current.offsetTop);
                    this.setState({localUpdate:true,localUpdate:true, error: response.data.error, submitting: false });
                } else {
                    Router.push(`/dashboard?type=ads`, `/dashboard/ads`)
                }
            }).catch(err => {
                this.setState({localUpdate:true,localUpdate:true, submitting: false, error: err });
            });
    };

    onCategoryChange = (category_id) => {
        this.setState({localUpdate:true,localUpdate:true, category_id: category_id, subsubcategory_id: 0, subcategory_id: 0 })
    }
    onSubCategoryChange = (category_id) => {
        this.setState({localUpdate:true,localUpdate:true, subcategory_id: category_id, subsubcategory_id: 0 })
    }
    onSubSubCategoryChange = (category_id) => {
        this.setState({localUpdate:true,localUpdate:true, subsubcategory_id: category_id })
    }
    
    render() {
        if(!this.state.editItem && !this.props.pageData.appSettings['video_ffmpeg_path']){
            return <React.Fragment>
                        <Breadcrum {...this.props}  image={this.props.pageData['pageInfo']['banner'] ? this.props.pageData['pageInfo']['banner'] : this.props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} title={`${this.state.editItem ? "Edit" : "Create"} Advertisement`} />          
                        <div className="mainContentWrap">
                            <div className="container">
                            <div className="row">
                                <div className="col-md-12 position-relative">
                                <div className="formBoxtop loginp content-form">
                                    <Form
                                        className="form"
                                        {...this.props}
                                        defaultValues={{}}
                                        validators={{}}
                                        errorMessage={this.props.t("FFMPEG not enabled from admin.{{click_here}} to enable it.",{click_here:"<a class='ffmpeg_enabled' href='"+this.props.pageData.admin_url+"/videos/settings' target='_blank' >"+Translate(this.props,'Click here')+"</a>"})}
                                        submitText={!this.state.submitting ? "Submit" : "Submit..."}
                                        model={[]}
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
        }
        if(!this.state.editItem && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails['wallet'] < 1){
          return  <React.Fragment>
                    <Breadcrum {...this.props}  image={this.props.pageData['pageInfo']['banner'] ? this.props.pageData['pageInfo']['banner'] : this.props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} title={`${this.state.editItem ? "Edit" : "Create"} Advertisement`} />          
                    <div className="mainContentWrap">
                        <div className="container">
                        <div className="row">
                            <div className="col-md-12 position-relative">
                            <div className="formBoxtop loginp content-form">
                                <Form
                                    className="form"
                                    {...this.props}
                                    defaultValues={{}}
                                    validators={{}}
                                    errorMessage={this.props.t("Please recharge your wallet in order to create advertisement.{{click_here}} to recharge your wallet.",{click_here:"<a href='#' class='recharge_wallet'>"+Translate(this.props,'Click here')+"</a>"})}
                                    submitText={!this.state.submitting ? "Submit" : "Submit..."}
                                    model={[]}
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
        }
        let validator = [
            {
                key: "name",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Name is required field"
                    }
                ]
            },

        ]

        let formFields = [
            { key: "name", label: "Name", value: this.state.editItem ? this.state.editItem.name : "" ,isRequired:true},
            { key: "title", label: "Title", value: this.state.editItem ? this.state.editItem.title : "" },
            { key: "description", label: "Description", type: "textarea", value: this.state.editItem ? this.state.editItem.description : "" },
            { key: "url", label: "URL", value: this.state.editItem ? this.state.editItem.url : "" },
        ]


        if (!this.state.editItem) {
            validator.push({
                key: "upload",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Video Media is required field"
                    }
                ]
            })
            formFields.push({
                key: "upload",
                label: "",
                type: "simplefile",
                defaultText: "Drag & Drop Video File Here"
            })
        }

        if (this.props.pageData.adCategories) {
            let categories = []
            categories.push({ key: 0, value: 0, label: "Please Select Category" })
            this.props.pageData.adCategories.forEach(res => {
                categories.push({ key: res.category_id, label: res.title, value: res.category_id })
            })
            formFields.push({
                key: "category_id",
                label: "Category",
                type: "select",
                value: this.state.editItem ? this.state.editItem.category_id : "",
                onChangeFunction: this.onCategoryChange,
                options: categories
            })

            //get sub category
            if (this.state.category_id) {
                let subcategories = []
                this.props.pageData.adCategories.forEach(res => {
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
                        type: "select",
                        value: this.state.editItem ? this.state.editItem.subcategory_id : "",
                        onChangeFunction: this.onSubCategoryChange,
                        options: subcategories
                    })
                    if (this.state.subcategory_id) {
                        let subsubcategories = []
                        this.props.pageData.adCategories.forEach(res => {
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
                                value: this.state.editItem ? this.state.editItem.subsubcategory_id : "",
                                type: "select",
                                onChangeFunction: this.onSubSubCategoryChange,
                                options: subsubcategories
                            });
                        }
                    }
                }
            }
        }
        if (!this.state.editItem) {
            let perclick = {}
            perclick['package'] = { price: this.props.pageData.appSettings['ads_cost_perclick'] }
            let perview = {}
            perview['package'] = { price: this.props.pageData.appSettings['ads_cost_perview'] }

            let typeOptions = []
            typeOptions.push({ key: "1", value: "1", "label": "Pay Per Click (" + Currency({...this.props,...perclick}).replace("<!-- -->","") + ")" })
            typeOptions.push({ key: "2", value: "2", "label": "Pay Per Impression (" + Currency({...this.props,...perview}).replace("<!-- -->","") + ")" })

            formFields.push({
                key: "type",
                label: "Pricing",
                value: this.state.editItem ? this.state.editItem.type : "",
                type: "select",
                options: typeOptions
            });

        }
        if (this.props.pageData.appSettings.video_adult == "1") {
            formFields.push({
                key: "adult",
                label: "Adult",
                type: "select",
                value: this.state.editItem ? this.state.editItem.adult : null,
                onChangeFunction: this.onCategoryChange,
                options: [
                    { key: "", label: "Show this Ad in both Adult and Non-Adult Videos" , value: "" },
                    { key: "1", label: "Show this Ad in Adult Videos only", value: "1" },
                    { key: "0", label: "Show this Ad in Non-Adult Videos only", value: "0" }
                ]
            })
        } 

        let defaultValues = {}
        if (!this.firstLoaded) {
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
            })
            this.firstLoaded = true
        }
        if (this.state.category_id) {
            defaultValues['category_id'] = this.state.category_id
        }
        if (this.state.subcategory_id) {
            defaultValues['subcategory_id'] = this.state.subcategory_id
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
                <Breadcrum {...this.props}  image={this.props.pageData['pageInfo']['banner'] ? this.props.pageData['pageInfo']['banner'] : this.props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} title={`${this.state.editItem ? "Edit" : "Create"} Advertisement`} />          
                <div className="mainContentWrap">
                    <div className="container">
                    <div className="row">
                        <div className="col-md-12 position-relative">
                        <div className="formBoxtop loginp content-form" ref={this.myRef}>
                            <Form
                                empty={empty}
                                //key={this.state.current.id}
                                className="form"
                                {...this.props}
                                //title={this.state.title}
                                defaultValues={defaultValues}
                                validators={validator}
                                generalError={this.state.error}
                                submitText={!this.state.submitting ? "Submit" : "Submit..."}
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
        )
    }
}



export default Ads