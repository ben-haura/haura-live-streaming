import React, { Component } from "react"
import Form from '../../components/DynamicForm/Index'
import { connect } from "react-redux";
import * as actions from '../../store/actions/general';
import Validator from '../../validators';
import axios from "../../axios-orders"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import Translate from "../../components/Translate/Index";
import Currency from "../Upgrade/Currency"
const Countries = dynamic(() => import("./Movies/Countries"), {
    ssr: false
  });
const Seasons = dynamic(() => import("./Movies/Seasons"), {
    ssr: false
  });
const Generes = dynamic(() => import("./Movies/Generes"), {
    ssr: false
  });
const CastnCrew = dynamic(() => import("./Movies/CastnCrew"), {
    ssr: false
  });
const Videos = dynamic(() => import("./Movies/Videos"), {
    ssr: false
  });
const Images = dynamic(() => import("./Movies/Images"), {
    ssr: false
  });
import Link from "../../components/Link/index";


class Movie extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            selectType:props.pageData.selectType ? props.pageData.selectType :  "movie",
            chooseType: props.pageData.tabType ? props.pageData.tabType : "facts",
            firstStep: props.pageData.editItem ? false : true,
            editItem: props.pageData.editItem,
            rent_movies:props.pageData.rent_movies ? true : false,
            error: null,
            movieCategories:props.pageData.movieCategories,
            movie_sell:props.pageData.movie_sell ? true : false,
            movie_rent:props.pageData.movie_rent ? true : false,
            spokenLanguage:props.pageData.spokenLanguage,
            seasons:props.pageData.seasons ? props.pageData.seasons : [],
            images:props.pageData.images ? props.pageData.images : [],
            videos:props.pageData.videos ? props.pageData.videos : [],
            castncrew:props.pageData.castncrew ? props.pageData.castncrew : [],
            generes:props.pageData.generes ? props.pageData.generes : [],
            countries:props.pageData.countries ? props.pageData.countries : [],
            movie_countries:props.pageData.movie_countries ? props.pageData.movie_countries : [],
            width:props.isMobile ? props.isMobile : 993,

            category_id: props.pageData.editItem ? props.pageData.editItem.category_id : null,
            subcategory_id: props.pageData.editItem ? props.pageData.editItem.subcategory_id : null,
            subsubcategory_id: props.pageData.editItem ? props.pageData.editItem.subsubcategory_id : null,
            privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
        }
        this.myRef = React.createRef();
        this.empty = true
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

        
        this.props.socket.on('moviVideoCreated', data => {
            let id = data.id
            let status = data.status
            if(this.state.videos && this.state.videos.length > 0){
            const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.videos]
                    const changedItem = items[itemIndex]
                    changedItem.completed = status
                    this.setState({localUpdate:true, videos: items })
                }
            }
        });

    }
    getItemIndex(item_id) {
        const videos = [...this.state.videos];
        const itemIndex = videos.findIndex(p => p["movie_video_id"] == item_id);
        return itemIndex;
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else {
            return {
                selectType:nextProps.pageData.selectType ? nextProps.pageData.selectType :  "movie",
                width:nextProps.isMobile ? nextProps.isMobile : 993,
                chooseType: nextProps.pageData.tabType ? nextProps.pageData.tabType : "facts",
                editItem: nextProps.pageData.editItem,
                rent_movies:nextProps.pageData.rent_movies ? true : false,
                error: null,
                movie_countries:nextProps.pageData.movie_countries ? nextProps.pageData.movie_countries : [],
                firstStep: nextProps.pageData.editItem ? false : true,
                movieCategories:nextProps.pageData.movieCategories,
                movie_sell:nextProps.pageData.movie_sell ? true : false,
                movie_rent:nextProps.pageData.movie_rent ? true : false,
                spokenLanguage:nextProps.pageData.spokenLanguage,
                seasons:nextProps.pageData.seasons ? nextProps.pageData.seasons : [],
                images:nextProps.pageData.images ? nextProps.pageData.images : [],
                videos:nextProps.pageData.videos ? nextProps.pageData.videos : [],
                castncrew:nextProps.pageData.castncrew ? nextProps.pageData.castncrew : [],
                generes:nextProps.pageData.generes ? nextProps.pageData.generes : [],
                countries:nextProps.pageData.countries ? nextProps.pageData.countries : [],
                
                category_id: nextProps.pageData.editItem ? nextProps.pageData.editItem.category_id : null,
                subcategory_id: nextProps.pageData.editItem ? nextProps.pageData.editItem.subcategory_id : null,
                subsubcategory_id: nextProps.pageData.editItem ? nextProps.pageData.editItem.subsubcategory_id : null,
                privacy: nextProps.pageData.editItem ? nextProps.pageData.editItem.view_privacy : "everyone",
            }
        }
    }
    componentDidUpdate(prevProps,prevState){
        if(this.state.editItem != prevState.editItem){
            this.empty = true
            this.firstLoaded = false
        }
    }
    onSubmit = model => {
        if (this.state.submitting) {
            return
        }
        
        if(this.state.movie_sell && this.props.pageData.appSettings['movie_commission_type']  == 1 && this.props.pageData.appSettings['movie_commission_value'] > 0){
            if(model['price'] && parseFloat(model['price']) > 0){
                if(model['price'] <=  this.props.pageData.appSettings['movie_commission_value']){
                    let perprice = {}
                    perprice['package'] = { price: this.props.pageData.appSettings['movie_commission_value'] }
                    this.setState({localUpdate:true,error:[{message:this.props.t("Price enter must be greater than {{price}}.",{price:Currency({...this.props,...perprice}).replace("<!-- -->","")})}]})
                    return;
                }
            }else{
                model['price'] = 0
            }
        }

        if(this.state.movie_rent && this.props.pageData.appSettings['movie_commission_rent_type']  == 1 && this.props.pageData.appSettings['movie_commission_rent_value'] > 0){
            if(model['rent_price'] && parseFloat(model['rent_price']) > 0){
                if(model['rent_price'] <=  this.props.pageData.appSettings['movie_commission_rent_value']){
                    let perprice = {}
                    perprice['package'] = { price: this.props.pageData.appSettings['movie_commission_rent_value'] }
                    this.setState({localUpdate:true,error:[{message:this.props.t("Rent Price enter must be greater than {{price}}.",{price:Currency({...this.props,...perprice}).replace("<!-- -->","")})}]})
                    return;
                }
            }else{
                model['rent_price'] = 0
            }
        }

        let formData = new FormData();
        for (var key in model) {
            if(key == "movie_release"){
                if(model[key]){
                    formData.append(key, new Date(model[key]).toJSON().slice(0,10));
                }
            }else if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        
        //image
        if (model['image']) {
            let image = typeof model['image'] == "string" ? model['image'] : false
            if (image) {
                formData.append('movieImage', image)
            }
        }
        formData.append("category",this.state.selectType);
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movies/create';
        if (this.state.editItem) {
            url = "/movies/create";
            formData.append("id", this.state.editItem.movie_id)
        }
        let category = this.props.pageData.selectType
        this.setState({localUpdate:true, submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, this.myRef.current.offsetTop);
                    this.setState({localUpdate:true, error: response.data.error, submitting: false });
                } else {
                    if(this.state.editItem){
                        this.setState({submitting:false,localUpdate:true})
                    }else{
                        this.setState({submitting:false,localUpdate:true,firstStep:false,editItem:response.data.editItem,chooseType:"seasons"},() => {
                            if(category == "movie")
                                Router.push(`/create-movie?id=${this.state.editItem.custom_url}`, `/create-movie/${this.state.editItem.custom_url}?type=seasons`,{ shallow: true })
                            else
                                Router.push(`/create-series?id=${this.state.editItem.custom_url}`, `/create-series/${this.state.editItem.custom_url}?type=seasons`,{ shallow: true })
                        })
                    }
                }
            }).catch(err => {
                this.setState({localUpdate:true, submitting: false, error: err });
            });
    };
    chooseType = (type, e) => {
        e.preventDefault()
        if(this.state.firstStep){
            return;
        }
        if(type == this.state.chooseType){
            return;
        }
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            if (this.state.validating) {
                return
            }
            this.empty = true
            this.setState({localUpdate:true, chooseType: type })
            if(this.props.pageData.selectType == "movie")
                Router.push(`/create-movie?id=${this.state.editItem.custom_url}`, `/create-movie/${this.state.editItem.custom_url}?type=${type}`,{ shallow: true })
            else
                Router.push(`/create-series?id=${this.state.editItem.custom_url}`, `/create-series/${this.state.editItem.custom_url}?type=${type}`,{ shallow: true })
        }
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
    
    updateSteps = (state) => {
        let fields = {}
        fields[state.key] = state.value
        fields["localUpdate"] = true
        this.setState(fields);
    }

    changeFilter = (e) => {
        e.preventDefault()
        if(this.state.firstStep){
            return;
        }
        let type = e.target.value
        this.setState({localUpdate:true,chooseType:type})
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
            { key: "title", label: "Title", value: this.state.editItem ? this.state.editItem.title : null ,isRequired:true},
            { key: "description", label: "Description", type: "textarea", value: this.state.editItem ? this.state.editItem.description : null },
            { key: "image", label: "Upload Image", type: "file", value: imageUrl },
        ]



        let groupData0 = []
        if(this.state.movie_sell){
            validator.push({
                key: "price",
                validations: [
                    {
                        "validator": Validator.price,
                        "message": "Please provide valid price"
                    }
                ]
            })
            let postDescription = null
            if(this.props.pageData.appSettings['movie_commission_type']  == 1 && this.props.pageData.appSettings['movie_commission_value'] > 0){
                let perprice = {}
                perprice['package'] = { price: this.props.pageData.appSettings['movie_commission_value'] }
                postDescription = '<div class="form-post-description">' + this.props.t("Price enter must be greater than {{price}}.",{price:Currency({...this.props,...perprice}).replace("<!-- -->","")}) + '</div>'
            }
            groupData0.push({"postDescription":postDescription, key: "price", label: this.state.selectType == "movie" ? "Price (Put 0 for free movies)" :  "Price (Put 0 for free series)", value: this.state.editItem ? this.state.editItem.price : null,isRequired:true })
        }

        if(this.state.movie_rent){
            validator.push({
                key: "rent_price",
                validations: [
                    {
                        "validator": Validator.price,
                        "message": "Please provide valid rent price"
                    }
                ]
            })
            let postDescriptionData = null
            if(this.props.pageData.appSettings['movie_commission_rent_type']  == 1 && this.props.pageData.appSettings['movie_commission_rent_value'] > 0){
                let perprice = {}
                perprice['package'] = { price: this.props.pageData.appSettings['movie_commission_rent_value'] }
                postDescriptionData = '<div class="form-post-description">' + this.props.t("Rent Price enter must be greater than {{price}}.",{price:Currency({...this.props,...perprice}).replace("<!-- -->","")}) + '</div>'
            }
            groupData0.push({"postDescription":postDescriptionData, key: "rent_price", label: this.state.selectType == "movie" ? "Rent Price (Put 0 to disable rent movies)" : "Rent Price (Put 0 to disable rent series)", value: this.state.editItem ? this.state.editItem.rent_price : null,isRequired:true })
        }

        if(groupData0.length > 0){
            formFields.push({
                key:"group_data",
                keyValue:"group_0",
                values:groupData0
            })
        }

        if (this.props.pageData.movieCategories) {
            let categories = []
            categories.push({ key: 0, value: 0, label: "Please Select Category" })
            this.props.pageData.movieCategories.forEach(res => {
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

                this.props.pageData.movieCategories.forEach(res => {
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
                        value: this.state.editItem ? this.state.editItem.subcategory_id : "",
                        type: "select",
                        onChangeFunction: this.onSubCategoryChange,
                        options: subcategories
                    })

                    if (this.state.subcategory_id) {
                        let subsubcategories = []

                        this.props.pageData.movieCategories.forEach(res => {
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
                                value: this.state.editItem ? this.state.editItem.subsubcategory_id : "",
                                onChangeFunction: this.onSubSubCategoryChange,
                                options: subsubcategories
                            });
                        }
                    }
                }
            }
        }

        let groupData1 = []
        let languages = []
        if(this.state.spokenLanguage){
            languages.push({ key: 0, value: 0, label: this.props.t("Please Select Language") })
            this.state.spokenLanguage.forEach(lan => {
                languages.push({ key: lan.code, label: lan.name, value: lan.code })
            })
            groupData1.push({
                key: "language",
                label: "Language",
                type: "select",
                value: this.state.editItem ? this.state.editItem.language : "",
                options: languages
            });
        }

        groupData1.push({
            key: "movie_release",
            label: "Release Date",
            type: "date",
            value: this.state.editItem ? (this.state.editItem.movie_release && this.state.editItem.movie_release != "" ? new Date(this.state.editItem.movie_release.toString()) : "") : new Date(),
        })

        formFields.push({
            key:"group_data",
            keyValue:"group_1",
            values:groupData1
        })


        let groupData2 = []
        validator.push({
            key: "budget",
            validations: [
                {
                    "validator": Validator.price,
                    "message": "Please provide valid budget price"
                }
            ]
        })
        let perpriceB = {}
        perpriceB['package'] = { price: "" }
        groupData2.push({
            key: "budget",
            label: this.props.t("Budget ({{price}})",{price:Currency({...this.props,...perpriceB}).replace("0.00",'')}),
            type: "number",
            value: this.state.editItem  ? this.state.editItem.budget.toString() : "",
        })

        validator.push({
            key: "revenue",
            validations: [
                {
                    "validator": Validator.price,
                    "message": "Please provide valid revenue price"
                }
            ]
        })
        groupData2.push({
            key: "revenue",
            label: this.props.t("Revenue ({{price}})",{price:Currency({...this.props,...perpriceB}).replace("0.00",'')}),
            type: "number",
            value: this.state.editItem  ? this.state.editItem.revenue.toString() : "",
        })

        formFields.push({
            key:"group_data",
            keyValue:"group_2",
            values:groupData2
        })

        formFields.push({
            key: "tags",
            label: "Tags",
            type: "tags",
            value:this.state.editItem && this.state.editItem.tags ? this.state.editItem.tags.split(",") : []
        })

        if (this.props.pageData.appSettings.movie_adult == "1") {
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

        formFields.push({
            key: "search",
            label: "",
            type: "checkbox",
            subtype:"single",
            value: this.state.editItem ? [this.state.editItem.search ? "1" : "0"] : ["1"],
            options: [
                {
                    value: "1", label: this.state.selectType == "movie" ? "Show this movie in search results" : "Show this series in search results", key: "search_1"
                }
            ]
        })

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

        if(this.props.pageData.plans && this.props.pageData.plans.length > 0){
            this.props.pageData.plans.forEach(item => {
                let perprice = {}
                perprice['package'] = { price: item.price }
                privacyOptions.push({
                    value:"package_"+item.member_plan_id,label:this.props.t("Limited to {{plan_title}} ({{plan_price}}) and above",{plan_title:item.title,plan_price:Currency({...this.props,...perprice}).replace("<!-- -->","")}),key:"package_"+item.member_plan_id
                })
            })
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
                key: "password", label: "Password", 'type': "password", value: this.state.editItem ? this.state.editItem.password : "",isRequired:true
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
        if(this.empty){
            formFields.forEach((elem) => {
                if(elem.key == "group_data"){
                    elem.values.forEach((ele) => {
                        if(ele.value)
                            defaultValues[ele.key] = ele.value
                        else
                            defaultValues[ele.key] = ""
                    })
                }else if (elem.value){
                    defaultValues[elem.key] = elem.value
                }else{
                    defaultValues[elem.key] = ""
                }
            })
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
        const options = {}
        options["facts"] = Translate(this.props,"Primary Facts")
        options["seasons"] = Translate(this.props,"Seasons")
        options["images"] = Translate(this.props,"Images")
        options["videos"] = Translate(this.props,"Videos")
        options["castncrew"] = Translate(this.props,"Cast & Crew")
        options["genres"] = Translate(this.props,"Genres")
        options["countries"] = Translate(this.props,"Countries")


        return (
            <React.Fragment>
                {
                    <div className="container-fluid" ref={this.myRef}>
                        <div className="row">
                            <div className="col-lg-2">
                                <div className="sdBarSettBox">
                                    {
                                        this.state.width > 992 ? 
                                    <ul className="nav nav-tabs tabsLeft">
                                        <li>
                                            <a href="#" onClick={this.chooseType.bind(this, "facts")} className={this.state.chooseType == "facts" ? "active" : ""}>
                                                {Translate(this.props,"Primary Facts")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" title={this.state.firstStep ? this.props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={this.chooseType.bind(this, "seasons")} className={this.state.chooseType == "seasons" ? "active" : ""}>
                                                {Translate(this.props,"Seasons")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" title={this.state.firstStep ? this.props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}   onClick={this.chooseType.bind(this, "images")} className={this.state.chooseType == "images" ? "active" : ""}>
                                                {Translate(this.props,"Images")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#"  title={this.state.firstStep ? this.props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={this.chooseType.bind(this, "videos")} className={this.state.chooseType == "videos" ? "active" : ""}>
                                                {Translate(this.props,"Videos")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#"  title={this.state.firstStep ? this.props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={this.chooseType.bind(this, "castncrew")} className={this.state.chooseType == "castncrew" ? "active" : ""}>
                                                {Translate(this.props,"Cast & Crew")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#"  title={this.state.firstStep ? this.props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={this.chooseType.bind(this, "genres")} className={this.state.chooseType == "genres" ? "active" : ""}>
                                                {Translate(this.props,"Genres")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#"  title={this.state.firstStep ? this.props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={this.chooseType.bind(this, "countries")} className={this.state.chooseType == "countries" ? "active" : ""}>
                                                {Translate(this.props,"Countries")}
                                            </a>
                                        </li>
                                    </ul>
                                    : 
                                    <div className="formFields">
                                        <div className="form-group">
                                            <select className="form-control form-select" value={this.state.chooseType} onChange={this.changeFilter}>
                                                {
                                                    Object.keys(options).map(function(key) {
                                                        return (
                                                            <option key={key} value={key}>{options[key]}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                }
                                {
                                    this.state.firstStep ?
                                        <p className="movie_series_tip">
                                        {this.props.t('Save from "Primary Facts" panel in order to enable other menu items.')}
                                        </p>
                                        : null
                                }
                                </div>
                            </div>
                            <div className="col-lg-10 bgSecondry">
                                <div className="tab-content dashboard">
                                {
                                    this.state.editItem && this.state.chooseType == "facts" ? 
                                    <Link href="/watch" customParam={`id=${this.state.editItem.custom_url}`} as={`/watch/${this.state.editItem.custom_url}`}>
                                    <a className="edit-watch-item">
                                        {this.props.t(this.props.pageData.selectType == "movie" ? "Watch Movie" : "Watch Series" )}
                                    </a>
                                    </Link>
                                    : null
                                }
                                {
                                this.state.chooseType == "facts" ?
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
                                : 
                                this.state.chooseType == "seasons" && this.state.editItem ? 
                                    <Seasons {...this.props} updateSteps={this.updateSteps} seasons={this.state.seasons} movie={this.state.editItem} />
                                :this.state.chooseType == "images" && this.state.editItem ? 
                                    <Images {...this.props} updateSteps={this.updateSteps} images={this.state.images} movie={this.state.editItem} />
                                :this.state.chooseType == "videos" && this.state.editItem ? 
                                    <Videos {...this.props} updateSteps={this.updateSteps} seasons={this.state.seasons} videos={this.state.videos} movie={this.state.editItem} />
                                : this.state.chooseType == "castncrew" && this.state.editItem ? 
                                    <CastnCrew {...this.props} updateSteps={this.updateSteps} castncrew={this.state.castncrew} movie={this.state.editItem} />
                                : this.state.chooseType == "genres" && this.state.editItem ? 
                                    <Generes {...this.props} updateSteps={this.updateSteps} generes={this.state.generes} movie={this.state.editItem} />
                                : this.state.chooseType == "countries" && this.state.editItem ?
                                    <Countries {...this.props} updateSteps={this.updateSteps} movie_countries={this.state.movie_countries} countries={this.state.countries} movie={this.state.editItem} />
                                : null
                                }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </React.Fragment>
        )
    }
}


const mapDispatchToProps = dispatch => {
    return {
        setMenuOpen: (status) => dispatch(actions.setMenuOpen(status))
    };
};

export default connect(null, mapDispatchToProps)(Movie);