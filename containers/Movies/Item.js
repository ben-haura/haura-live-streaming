import React from "react"
import Image from "../Image/Index"
import Link from "../../components/Link/index";
import SocialShare from "../SocialShare/Index"
import WatchLater from "../WatchLater/Index"
import axios from "../../axios-orders"
import dynamic from 'next/dynamic'
import swal from "sweetalert"
import Translate from "../../components/Translate/Index";
import Analytics from "../Dashboard/StatsAnalytics"
import CensorWord from "../CensoredWords/Index"

class Item extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            movie: props.movie,
            hover:false
        }
    }
    componentDidMount(){
        this.width = window.innerWidth
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (prevState.movie != nextProps.movie) {
           return { movie: nextProps.movie }
        } else{
            return null
        }

    }
    shouldComponentUpdate(nextProps,nextState){
        if(nextProps.movie != this.props.movie || this.state.analytics != nextState.analytics){
            return true
        }
        return false
    }
   
    deleteMovie = (e) => {
        e.preventDefault()
        let message =  Translate(this.props, "Once deleted, you will not be able to recover this!")
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: message,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    let url = "/movies/delete"
                    formData.append('movie_id', this.state.movie.movie_id)
                    axios.post(url, formData)
                        .then(response => {
                        }).catch(err => {
                            swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    analytics = ( e) => {
        e.preventDefault()
        this.setState({localUpdate:true, analytics: true })
    }
    closePopup = (e) => {
        this.setState({localUpdate:true, analytics: false })
    }
    
    render() {
        

        let analyticsData = null
        if (this.state.analytics) { 
            analyticsData = <div className="popup_wrapper_cnt">
                <div className="popup_cnt" style={{ maxWidth: "60%" }}>
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(this.props, "Analytics")}</h2>
                                <a onClick={this.closePopup} className="_close"><i></i></a>
                            </div>
                            <Analytics {...this.props} id={this.state.movie.movie_id} type="movies" />
                        </div>
                    </div>
                </div>
            </div>
        }


        let movieImage = this.state.movie.image
        
        
        let metaData = []

        if(this.state.movie.language_title){
            metaData.push(this.state.movie.language_title)
        }
        if(this.state.movie.category_title){
            metaData.push(this.state.movie.category_title)
        }
        if(this.state.movie.release_year){
            metaData.push(this.state.movie.release_year)
        }


        return (
            
            <React.Fragment>
                {analyticsData}
                {
                    this.props.pageData.appSettings.movie_advanced_grid != 1 ? 
                <div className="ptv_movieList_wrap">
                    <div className="movieList_thumb">
                        <Link href="/watch" customParam={`id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}`}>
                            <a className="ImgBlockRatio-img imgblock" onClick={this.props.closePopUp}>
                                <span>
                                    <Image className="img" title={CensorWord("fn",this.props,this.state.movie.title)} image={movieImage} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                </span>
                            </a>
                        </Link> 
                        <div className="btnHover">
                            <WatchLater className="watchlater" typeWatchLater="movie-series" icon={true} {...this.props} item={this.state.movie} id={this.state.movie.movie_id} />
                            <SocialShare className="share" aTagDirect={true} hideTitle={true} {...this.props} buttonHeightWidth="30" tags={this.state.movie.tags} url={`/watch/${this.state.movie.custom_url}`} title={CensorWord("fn",this.props,this.state.movie.title)} imageSuffix={this.props.pageData.imageSuffix} media={this.state.movie.image} />
                        </div>

                        <div className="playBtn">
                            <Link href="/watch" customParam={`id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}`}>
                                <a  onClick={this.props.closePopUp}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        fill="white" width="36px" height="36px" className="playicon">
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                        <path
                                            d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z">
                                        </path>
                                    </svg>
                                </a>
                            </Link>
                        </div>
                        <div className="labelBtn">
                            
                            {
                                this.state.movie.is_featured == 1 ?
                                <span className="lbl-Featured" title={Translate(this.props, "Featured")}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>
                                : null
                            }
                                    {
                            this.state.movie.is_sponsored == 1 ?
                                <span className="lbl-Sponsored" title={Translate(this.props, "Sponsored")}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>
                                : null
                        }
                        {
                            this.state.movie.is_hot == 1 ?
                                <span className="lbl-Hot" title={Translate(this.props, "Hot")}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>
                                : null
                        }
                        </div>
                        {
                            this.state.movie.purchaseStatus ? 
                            <div className="purchase-status">
                                <span className={this.state.movie.purchaseStatus}>
                                    {this.state.movie.purchaseStatus}
                                </span>
                            </div>
                            : null
                        }
                    </div>
                    <div className="movieList_content">
                        <div className="movieTitle">
                        <Link href="/watch" customParam={`id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}`}>
                            <a onClick={this.props.closePopUp}>
                                <CensorWord {...this.props} text={this.state.movie.title} />
                            </a>
                        </Link>
                        {
                                this.props.canDelete || this.props.canEdit ? 
                            <div className="dropdown TitleRightDropdown">
                                <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_vert"></span></a>
                                <ul className="dropdown-menu dropdown-menu-right edit-options">
                                    {
                                        this.props.canEdit ?
                                            <li>
                                                {
                                                    this.state.movie.category == "movie" ? 
                                                    <Link href="/create-movie" customParam={`id=${this.state.movie.custom_url}`} as={`/create-movie/${this.state.movie.custom_url}`}>
                                                        <a className="addPlaylist addEdit"  title={Translate(this.props, "Edit")}>
                                                        <span className="material-icons" data-icon="edit"></span>
                                                        {Translate(this.props, "Edit")}
                                                        </a>
                                                    </Link>
                                                :
                                                    <Link href="/create-series" customParam={`id=${this.state.movie.custom_url}`} as={`/create-series/${this.state.movie.custom_url}`}>
                                                        <a className="addPlaylist addEdit"  title={Translate(this.props, "Edit")}>
                                                        <span className="material-icons" data-icon="edit"></span>
                                                        {Translate(this.props, "Edit")}
                                                        </a>
                                                    </Link>
                                                }
                                            </li>
                                            : null
                                    }
                                     {
                                            this.props.canDelete ?
                                            <li>
                                                <a className="addPlaylist addDelete" title={Translate(this.props, "Delete")} href="#" onClick={this.deleteMovie}>
                                                <span className="material-icons" data-icon="delete"></span>
                                                {Translate(this.props, "Delete")}
                                                </a>
                                            </li>
                                            : null
                                    }
                                    {
                                        this.props.canEdit ?
                                                <li>
                                                    <a href="#" className="addPlaylist addEdit" onClick={this.analytics} title={Translate(this.props, "Analytics")}>
                                                    <span className="material-icons" data-icon="show_chart"></span>
                                                    {Translate(this.props, "Analytics")}
                                                    </a>
                                                </li>
                                            : null
                                    }
                                    
                                </ul>
                            </div>
                            : null
                            }
                        </div>
                        {
                            metaData.length > 0 ?
                                <div className="movieInfo"> 
                                    {
                                        metaData.join(" | ")   
                                    }                                    
                                </div>
                        : null
                        }
                    </div>
            </div>
            :
            <div className="ThumbBox-wrap ms-container">
                <Link href="/watch" customParam={`id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}`}>
                    <a className="ThumbBox-link" onClick={this.props.closePopUp}>
                        <div className="ThumbBox-coverImg">
                            <span>
                                <Image className="img" title={CensorWord("fn",this.props,this.state.movie.title)} image={movieImage} imageSuffix={this.props.pageData.imageSuffix}  siteURL={this.props.pageData.siteURL}/>
                            </span>
                        </div>
                    </a>
                </Link>

                        <div className="labelBtn">
                        {
                            this.state.movie.is_featured == 1 ?
                            <span className="lbl-Featured" title={Translate(this.props, "Featured")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                            </span>
                            : null
                        }
                        {
                        this.state.movie.is_sponsored == 1 ?
                            <span className="lbl-Sponsored" title={Translate(this.props, "Sponsored")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                            </span>
                            : null
                        }
                        {
                            this.state.movie.is_hot == 1 ?
                                <span className="lbl-Hot" title={Translate(this.props, "Hot")}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>
                                : null
                        }
                        </div>
                        <div className="btnPlayListSave">
                            <WatchLater className="btnPlayListSave-btn" typeWatchLater="movie-series" icon={true} {...this.props} item={this.state.movie} id={this.state.movie.movie_id} />
                            <SocialShare className="btnPlayListSave-btn" aTagDirect={true} hideTitle={true} {...this.props} buttonHeightWidth="30" tags={this.state.movie.tags} url={`/watch/${this.state.movie.custom_url}`} title={CensorWord("fn",this.props,this.state.movie.title)} imageSuffix={this.props.pageData.imageSuffix} media={this.state.movie.image} />
                        </div>
                        <div className="ThumbBox-Title hide-on-expand">
                            <div className="PlayIcon">
                                <span className="material-icons-outlined">
                                    play_arrow
                                </span>
                            </div>
                            <div className="title ellipsize2Line">
                                <h4 className="m-0">{<CensorWord {...this.props} text={this.state.movie.title} />}</h4>
                            </div>
                        </div>
                        <div className="ItemDetails">
                            <div className="d-flex justify-content-between VdoTitle ">
                            <Link href="/watch" customParam={`id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}`}>
                                <a className="ThumbBox-Title-expand d-flex align-items-center" onClick={this.props.closePopUp}>
                                    <div className="PlayIcon">
                                        <span className="material-icons-outlined">
                                            play_arrow
                                        </span>
                                    </div>
                                    <div className="title ellipsize2Line">
                                        <h4 className="m-0">{<CensorWord {...this.props} text={this.state.movie.title} />}</h4>
                                    </div>
                                </a>
                                </Link>
                                {
                                this.props.canDelete || this.props.canEdit ? 
                                    <div className="dropdown TitleRightDropdown">
                                        <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_vert"></span></a>
                                        <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start edit-options">
                                            {
                                                this.props.canEdit ?
                                                    <li>
                                                        {
                                                            this.state.movie.category == "movie" ? 
                                                            <Link href="/create-movie" customParam={`id=${this.state.movie.custom_url}`} as={`/create-movie/${this.state.movie.custom_url}`}>
                                                                <a className="addPlaylist addEdit"  title={Translate(this.props, "Edit")}>
                                                                <span className="material-icons" data-icon="edit"></span>
                                                                {Translate(this.props, "Edit")}
                                                                </a>
                                                            </Link>
                                                        :
                                                            <Link href="/create-series" customParam={`id=${this.state.movie.custom_url}`} as={`/create-series/${this.state.movie.custom_url}`}>
                                                                <a className="addPlaylist addEdit"  title={Translate(this.props, "Edit")}>
                                                                <span className="material-icons" data-icon="edit"></span>
                                                                {Translate(this.props, "Edit")}
                                                                </a>
                                                            </Link>
                                                        }
                                                    </li>
                                                    : null
                                            }
                                            {
                                                    this.props.canDelete ?
                                                    <li>
                                                        <a className="addPlaylist addDelete" title={Translate(this.props, "Delete")} href="#" onClick={this.deleteMovie}>
                                                        <span className="material-icons" data-icon="delete"></span>
                                                        {Translate(this.props, "Delete")}
                                                        </a>
                                                    </li>
                                                    : null
                                            }
                                            {
                                                this.props.canEdit ?
                                                        <li>
                                                            <a href="#" className="addPlaylist addEdit" onClick={this.analytics} title={Translate(this.props, "Analytics")}>
                                                            <span className="material-icons" data-icon="show_chart"></span>
                                                            {Translate(this.props, "Analytics")}
                                                            </a>
                                                        </li>
                                                    : null
                                            }
                                            
                                        </ul>
                                    </div>
                            : null
                            }
                            </div>
                            <div className="Vdoinfo d-flex flex-column">
                                <span className="videoViewDate">
                                {
                                    metaData.length > 0 ?
                                        metaData.join(" | ")                                                                               
                                : null
                                }
                                </span>
                            </div>
                        </div>
                    
            </div> 
            }
            </React.Fragment>
        )
    }
}

export default Item
