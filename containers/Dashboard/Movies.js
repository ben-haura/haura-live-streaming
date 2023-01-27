import React from "react"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import BrowseMovies from "../Movies/Browse"
import Translate from "../../components/Translate/Index"

class Movies extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type: props.pageData.filter ? props.pageData.filter : "my",
            pagging: props.pageData.items.pagging,
            items: props.pageData.items.results,
            canEdit: props.pageData.canEdit,
            canDelete: props.pageData.canDelete,
            typeItem:props.pageData.type
        }
        this.changeType = this.changeType.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.pageData.filter != prevState.type || nextProps.pageData.type != prevState.typeItem || nextProps.pageData.items.results != prevState.items) {
            return { 
                type: nextProps.pageData.filter, 
                pagging: nextProps.pageData.items.pagging, 
                items: nextProps.pageData.items.results ,
                typeItem:nextProps.pageData.type
            }
        }else{
            return null
        }
    }
    changeType = (e)  => {

        let user = this.props.pageData.user ? `&user=${this.props.pageData.user}` : "";
        let userAs = this.props.pageData.user ? `?user=${this.props.pageData.user}` : "";

        let type = ""
        if(e)
            type = e.target.value
        else
            type = this.state.type

        let subtype = `/dashboard?type=${this.state.typeItem}&filter=${type}${user}`
        let asPath = `/dashboard/${this.state.typeItem}/${type}${userAs}`
        Router.push(
            `${subtype}`,
            `${asPath}`,
        )
    }
    render() {
        let type = this.state.typeItem == "movies" ? "Movies" : "Series"
        const criterials = {}
        criterials["my"] = "My "+type
        criterials["my_recent"] = "Recently Visited "+type
        if (this.props.pageData.appSettings["movie_rating"])
            criterials["rated"] = "My Most Rated "+type
        if (this.props.pageData.appSettings["movie_favourite"])
            criterials["favourited"] = "My Most  Favourite "+type
        if (this.props.pageData.appSettings["movie_comment"])
            criterials["commented"] = "My Most Commented "+type
        criterials["watchlater"] = "Watch Later "+type
        if (this.props.pageData.appSettings["movie_like"])
            criterials["liked"] = "My Most Liked "+type
        if (this.props.pageData.appSettings["movie_dislike"])
            criterials["disliked"] = "My Most Disliked "+type
        criterials["viewed"] = "My Most Viewed "+type
        if (this.props.pageData.appSettings["movie_comment"])
            criterials["my_commented"] = type+" I Commented"
        if (this.props.pageData.appSettings["movie_favourite"])
            criterials["my_favourited"] = type+" I  Favourite"
        if (this.props.pageData.appSettings["movie_like"])
            criterials["my_liked"] = type+" I Liked"
        if (this.props.pageData.appSettings["movie_dislike"])
            criterials["my_disliked"] = type+" I Disliked"
        if (this.props.pageData.appSettings["movie_rating"])
            criterials["my_rated"] = type+" I Rated"

        return (
            <React.Fragment>
                <div>
                    <div className="serachRsltsort">
                        <div className="totalno"></div>
                        <div className="sortby formFields">
                            <div className="form-group sortbys">
                                <span className="lble" style={{ width: "105px" }}>{Translate(this.props,"Criteria")}:</span>
                                <select className="form-control form-select" value={this.state.type} onChange={this.changeType.bind(this)}>
                                    {
                                        Object.keys(criterials).map(function (keyName, keyIndex) {
                                            return <option key={keyName} value={keyName}>{Translate(this.props,criterials[keyName])}</option>
                                        },this)
                                    }
                                </select>
                                {
                                    this.state.type == "my_recent" ? 
                                        <a href="#" className="clear-history" onClick={(e) => {
                                            e.preventDefault();
                                            this.props.clearHistory(this.state.typeItem,this.changeType);
                                        } }>{this.props.t("clear history")}</a>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <BrowseMovies {...this.props} canEdit={this.state.canEdit} canDelete={this.state.canDelete} typeData={this.state.typeItem} movies={this.state.items} pagging={this.state.pagging} contentType={this.state.type} userContent={this.props.pageData.user ? this.props.pageData.user.user_id : 0} />
            </React.Fragment>
        )
    }
}

export default Movies