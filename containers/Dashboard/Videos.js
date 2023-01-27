import React from "react"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import BrowseVideos from "../Video/Videos"
import Translate from "../../components/Translate/Index"

class Videos extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type: props.pageData.filter ? props.pageData.filter : "my",
            pagging: props.pageData.items.pagging,
            items: props.pageData.items.results,
            canEdit: props.pageData.canEdit,
            canDelete: props.pageData.canDelete,
        }
        this.changeType = this.changeType.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.pageData.filter != prevState.type || nextProps.pageData.items.results != prevState.items) {
            return { type: nextProps.pageData.filter, pagging: nextProps.pageData.items.pagging, items: nextProps.pageData.items.results }
        }else{
            return null
        }
    }
    changeType(e) {

        let user = this.props.pageData.user ? `&user=${this.props.pageData.user}` : "";
        let userAs = this.props.pageData.user ? `?user=${this.props.pageData.user}` : "";
        let type = ""
        if(e)
            type = e.target.value
        else
            type = this.state.type
        let subtype = `/dashboard?type=videos&filter=${type}${user}`
        let asPath = `/dashboard/videos/${type}${userAs}`
        Router.push(
            `${subtype}`,
            `${asPath}`,
        )
    }
    render() {
        const criterials = {}
        criterials["my"] = "My Videos"
        criterials["my_recent"] = "Recently Visited Videos"
        if (this.props.pageData.appSettings["video_rating"])
            criterials["rated"] = "My Most Rated Videos"
        if (this.props.pageData.appSettings["video_favourite"])
            criterials["favourited"] = "My Most  Favourite Videos"
        if (this.props.pageData.appSettings["video_comment"])
            criterials["commented"] = "My Most Commented Videos"
        criterials["watchlater"] = "Watch Later Videos"
        if (this.props.pageData.appSettings["video_like"])
            criterials["liked"] = "My Most Liked Videos"
        if (this.props.pageData.appSettings["video_dislike"])
            criterials["disliked"] = "My Most Disliked Videos"
        criterials["viewed"] = "My Most Viewed Videos"
        if (this.props.pageData.appSettings["video_comment"])
            criterials["my_commented"] = "Videos I Commented"
        if (this.props.pageData.appSettings["video_favourite"])
            criterials["my_favourited"] = "Videos I  Favourite"
        if (this.props.pageData.appSettings["video_like"])
            criterials["my_liked"] = "Videos I Liked"
        if (this.props.pageData.appSettings["video_dislike"])
            criterials["my_disliked"] = "Videos I Disliked"
        if (this.props.pageData.appSettings["video_rating"])
            criterials["my_rated"] = "Videos I Rated"

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
                                            this.props.clearHistory("videos",this.changeType);
                                        } }>{this.props.t("clear history")}</a>
                                    : null
                                }
                            </div>
                            
                        </div>
                    </div>
                </div> 
                <BrowseVideos classNameP={"container"} {...this.props} canEdit={this.state.canEdit} canDelete={this.state.canDelete} videos={this.state.items} pagging={this.state.pagging} contentType={this.state.type} userContent={this.props.pageData.user ? this.props.pageData.user.user_id : 0} />
            </React.Fragment>
        )
    }
}

export default Videos