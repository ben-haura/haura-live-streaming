import React from "react"
import Link from "../../components/Link/index";
import CensorWord from "../CensoredWords/Index"
import Translate from "../../components/Translate/Index"
import Rating from "../Rating/Index"
import Currency from "../Upgrade/Currency"
import ShortNumber from "short-number"
import Date from "../Date"

class Info extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            movie:props.movie,
            episode:props.episode,
            seasons:props.seasons
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.movie != prevState.movie || nextProps.movie.rating != prevState.movie.rating || nextProps.episode != prevState.episode) {
           return {
                movie:nextProps.movie,
                episode:nextProps.episode,
                seasons:nextProps.seasons
            }
        } else{
            return null
        }

    }

    render(){

        let perpriceB = {}
        perpriceB['package'] = { price: this.state.movie.budget }
        let perpriceR = {}
        perpriceR['package'] = { price: this.state.movie.revenue }

        return (            
            <React.Fragment>
                {
                    this.state.episode && this.state.seasons ? 
                        <React.Fragment>
                            <div className="tabInTitle">
                                <h6>{Translate(this.props, "Title")}</h6>
                                <div className="owner_name">
                                    <CensorWord {...this.props} text={this.state.episode.title} />
                                </div>
                            </div>
                            {
                                this.state.episode.description ? 
                                    <div className="tabInTitle">
                                        <h6>{Translate(this.props,"Description")}</h6>
                                        <div className="channel_description">
                                            <CensorWord {...this.props} text={this.state.episode.description} />
                                        </div>
                                    </div>
                            : null
                            }
                            <div className="tabInTitle">
                                <h6>{Translate(this.props, "Movie")}</h6>
                                <div className="owner_name">
                                    <Link href="/watch" customParam={`id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}`}>
                                        <a>
                                            <CensorWord {...this.props} text={this.state.movie.title} />
                                        </a>
                                    </Link>
                                </div>
                            </div>
                            <div className="tabInTitle">
                                <h6>{Translate(this.props, "Release Date")}</h6>
                                <div className="owner_name">
                                    {
                                        <span dangerouslySetInnerHTML={{__html:Date(this.props,this.state.episode.release_date,this.props.initialLanguage,'dddd, MMMM Do YYYY',this.props.pageData.defaultTimezone)}}></span>
                                    }
                                </div>
                            </div>
                            <div className="tabInTitle">
                                <h6>{Translate(this.props, "Season")}</h6>
                                <div className="owner_name">
                                    {`S`+this.state.episode.season}
                                </div>
                            </div>
                            <div className="tabInTitle">
                                <h6>{Translate(this.props, "Episode Number")}</h6>
                                <div className="owner_name">
                                    {`E`+this.state.episode.episode_number}
                                </div>
                            </div>
                        </React.Fragment>
                    :
                <React.Fragment>
                    {
                    this.props.pageData.appSettings[`${"movie_rating"}`] == 1 && this.state.movie.approve == 1 ?
                        <div className="tabInTitle">
                            <h6>{Translate(this.props,'Rating')}</h6>
                            <div className="rating">
                                <React.Fragment>
                                    <div className="animated-rater">
                                        <Rating {...this.props} rating={this.state.movie.rating} type="movie" id={this.state.movie.movie_id} />
                                    </div>
                                </React.Fragment>
                            </div>
                        </div>
                    : null
                    }
                    {
                        !this.state.seasons ? 
                            <div className="tabInTitle categories_cnt">
                                <h6>{Translate(this.props,"Watch Now")}</h6>
                                <div className="boxInLink">
                                {
                                   <button className="mWatchBtn" onClick={this.props.watchNow}>{this.props.t("Watch Now")}</button>
                                }
                                </div>
                            </div>
                        : null
                    }
                    {
                        this.state.movie.budget > 0 ? 
                            <div className="tabInTitle">
                                <h6>{this.props.t("Budget")}</h6>
                                <div className="owner_name">
                                    <React.Fragment>
                                    {`${Currency({...this.props,...perpriceB})}`}
                                    </React.Fragment>
                                </div>
                            </div>
                    : null
                    }
                    {
                        this.state.movie.revenue > 0 ? 
                            <div className="tabInTitle">
                                <h6>{this.props.t("Revenue")}</h6>
                                <div className="owner_name">
                                    <React.Fragment>
                                    {`${Currency({...this.props,...perpriceR})}`}
                                    </React.Fragment>
                                </div>
                            </div>
                    : null
                    }
                    {
                        this.state.movie.language_title  ? 
                            <div className="tabInTitle">
                                <h6>{this.props.t("Language")}</h6>
                                <div className="owner_name">
                                    <React.Fragment>
                                    {this.state.movie.language_title}
                                    </React.Fragment>
                                </div>
                            </div>
                    : null
                    }
                    <div className="tabInTitle">
                        <h6>{this.props.t("view_count", { count: this.state.movie.view_count ? this.state.movie.view_count : 0 })}</h6>
                        <div className="owner_name">
                            <React.Fragment>
                            {`${ShortNumber(this.state.movie.view_count ? this.state.movie.view_count : 0)}`}{" "}{this.props.t("view_count", { count: this.state.movie.view_count ? this.state.movie.view_count : 0 })}
                            </React.Fragment>
                        </div>
                    </div>
                    <div className="tabInTitle">
                        <h6>{Translate(this.props, "Release Date")}</h6>
                        <div className="owner_name">
                            {
                                <span dangerouslySetInnerHTML={{__html:Date(this.props,this.state.movie.release_date,this.props.initialLanguage,'dddd, MMMM Do YYYY',this.props.pageData.defaultTimezone)}}></span>
                            }
                        </div>
                    </div>
                    {
                        this.state.movie.categories ?
                        <React.Fragment>
                            <div className="tabInTitle categories_cnt">
                            <h6>{Translate(this.props,"Category")}</h6>
                            <div className="boxInLink">
                            {
                                <Link href={`/category`} customParam={`type=movies-series&id=` + this.state.movie.categories.slug} as={`/movies-series/category/` + this.state.movie.categories.slug}>
                                <a>
                                    {<CensorWord {...this.props} text={this.state.movie.categories.title} />}
                                </a>
                                </Link>
                            }
                            </div>
                            {
                                this.state.movie.subcategory ?
                                <React.Fragment>
                                    {/* <span> >> </span> */}
                                    <div className="boxInLink">
                                    <Link href={`/category`} customParam={`type=movies-series&id=` + this.state.movie.subcategory.slug} as={`/movies-series/category/` + this.state.movie.subcategory.slug}>
                                    <a>
                                        {<CensorWord {...this.props} text={this.state.movie.subcategory.title} />}
                                    </a>
                                    </Link>
                                    </div> 
                                    {
                                    this.state.movie.subsubcategory ?
                                        <React.Fragment>
                                        {/* <span> >> </span> */}
                                        <div className="boxInLink">
                                        <Link href={`/category`} customParam={`type=movies-series&id=` + this.state.movie.subsubcategory.slug} as={`/movies-series/category/` + this.state.movie.subsubcategory.slug}>
                                            <a>
                                            {<CensorWord {...this.props} text={this.state.movie.subsubcategory.title} />}
                                            </a>
                                        </Link>
                                        </div>
                                        </React.Fragment>
                                        : null
                                    }
                                </React.Fragment>
                                : null
                            }
                            
                            </div> 
                        </React.Fragment>
                        : null
                    }
                    {
                        this.state.movie.movie_countries && this.state.movie.movie_countries != "" ?
                        <div className="blogtagListWrap">
                            <div className="tabInTitle">
                            <h6>{Translate(this.props,"Countries")}</h6>
                            <ul className="TabTagList clearfix">
                                {
                                this.state.movie.movie_countries.map(country => {
                                    return (
                                    <li key={country.movie_country_id}>
                                        <Link href={`${this.props.pageData.contentType == "movies" ? "movies" : "series"}`} customParam={`country=${country.country_id}`} as={`/${this.props.pageData.contentType == "movies" ? "movies" : "series"}?country=${country.country_id}`}>
                                        <a>{<CensorWord {...this.props} text={`${country.nicename}`} />}</a>
                                        </Link>
                                    </li>
                                    )
                                })
                                }
                            </ul>
                            </div>
                        </div>
                        : null
                    }
                    {
                        this.state.movie.tags && this.state.movie.tags != "" ?
                        <div className="blogtagListWrap">
                            <div className="tabInTitle">
                            <h6>{Translate(this.props,"Tags")}</h6>
                            <ul className="TabTagList clearfix">
                                {
                                this.state.movie.tags.split(',').map(tag => {
                                    return (
                                    <li key={tag}>
                                        <Link href={`${this.props.pageData.contentType == "movies" ? "movies" : "series"}`} customParam={`tag=${tag}`} as={`/${this.props.pageData.contentType == "movies" ? "movies" : "series"}?tag=${tag}`}>
                                        <a>{<CensorWord {...this.props} text={tag} />}</a>
                                        </Link>
                                    </li>
                                    )
                                })
                                }
                            </ul>
                            </div>
                        </div>
                        : null
                    }
                    {
                        this.state.movie.description ?
                        <React.Fragment>
                            <div className="tabInTitle">
                            <h6>{Translate(this.props,"Description")}</h6>
                            <div className="channel_description">
                                <CensorWord {...this.props} text={this.state.movie.description} />
                            </div>
                            </div>
                        </React.Fragment>
                        : null
                    }
                </React.Fragment>
            }
            </React.Fragment>
        )
    }
}


export default Info