import React from "react"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import Browse from "../Audio/Browse"
import Translate from "../../components/Translate/Index"

class Playlists extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type:props.pageData.filter ? props.pageData.filter : "my",
            pagging:props.pageData.items.pagging,
            items:props.pageData.items.results,
            canEdit:props.pageData.canEdit,
            canDelete:props.pageData.canDelete,
            updateComponent:true
        }
        this.changeType = this.changeType.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if (nextProps.pageData.filter != prevState.type || nextProps.pageData.items.results != prevState.items) {
            return {type:nextProps.pageData.filter,pagging:nextProps.pageData.items.pagging,items:nextProps.pageData.items.results,updateComponent:true}
        }else{
            return {...prevState,updateComponent:false}
        }
    }
    changeType(e){
        let user = this.props.pageData.user ? `&user=${this.props.pageData.user}` : "";
        let userAs = this.props.pageData.user ? `?user=${this.props.pageData.user}` : "";

        let type = ""
        if(e)
            type = e.target.value
        else
            type = this.state.type

        let subtype = `/dashboard?type=audio&filter=${type}${user}`
        let asPath = `/dashboard/audio/${type}${userAs}`
        Router.push(
            `${subtype}`,
            `${asPath}`,
        )
    } 
    render() {
        const criterials = {}
        criterials["my"] = "My Audio"
        criterials["my_recent"] = "Recently Visited Audio"
        if (this.props.pageData.appSettings["audio_rating"])
            criterials["rated"] = "My Most Rated Audio"
        if (this.props.pageData.appSettings["audio_favourite"])
            criterials["favourited"] = "My Most  Favourite Audio"
        if (this.props.pageData.appSettings["audio_comment"])
            criterials["commented"] = "My Most Commented Audio"
        if (this.props.pageData.appSettings["playlist_like"])
            criterials["liked"] = "My Most Liked Audio"
        if (this.props.pageData.appSettings["audio_dislike"])
            criterials["disliked"] = "My Most Disliked Audio"
        criterials["viewed"] = "My Most Viewed Audio"
        if (this.props.pageData.appSettings["audio_comment"])
            criterials["my_commented"] = "Audio I Commented"
        if (this.props.pageData.appSettings["audio_favourite"])
            criterials["my_favourited"] = "Audio I  Favourite"
        if (this.props.pageData.appSettings["audio_like"])
            criterials["my_liked"] = "Audio I Liked"
        if (this.props.pageData.appSettings["audio_dislike"])
            criterials["my_disliked"] = "Audio I Disliked"
        if (this.props.pageData.appSettings["audio_rating"])
            criterials["my_rated"] = "Audio I Rated"

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
                                        Object.keys(criterials).map(function(keyName, keyIndex) {
                                           return <option key={keyName} value={keyName}>{Translate(this.props,criterials[keyName])}</option>
                                        },this)
                                    }
                                </select>
                                {
                                    this.state.type == "my_recent" ? 
                                        <a href="#" className="clear-history" onClick={(e) => {
                                            e.preventDefault();
                                            this.props.clearHistory("audio",this.changeType);
                                        } }>{this.props.t("clear history")}</a>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <Browse {...this.props} canEdit={this.state.canEdit} updateComponent={this.state.updateComponent} search={true} canDelete={this.state.canDelete} audios={this.state.items} pagging={this.state.pagging} contentType={this.state.type} userContent={this.props.pageData.user ? this.props.pageData.user.user_id : 0}  />
            </React.Fragment>
        )
    }
}

export default Playlists