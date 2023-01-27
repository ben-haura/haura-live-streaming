import React from "react"
import { connect } from "react-redux";
import dynamic from 'next/dynamic'
import Router from 'next/router';
import Validator from '../../validators';
import Form from '../../components/DynamicForm/Index'
import action from '../../store/actions/general'

const Video = dynamic(() => import("../Video/Browse"), {
    ssr: false
});
const Channel = dynamic(() => import("../Channel/Channels"), {
    ssr: false
});
const Blog = dynamic(() => import("../Blog/Browse"), {
    ssr: false
});
const Playlist = dynamic(() => import("../Playlist/Browse"), {
    ssr: false
});
const Member = dynamic(() => import("../User/Browse"), {
    ssr: false
});
const Audio = dynamic(() => import("../Audio/Browse"), {
    ssr: false
});
const Movie = dynamic(() => import("../Movies/Browse"), {
    ssr: false
});
import Loader from "../LoadMore/Index"
import AdsIndex from "../Ads/Index"

import  Translate  from "../../components/Translate/Index";
class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fromPopup:props.fromPopup,
            title: "Search",
            categories:props.pageData.categories ? props.pageData.categories : props.categories,
            showForm:props.pageData.showForm,
            items: props.pageData.items ? props.pageData.items.results : [],
            pagging: props.pageData.items ? props.pageData.items.pagging : false,
            submitting: false,
            countries:props.pageData.countries,
            languages:props.pageData.spokenLanguage,
            type: props.pageData && props.pageData.type ? props.pageData.type : props.type,
            fields: {
                h: props.pageData && props.pageData.h ? props.pageData.h : "",
                category: props.pageData && props.pageData.category ? props.pageData.category : "",
                sort: props.pageData && props.pageData.sort ? props.pageData.sort : "latest",
                filter: props.pageData && props.pageData.filter ? props.pageData.filter : "",
                country:props.pageData && props.pageData.country ? props.pageData.country : "",
                language:props.pageData && props.pageData.language ? props.pageData.language : "",
            },
            width:props.isMobile ? props.isMobile : 993,
            showFilter:false
        }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.sortChange = this.sortChange.bind(this)
        this.languageChange = this.languageChange.bind(this)
        this.countryChange = this.countryChange.bind(this)
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {
                ...prevState,
                localUpdate:false
            }
        }else if(prevState.items.length == 0 && nextProps.videos && prevState.type == "video"){
            return {
                ...prevState,
                items:nextProps.videos
            }
        }else if(nextProps.searchChanged){
            const fieldsValues = {}
            fieldsValues.h = nextProps.searchValue
            return {
                submitting: false,
                items: [],
                pagging: false,
                fields: fieldsValues,
                categories:nextProps.pageData.categories ? nextProps.pageData.categories : nextProps.categories
            }
        }else if(nextProps.pageData.h && ( nextProps.pageData.items.results != prevState.items || nextProps.pageData.type != prevState.type)){
            const fieldsValues = {}
            fieldsValues['category'] = nextProps.pageData && nextProps.pageData.category ? nextProps.pageData.category : ""
            fieldsValues['h'] = (nextProps.pageData && nextProps.pageData.h ? nextProps.pageData.h : "")
            fieldsValues['sort'] = nextProps.pageData && nextProps.pageData.sort ? nextProps.pageData.sort : "latest"
            fieldsValues['filter'] = nextProps.pageData && nextProps.pageData.filter ? nextProps.pageData.filter : ""
            fieldsValues['language'] = nextProps.pageData && nextProps.pageData.language ? nextProps.pageData.language : ""
            fieldsValues['country'] = nextProps.pageData && nextProps.pageData.country ? nextProps.pageData.country : ""
            return { 
                countries:nextProps.pageData.countries,
                languages:nextProps.pageData.spokenLanguage,
                categories:nextProps.pageData.categories ? nextProps.pageData.categories : nextProps.categories,
                submitting: false,
                showForm:false, 
                items: nextProps.pageData.items ? nextProps.pageData.items.results : "", 
                pagging: nextProps.pageData.items ? nextProps.pageData.items.pagging : "", 
                type: nextProps.pageData.type, 
                fields: fieldsValues 
            }
        } else{
            return null
        }
    }
    componentDidMount(){
        if(this.props.pageData.appSettings["fixed_header"] == 1 && this.props.hideSmallMenu && !this.props.menuOpen){
            this.props.setMenuOpen(true)
         }
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }
    updateWindowDimensions() {
        this.setState({localUpdate:true, width: window.innerWidth });
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    onSubmit = model => {
        let value = model['search']
        const fieldsValues = {}
        fieldsValues.h = value
        this.setState({localUpdate:true,fields:fieldsValues,submitting:false,items:[],pagging:false},() => {
            this.submitForm('',1)
        })
        this.props.changeSearchText(value)
        
    }
    searchSubmit = (e) => {
        e.preventDefault()
        if(this.state.fields.h){
            this.props.changeSearchText(this.state.fields.h)
            this.submitForm()
        }
    }
    changeSearchText = (e) => {
        const fields = { ...this.state.fields }
        fields['h'] = e.target.value
        this.setState({localUpdate:true, fields: fields }, () => {
            
        })

    }
    
    
    componentDidUpdate(prevProps,prevState){
        if(this.props.searchChanged){
            this.props.setSearchChanged(false)
            this.submitForm()
        }
    }
    onCategoryChange = (e) => {
        const fields = { ...this.state.fields }
        fields['category'] = e.target.value
        this.setState({localUpdate:true, fields: fields }, () => {
            this.submitForm()
        })
    }

    changeTitle = (e) => {
        const fields = { ...this.state.fields }
        fields['h'] = e.target.value
        this.setState({localUpdate:true, fields: fields, items: [] }, () => {
            this.submitForm()
        })
    }
    changeSort = (e) => {
        const fields = { ...this.state.fields }
        fields['sort'] = e.target.value
        this.setState({localUpdate:true, fields: fields, items: [] }, () => {
            this.submitForm()
        })
    }
    changeType = (e) => {
        this.setState({localUpdate:true, type: e.target.value, items: [] }, () => {
            this.submitForm(null, true)
        })
    }
    changeFilter = (e) => {
        const fields = { ...this.state.fields }
        fields['filter'] = e.target.value
        this.setState({localUpdate:true, fields: fields, items: [] }, () => {
            this.submitForm()
        })
    }
    submitForm = (e, isType) => {
        if (e)
            e.preventDefault() 
        if (this.state.submitting) {
            return;
        }
        this.setState({localUpdate:true, submitting: true, items: [], pagging: false })
        const values = {}
        for (var key in this.state.fields) {
            if (this.state.fields[key] && this.state.fields[key] != "") {
                let keyName = key
                if (keyName == "sort" && this.state.fields[key] == "latest") { } else
                    values[keyName] = this.state.fields[key]
            }
        }
        
        var queryString = Object.keys(values).map(key => key + '=' + values[key]).join('&');
        
        if (isType) {
            this.setState({localUpdate:true, fields: { sort: "", filter: "", category: "",language:"",country:"" }})
            queryString = "h=" + this.state.fields.h
        }

        
        Router.push(
            `/search?type=${this.state.type}&${queryString}`,
            `/search/${this.state.type}?${queryString}`,
        )
    }
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    sortChange(e) {
        const fields = { ...this.state.fields }
        fields['sort'] = e.target.value
        this.setState({localUpdate:true, fields: fields, items: [] }, () => {
            this.submitForm()
        })

    }
    countryChange(e) {
        const fields = { ...this.state.fields }
        fields['country'] = e.target.value
        this.setState({localUpdate:true, fields: fields, items: [] }, () => {
            this.submitForm()
        })

    }
    languageChange(e) {
        const fields = { ...this.state.fields }
        fields['language'] = e.target.value
        this.setState({localUpdate:true, fields: fields, items: [] }, () => {
            this.submitForm()
        })

    }
    showFilterOption = (e) => {
        e.preventDefault()
        this.setState({localUpdate:true,showFilter:!this.state.showFilter})
    }
    render() {

        if (this.state.showForm) {
            let validator = []

            validator.push({
                key: "search",
                validations: [ 
                    {
                        "validator": Validator.required,
                        "message": "Search is required field"
                    }
                ]
            })
            let formFields = []
            formFields.push(
                { key: "search", label: "", value: "",isRequired:true }
            )
            return (
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <Form
                                    className="form"
                                    title={this.state.title}
                                    validators={validator}
                                    submitText={"Search"}
                                    {...this.props}
                                    model={formFields}
                                    onSubmit={model => {
                                        this.onSubmit(model);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
            )
        }
        let type = this.state.type == "series" ? "movie" : this.state.type
        let charater = this.state.type == "series" ? "serie" : this.state.type
        let sort = {
                latest: 'Latest ' + this.capitalizeFirstLetter(charater + "s"),
                favourite: "Most Favourite " + this.capitalizeFirstLetter(charater + "s"),
                view: "Most Viewed " + this.capitalizeFirstLetter(charater + "s"),
                like: "Most Liked " + this.capitalizeFirstLetter(charater + "s"),
                dislike: "Most Disliked " + this.capitalizeFirstLetter(charater + "s"),
                comment: "Most Commented " + this.capitalizeFirstLetter(charater + "s"),
                rated: "Most Rated " + this.capitalizeFirstLetter(charater + "s")
        }
        let  filter =  {
                verified: "Verified " + this.capitalizeFirstLetter(charater + "s"),
                featured: "Featured " + this.capitalizeFirstLetter(charater + "s"),
                sponsored: "Sponsored " + this.capitalizeFirstLetter(charater + "s"),
                hot: "Hot " + this.capitalizeFirstLetter(charater + "s")
        }

        let sortArray = []
        for (var key in sort) {
            if (key == "latest") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "favourite" && this.props.pageData.appSettings[(this.state.subtype ? this.state.subtype + "_" : "") + type + '_favourite'] == 1) {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "view") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "like" && this.props.pageData.appSettings[(this.state.subtype ? this.state.subtype + "_" : "") + type + '_like'] == "1") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "dislike" && this.props.pageData.appSettings[(this.state.subtype ? this.state.subtype + "_" : "") + type + '_dislike'] == "1") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "rated" && this.props.pageData.appSettings[(this.state.subtype ? this.state.subtype + "_" : "") + type + '_rating'] == "1") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "comment" && this.props.pageData.appSettings[(this.state.subtype ? this.state.subtype + "_" : "") + type + '_comment'] == "1") {
                sortArray.push({ key: key, value: sort[key] })
            }
        }
        const typeArray = []
        for (var key in filter) {
            if (key == "featured" && this.props.pageData.appSettings[(this.state.subtype ? this.state.subtype + "_" : "") + type + '_featured'] == 1) {
                typeArray.push({ key: key, value: filter[key] })
            } else if (key == "sponsored" && this.props.pageData.appSettings[(this.state.subtype ? this.state.subtype + "_" : "") + type + '_sponsored'] == 1) {
                typeArray.push({ key: key, value: filter[key] })
            } else if (key == "hot" && this.props.pageData.appSettings[(this.state.subtype ? this.state.subtype + "_" : "") + type + '_hot'] == 1) {
                typeArray.push({ key: key, value: filter[key] })
            } else if (key == "verified" && (this.state.type == "channel" || this.state.type == "member")) {
                typeArray.push({ key: key, value: filter[key] })
            }
        }
        let categories = this.state.categories

        return (
            <div className={`${this.state.fromPopup ? "" : "global-search-cnt"}`}>
                <div className="user-area">
                    <div className="container">
                        <div className="row">
                            {
                                !this.state.fromPopup ? 
                            <div className="col-lg-2">
                                {
                                    !this.state.fromPopup ? 
                                <div className="sdBarSearchBox">
                                    <div className="title">{Translate(this.props,"Show results for")}</div>
                                    <div className="formFields">
                                        <div className="form-group twoColumns">
                                            <div className="form-check custom-radio">
                                                <input type="radio" onChange={this.changeType.bind(this)} checked={this.state.type == "video"} className="form-check-input" id="video" name="type" value="video" />
                                                <label className="form-check-label" htmlFor="video">{Translate(this.props,"Videos")}</label>
                                                <span className="error"></span>
                                            </div>
                                            <div className="form-check custom-radio">
                                                <input type="radio" className="form-check-input" checked={this.state.type == "member"} onChange={this.changeType.bind(this)} name="type" value="member" id="member" />
                                                <label className="form-check-label" htmlFor="member">{Translate(this.props,"Members")} </label>
                                                <span className="error"></span>
                                            </div>
                                            {
                                                this.props.pageData.appSettings["enable_audio"] == 1 ? 
                                                <div className="form-check custom-radio">
                                                    <input type="radio" className="form-check-input" checked={this.state.type == "audio"} onChange={this.changeType.bind(this)} id="audio" name="type" value="audio" />
                                                    <label className="form-check-label" htmlFor="audio">{Translate(this.props,"Audio")}</label>
                                                    <span className="error"></span>
                                                </div>
                                                : null
                                             }
                                             {
                                                this.props.pageData.appSettings["enable_movie"] == 1 ? 
                                                <React.Fragment>
                                                    <div className="form-check custom-radio">
                                                        <input type="radio" className="form-check-input" checked={this.state.type == "movie"} onChange={this.changeType.bind(this)} id="movie" name="type" value="movie" />
                                                        <label className="form-check-label" htmlFor="movie">{Translate(this.props,"Movies")}</label>
                                                        <span className="error"></span>
                                                    </div>
                                                    <div className="form-check custom-radio">
                                                        <input type="radio" className="form-check-input" checked={this.state.type == "series"} onChange={this.changeType.bind(this)} id="series" name="type" value="series" />
                                                        <label className="form-check-label" htmlFor="series">{Translate(this.props,"Series")}</label>
                                                        <span className="error"></span>
                                                    </div>
                                                </React.Fragment>
                                                
                                                : null
                                             }
                                            {
                                                this.props.pageData.appSettings["enable_channel"] == 1 ? 
                                                    <div className="form-check custom-radio">
                                                        <input type="radio" className="form-check-input" checked={this.state.type == "channel"} onChange={this.changeType.bind(this)} id="channel" name="type" value="channel" />
                                                        <label className="form-check-label" htmlFor="channel">{Translate(this.props,"Channels")}</label>
                                                        <span className="error"></span>
                                                    </div>
                                                : null
                                            }
                                            {
                                                this.props.pageData.appSettings["enable_blog"] == 1 ? 
                                            <div className="form-check custom-radio">
                                                <input type="radio" className="form-check-input" checked={this.state.type == "blog"} onChange={this.changeType.bind(this)} id="blog" name="type" value="blog" />
                                                <label className="form-check-label" htmlFor="blog">{Translate(this.props,"Blogs")}</label>
                                                <span className="error"></span>
                                            </div>
                                            : null
                                            }
                                             {
                                                this.props.pageData.appSettings["enable_playlist"] == 1 ? 
                                                <div className="form-check custom-radio">
                                                    <input type="radio" className="form-check-input" checked={this.state.type == "playlist"} onChange={this.changeType.bind(this)} id="playlist" name="type" value="playlist" />
                                                    <label className="form-check-label" htmlFor="playlist">{Translate(this.props,"Playlists")}</label>
                                                    <span className="error"></span>
                                                </div>
                                                : null
                                             }
                                             
                                        </div>
                                    </div>
                                </div>
                                : null
                                }
                                <div className="sdBarSearchBox">
                                    <div className="title">{Translate(this.props,"Sort By")}:</div>
                                    <div className="formFields">
                                        <div className="form-group twoColumns">
                                                <select onChange={this.sortChange.bind(this)} value={this.state.fields.sort} className="form-control form-select" id="sortbys">
                                                    {
                                                        sortArray.map(sort => {
                                                            return <option key={sort.key} value={sort.key}>{Translate(this.props,sort.value)}</option>
                                                        })
                                                    }
                                                </select>
                                                {
                                                    this.state.width  > 992 && ((categories && categories.length) || typeArray.length > 0 || this.state.countries || this.state.languages) ?
                                                        null
                                                    :
                                                    ((categories && categories.length) || typeArray.length > 0 || this.state.countries || this.state.languages) ? 
                                                        <a className="filter-search global-search-filter" href="#" onClick={this.showFilterOption} title={Translate(this.props,"Search Filters")}>
                                                            <span className="material-icons" data-icon="tune">
                                                                
                                                            </span>{Translate(this.props,'Filter')}
                                                        </a>
                                                    : null
                                                }
                                        </div>
                                    </div>
                                </div>
                                {
                                    (categories && categories.length) || typeArray.length > 0 ?
                                    <React.Fragment>
                                        <div className="sdBarSearchBox" style={{display: this.state.width > 992 ? "" : !this.state.showFilter  ? "none" : "" }}>
                                            <div className="title">{Translate(this.props,"Refine by")}:</div>
                                            {
                                                categories && categories.length ?
                                                    <div className="formFields">
                                                        <span className="subtitle">{Translate(this.props,"Category")}</span>
                                                        <div className="form-group twoColumns">
                                                            <div className="form-check custom-radio">
                                                                <input type="radio" checked={this.state.fields.category == ""} onChange={this.onCategoryChange.bind(this)} className="form-check-input" id="Any" name="catgeory" value="" />
                                                                <label className="form-check-label" htmlFor="Any">{Translate(this.props,"Any")}</label>
                                                            </div>
                                                            {
                                                                categories.map(cat => {
                                                                    return (
                                                                        <div key={cat.category_id} className="form-check custom-radio">
                                                                            <input type="radio" className="form-check-input" checked={this.state.fields.category == cat.category_id} onChange={this.onCategoryChange.bind(this)} id={"category_" + cat.category_id} name="catgeory" value={cat.category_id} />
                                                                            <label className="form-check-label" htmlFor={"category_" + cat.category_id}>{Translate(this.props,cat.title)}</label>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            {
                                                this.state.languages && this.state.languages.length ?
                                                    <div className="formFields">
                                                        <span className="subtitle">{Translate(this.props,"Language")}</span>
                                                        <div className="form-group twoColumns">
                                                            <select onChange={this.languageChange.bind(this)} value={this.state.fields.language} className="form-control form-select" id="language">
                                                                <React.Fragment>
                                                                <option key={0} value={""}></option>
                                                                {
                                                                    this.state.languages.map(language => {
                                                                        return <option key={language.code} value={language.code}>{Translate(this.props,language.name)}</option>
                                                                    })
                                                                }
                                                                </React.Fragment>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            {
                                                this.state.countries && this.state.countries.length ?
                                                    <div className="formFields">
                                                        <span className="subtitle">{Translate(this.props,"Country")}</span>
                                                        <div className="form-group twoColumns">
                                                            <select onChange={this.countryChange.bind(this)} value={this.state.fields.country} className="form-control form-select" id="country">
                                                                <React.Fragment>
                                                                <option key={0} value={""}></option>
                                                                {
                                                                    this.state.countries.map(country => {
                                                                        return <option key={country.id} value={country.id}>{Translate(this.props,country.nicename)}</option>
                                                                    })
                                                                }
                                                                </React.Fragment>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            {
                                                typeArray.length > 0 ?
                                                    <div className="formFields">
                                                        <span className="subtitle">{Translate(this.props,"Type")}</span>
                                                        <div className="form-group twoColumns">
                                                            <div className="form-check custom-radio">
                                                                <input type="radio" className="form-check-input" id="Anyd" checked={this.state.fields.filter == ""} onChange={this.changeFilter.bind(this)} name="filter" value="" />
                                                                <label className="form-check-label" htmlFor="Anyd">{Translate(this.props,"Any")}</label>
                                                                <span className="error"></span>
                                                            </div>
                                                            {
                                                                typeArray.map(types => {
                                                                    return (
                                                                        <div key={types.value} className="form-check custom-radio">
                                                                            <input type="radio" className="form-check-input" checked={this.state.fields.filter == types.key} onChange={this.changeFilter.bind(this)} id={"type_" + types.key} name="filter" value={types.key} />
                                                                            <label className="form-check-label" htmlFor={"type_" + types.key}>{Translate(this.props,types.value)}</label>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                        </div>
                                        </React.Fragment>
                                        : null
                                }
                            </div>
                            : null
                            }
                            <div className={this.state.fromPopup ? "col-lg-12" : "col-lg-10"}>
                                <div className="grid-movies">
                                <React.Fragment>
                                    {
                                        !this.state.fromPopup && this.state.width  < 992 ? 
                                            <div className="search-input">
                                                <input type="text" className="form-control" value={this.state.fields.h} onChange={this.changeSearchText} />
                                                <button type="button" onClick={this.searchSubmit} >{Translate(this.props,'Search')}</button>
                                            </div>
                                        : null
                                    }
                                    {
                                        this.state.submitting ?
                                            <Loader loading={true} />
                                            :
                                            this.state.fromPopup && (!this.state.items || !this.state.items.length) ?
                                                null
                                            :
                                            this.state.type == "video" ?
                                            <Video {...this.props} search={this.state.fields} fromSearch={true} pageData={{...this.props.pageData, videos: this.state.items, pagging: this.state.pagging }} globalSearch={true} />
                                            :
                                            this.state.type == "channel" ?
                                            <Channel {...this.props} search={this.state.fields} channels={this.state.items} pagging={this.state.pagging} globalSearch={true} />
                                            :
                                            this.state.type == "blog" ?
                                            <Blog {...this.props} search={this.state.fields} pageData={{...this.props.pageData, blogs: this.state.items, pagging: this.state.pagging }} globalSearch={true} />
                                            :
                                            this.state.type == "playlist" ?
                                            <Playlist {...this.props} search={this.state.fields} pageData={{...this.props.pageData, playlists: this.state.items, pagging: this.state.pagging }} globalSearch={true} />
                                            :
                                            this.state.type == "audio" ?
                                            <Audio {...this.props} search={this.state.fields} audios={this.state.items} pagging={this.state.pagging} globalSearch={true} />
                                            :
                                            this.state.type == "movie" || this.state.type == "series" ?
                                            <Movie {...this.props} typeData={this.state.type} search={this.state.fields} pageData={{...this.props.pageData, movies: this.state.items, pagging: this.state.pagging }} globalSearch={true} />
                                            :
                                            this.state.items ?
                                            <Member {...this.props} search={this.state.fields} pageData={{...this.props.pageData, members: this.state.items, pagging: this.state.pagging }} globalSearch={true} />
                                            : null
                                    }
                                    </React.Fragment>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        this.props.pageData.appSettings['below_searchform'] ? 
                            <AdsIndex paddingTop="20px" className="below_searchform" ads={this.props.pageData.appSettings['below_searchform']} />
                        : null
                    }
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = dispatch => {
    return {
        changeSearchText: (value) => dispatch(action.changeSearchText(value)),
        setSearchChanged:(status) => dispatch(action.setSearchChanged(status)),
        setMenuOpen: (status) => dispatch(action.setMenuOpen(status)),
    };
};

const mapStateToProps = state => {
    return {
        menuOpen:state.search.menuOpen,
        searchValue: state.search.searchValue,
        searchChanged:state.search.searchChanged
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index)