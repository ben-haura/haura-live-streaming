import React from "react"
import ShortNumber from "short-number"
import Rating from "../Rating/Index"
import TopView from "./TopView"
import Comment from "../Comments/Index"
import Translate from "../../components/Translate/Index"
import Photos from "../Artist/Photos"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import Movies from "./Browse"

class Cast extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            page: 2,
            cast: props.pageData.cast,
            movies: props.pageData.cast_movies ? props.pageData.cast_movies.results : [],
            series: props.pageData.cast_series ? props.pageData.cast_series.results : [],
            moviesPagging: props.pageData.cast_movies ? props.pageData.cast_movies.pagging : false,
            seriesPagging: props.pageData.cast_series ? props.pageData.cast_series.pagging : false,

            photos:props.pageData.photos,
            tabType:props.pageData.tabType ? props.pageData.tabType : "about"
        }
        
    }

    componentDidMount(){
        // this.props.socket.on('ratedItem', data => {
        //     let id = data.itemId
        //     let type = data.itemType
        //     let Statustype = data.type
        //     let rating = data.rating
        //     if (id == this.state.cast.cast_crew_member_id && type == "cast_crew_members") {
        //         const data = this.state.cast
        //         data.rating = rating
        //         this.setState({ cast: data })
        //     }
        // });

        // this.props.socket.on('unwatchlaterMovies', data => {
        //     let id = data.itemId
        //     let ownerId = data.ownerId
        //     const itemIndex = this.getItemIndex(id)
        //     if (itemIndex > -1) {
        //         const items = [...this.state.movies]
        //         const changedItem = {...items[itemIndex]}
        //         if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
        //             changedItem.watchlater_id = null
        //         }
        //         items[itemIndex] = changedItem
        //         this.setState({localUpdate:true, movies: items })
        //     }
        // });
        // this.props.socket.on('watchlaterMovies', data => {
        //     let id = data.itemId
        //     let ownerId = data.ownerId
        //     const itemIndex = this.getItemIndex(id)
        //     if (itemIndex > -1) {
        //         const items = [...this.state.movies]
        //         const changedItem = {...items[itemIndex]}
        //         if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
        //             changedItem.watchlater_id = 1
        //         }
        //         items[itemIndex] = changedItem
        //         this.setState({localUpdate:true, movies: items })
        //     }
        // });
        // this.props.socket.on('unwatchlaterMovies', data => {
        //     let id = data.itemId
        //     let ownerId = data.ownerId
        //     const itemIndex = this.getSeriesItemIndex(id)
        //     if (itemIndex > -1) {
        //         const items = [...this.state.series]
        //         const changedItem = {...items[itemIndex]}
        //         if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
        //             changedItem.watchlater_id = null
        //         }
        //         items[itemIndex] = changedItem
        //         this.setState({localUpdate:true, series: items })
        //     }
        // });
        // this.props.socket.on('watchlaterMovies', data => {
        //     let id = data.itemId
        //     let ownerId = data.ownerId
        //     const itemIndex = this.getSeriesItemIndex(id)
        //     if (itemIndex > -1) {
        //         const items = [...this.state.series]
        //         const changedItem = {...items[itemIndex]}
        //         if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
        //             changedItem.watchlater_id = 1
        //         }
        //         items[itemIndex] = changedItem
        //         this.setState({localUpdate:true, series: items })
        //     }
        // });
    }
    
    getItemIndex(item_id) {
        const movies = [...this.state.movies];
        const itemIndex = movies.findIndex(p => p["movie_id"] == item_id);
        return itemIndex;
    }
    getSeriesItemIndex(item_id) {
        const movies = [...this.state.series];
        const itemIndex = movies.findIndex(p => p["movie_id"] == item_id);
        return itemIndex;
    }
    linkify(inputText) {
        return inputText;
        inputText = inputText.replace(/&lt;br\/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br \/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br&gt;/g, ' <br/>')
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
    
        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank" rel="nofollow">$1</a>');
    
        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>');
    
        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" rel="nofollow">$1</a>');
    
        return replacedText;
    }
    pushTab = (type) => {
        if(this.state.tabType == type){
          return
        }
        this.setState({tabType:type,localUpdate:true})
        Router.push(`/cast-and-crew?id=${this.state.cast.cast_crew_member_id}`, `/cast-and-crew/${this.state.cast.cast_crew_member_id}?type=${type}`,{ shallow: true })
    }
    render() {
        
        return (
            <React.Fragment>
                <TopView {...this.props}  type={this.state.cast.type} cast={this.state.cast} />
                <div className="userDetailsWraps">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="details-tab">
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        <li className="nav-item">
                                            <a className={`nav-link${this.state.tabType == "about" ? " active" : ""}`} onClick={
                                                (e) => { e.preventDefault(); this.pushTab("about") }
                                            } data-bs-toggle="tab" href="#" role="tab" aria-controls="about" aria-selected="true">{Translate(this.props, "About")}</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className={`nav-link${this.state.tabType == "movies" ? " active" : ""}`} onClick={
                                                (e) => { e.preventDefault(); this.pushTab("movies") }
                                            } data-bs-toggle="tab" href="#" role="tab" aria-controls="movies" aria-selected="true">{Translate(this.props, "Movies")}</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className={`nav-link${this.state.tabType == "series" ? " active" : ""}`} onClick={
                                                (e) => { e.preventDefault(); this.pushTab("series") }
                                            } data-bs-toggle="tab" href="#" role="tab" aria-controls="series" aria-selected="true">{Translate(this.props, "Series")}</a>
                                        </li>
                                       
                                        {
                                            this.props.pageData.appSettings[`${"cast_crew_member_comment"}`] == 1 ?
                                                <li className="nav-item">
                                                    <a className={`nav-link${this.state.tabType == "comments" ? " active" : ""}`} onClick={
                                                        (e) => { e.preventDefault(); this.pushTab("comments") }
                                                    } data-bs-toggle="tab" href="#" role="tab" aria-controls="comments" aria-selected="true">{`${Translate(this.props,"Comments")}`}</a>
                                                </li>
                                                : null
                                        }
                                         {
                                            this.state.photos && this.state.photos.results.length > 0 ?
                                                <li className="nav-item">
                                                    <a className={`nav-link${this.state.tabType == "photos" ? " active" : ""}`} onClick={
                                                        (e) => { e.preventDefault(); this.pushTab("photos") }
                                                    } data-bs-toggle="tab" href="#" role="tab" aria-controls="photos" aria-selected="true">{Translate(this.props, "Photos")}</a>
                                                </li>
                                                : null
                                        }
                                    </ul>
                                    <div className="tab-content" id="myTabContent">
                                    <div className={`tab-pane fade${this.state.tabType == "about" ? " active show" : ""}`} id="about" role="tabpanel">
                                            <div className="details-tab-box">
                                                <React.Fragment>
                                                {
                                                    this.props.pageData.appSettings[`cast_crew_member_rating`] == 1 ?
                                                <div className="tabInTitle">
                                                    <h6>{Translate(this.props,'Rating')}</h6>
                                                    <div className="owner_name">
                                                        <React.Fragment>
                                                                <div className="animated-rater rating">
                                                                    <Rating {...this.props} rating={this.state.cast.rating} type="cast_crew_member" id={this.state.cast.cast_crew_member_id} />
                                                                </div>
                                                                
                                                        </React.Fragment>
                                                    </div>
                                                </div>
                                                    : null
                                                }
                                                <div className="tabInTitle">
                                                    <h6>{this.props.t("view_count", { count: this.state.cast.view_count ? this.state.cast.view_count : 0 })}</h6>
                                                    <div className="owner_name">
                                                        <React.Fragment>
                                                        {`${ShortNumber(this.state.cast.view_count ? this.state.cast.view_count : 0)}`}{" "}{this.props.t("view_count", { count: this.state.cast.view_count ? this.state.cast.view_count : 0 })}
                                                        </React.Fragment>
                                                    </div>
                                                </div>
                                                {
                                                    this.state.cast.birthdate ? 
                                                <div className="tabInTitle">
                                                    <h6>{Translate(this.props,"Birth Date")}</h6>
                                                    <div className="owner_name">
                                                        {this.state.cast.birthdate}
                                                    </div>
                                                </div>
                                                : null
                                                }
                                                {
                                                    this.state.cast.deathdate ? 
                                                <div className="tabInTitle">
                                                    <h6>{Translate(this.props,"Death Date")}</h6>
                                                    <div className="owner_name">
                                                        {this.state.cast.deathdate}
                                                    </div>
                                                </div>
                                                : null
                                                }
                                                 {
                                                    this.state.cast.gender ? 
                                                <div className="tabInTitle">
                                                    <h6>{Translate(this.props,"Gender")}</h6>
                                                    <div className="owner_name">
                                                        {this.state.cast.gender}
                                                    </div>
                                                </div>
                                                : null
                                                }
                                                 {
                                                    this.state.cast.birthplace ? 
                                                <div className="tabInTitle">
                                                    <h6>{Translate(this.props,"Birth Place")}</h6>
                                                    <div className="owner_name">
                                                        {this.state.cast.birthplace}
                                                    </div>
                                                </div>
                                                : null
                                                }
                                                {
                                                    this.state.cast.biography ?
                                                    <div className="tabInTitle">
                                                        <h6>{Translate(this.props, "Description")}</h6>
                                                        <div className="channel_description">
                                                        <div className="channel_description" id="VideoDetailsDescp" style={{ ...this.state.styles, whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{__html:this.linkify(this.state.cast.biography)}}></div>
                                                        </div>
                                                    </div>
                                                    : null
                                                }
                                                </React.Fragment>
                                            </div>
                                        </div>
                                        <div className={`tab-pane fade${this.state.tabType == "movies" ? " active show" : ""}`} id="movies" role="tabpanel">
                                            <div className="details-tab-box">
                                                <Movies  contentType="movies" no_user_area={true} is_cast={this.state.cast.cast_crew_member_id} typeData="movies" {...this.props}  movies={this.state.movies} pagging={this.state.moviesPagging}  />
                                            </div>
                                        </div>
                                        <div className={`tab-pane fade${this.state.tabType == "series" ? " active show" : ""}`} id="series" role="tabpanel">
                                            <div className="details-tab-box">
                                                <Movies contentType="series" no_user_area={true} is_cast={this.state.cast.cast_crew_member_id} typeData="series" {...this.props}  movies={this.state.series} pagging={this.state.seriesPagging}  />
                                            </div>
                                        </div>
                                        {
                                            this.props.pageData.appSettings[`${"cast_crew_member_comment"}`] == 1 ?
                                                <div className={`tab-pane fade${this.state.tabType == "comments" ? " active show" : ""}`} id="comments" role="tabpanel">
                                                    <div className="details-tab-box">
                                                        <Comment  {...this.props}  owner_id="artist" hideTitle={true} appSettings={this.props.pageData.appSettings} commentType="cast_crew_member" type="cast_crew_members" comment_item_id={this.state.cast.cast_crew_member_id} />
                                                    </div>
                                                </div>
                                                : null
                                        }
                                        {
                                            this.state.photos && this.state.photos.results.length > 0 ?
                                                <div className={`tab-pane fade${this.state.tabType == "photos" ? " active show" : ""}`} id="photos" role="tabpanel">
                                                    <div className="details-tab-box">
                                                        <Photos  {...this.props}  photos={this.state.photos} cast={this.state.cast} />
                                                    </div>
                                                </div>
                                            : null
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        )
    }
}



export default Cast