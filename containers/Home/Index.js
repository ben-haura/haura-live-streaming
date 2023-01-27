import React,{Component} from "react"
import { connect } from "react-redux";
import Translate from "../../components/Translate/Index"
import dynamic from 'next/dynamic'
import TopVideos from '../../containers/HomePage/TopVideos'
import actions from '../../store/actions/general'
import Members from "../HomePage/Members"
import Movies from "../HomePage/Movies"
import Audio from "../HomePage/Audio"
import ChannelCarousel from "../Channel/CarouselChannel"
import AdsIndex from "../Ads/Index"
import axios from "../../axios-site"
import Link from "../../components/Link";

const NewsLetter = dynamic(() => import("../../containers/Newsletter/Index"), {
    ssr: false
});
const Channels = dynamic(() => import("../../containers/HomePage/CarouselChannel"), {
    ssr: false
});
const ChannelPost = dynamic(() => import("../HomePage/ChannelPosts"), {
    ssr: false
});
const VideoSlider = dynamic(() => import("../HomePage/VideoSlider"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="slider shimmer"> </div>
    </div>
});
const Announcements = dynamic(() => import("../HomePage/Announcement"), {
    ssr: false,
});
const Slideshow = dynamic(() => import("../../components/Slideshow/Index"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="slider shimmer"> </div>
    </div>
});

const Stories = dynamic(() => import("../Stories/Carousel/Index"), {
    ssr: false,
    loading: () => 
            <div className="shimmer-elem">
                <div className="stories-shimer d-flex">
                    <div className="item shimmer storyThumb"></div>
                    <div className="item shimmer storyThumb"></div>
                    <div className="item shimmer storyThumb"></div>
                </div>
            </div>
});

const Reels = dynamic(() => import("../Reels/Carousel/Index"), {
    ssr: false,
    loading: () => 
            <div className="shimmer-elem">
                <div className="stories-shimer d-flex">
                    <div className="item shimmer storyThumb reelThumb"></div>
                    <div className="item shimmer storyThumb reelThumb"></div>
                    <div className="item shimmer storyThumb reelThumb"></div>
                </div>
            </div>
});

class Home extends Component {
    constructor(props){
        super(props)
        this.state = {
            closePopup:false,
            videos:props.pageData.videos,
            channels:props.pageData.channels,
            categories:props.pageData.categoryVideos,
            members:props.pageData.popularMembers,
            slideshow:props.pageData.slideshow,
            audio:props.pageData.audio,
            livestreamers:props.pageData.livestreamers,
            movies:props.pageData.movies,
            series:props.pageData.series,
            stories:props.pageData.stories && props.pageData.stories.results.length > 0 ? props.pageData.stories : null,
            reels:props.pageData.reels && props.pageData.reels.results.length > 0 ? props.pageData.reels : null,
            announcements:props.pageData.announcements,
            page:1
        }
        this.closePopup = this.closePopup.bind(this)
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if (prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }
        let dataTypes = {}
        if(nextProps.pageData.videos != prevState.videos){
            dataTypes.videos = nextProps.pageData.videos
            dataTypes.page = 1
        }
        if(nextProps.pageData.movies != prevState.movies){
            dataTypes.movies = nextProps.pageData.movies
            dataTypes.page = 2
        }
        if(nextProps.pageData.series != prevState.series){
            dataTypes.series = nextProps.pageData.series
            dataTypes.page = 2
        }
        if(nextProps.pageData.popularMembers != prevState.popularMembers){
            dataTypes.members = nextProps.pageData.popularMembers
            dataTypes.page = 1
        }
        if(nextProps.pageData.slideshow != prevState.slideshow){
            dataTypes.slideshow = nextProps.pageData.slideshow
            dataTypes.page = 1
        }
        if(nextProps.pageData.channels != prevState.channels){
            dataTypes.channels = nextProps.pageData.channels
            dataTypes.page = 2
        }
        if(nextProps.pageData.audio != prevState.audio){
            dataTypes.audio = nextProps.pageData.audio
            dataTypes.page = 2
        }
        if(nextProps.pageData.livestreamers != prevState.livestreamers){
            dataTypes.livestreamers = nextProps.pageData.livestreamers
            dataTypes.page = 2
        }
        if(nextProps.pageData.announcements != prevState.announcements){
            dataTypes.announcements = nextProps.pageData.announcements
            dataTypes.page = 1
        }
        if(nextProps.pageData.stories != prevState.stories){
            dataTypes.stories = nextProps.pageData.stories && nextProps.pageData.stories.results.length > 0 ? nextProps.pageData.stories : null
            dataTypes.page = 1
        }
        if(nextProps.pageData.reels != prevState.reels){
            dataTypes.reels = nextProps.pageData.reels && nextProps.pageData.reels.results.length > 0 ? nextProps.pageData.reels : null
            dataTypes.page = 1
        }
        if(nextProps.pageData.categoryVideos != prevState.categories){
            dataTypes.categories = nextProps.pageData.categoryVideos
            dataTypes.page = 2
        }

        if(prevState.movies){
            dataTypes.movies = prevState.movies
        }
        if(prevState.series){
            dataTypes.series = prevState.series
        }
        if(prevState.popularMembers){
            dataTypes.members = prevState.popularMembers
        }
        
        if(prevState.channels){
            dataTypes.channels = prevState.channels
        }
        if(prevState.audio){
            dataTypes.audio = prevState.audio
        }
        if(prevState.livestreamers){
            dataTypes.livestreamers = prevState.livestreamers
        }
        if(prevState.categoryVideos){
            dataTypes.categories = prevState.categoryVideos
        }
        
        if(Object.keys(dataTypes).length){
            return {...prevState,...dataTypes}
        }else{
            return null
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(this.state.page == 1)
            this.updatePageData();
    }
    updatePageData = () => {
        let formData = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `/home-data`;
        
        axios.post(url, formData, config)
            .then(response => {
                let dataTypes = {...this.state}
                let nextProps = response.data.data
                if(nextProps.movies){
                    dataTypes.movies = nextProps.movies
                }
                if(nextProps.series){
                    dataTypes.series = nextProps.series
                }
                if(nextProps.popularMembers){
                    dataTypes.members = nextProps.popularMembers
                }
                
                if(nextProps.channels){
                    dataTypes.channels = nextProps.channels
                }
                if(nextProps.audio){
                    dataTypes.audio = nextProps.audio
                }
                if(nextProps.livestreamers){
                    dataTypes.livestreamers = nextProps.livestreamers
                }
                if(nextProps.categoryVideos){
                    dataTypes.categories = nextProps.categoryVideos
                }
                this.setState({localUpdate:true, ...dataTypes,page:2})
            
            }).catch(err => {
                console.log(err);
            });
    }
    componentDidMount(){
        this.updatePageData();
    }
    updatereels = (items,pagging) => {
        let reels = {}
        reels.results = items;
        reels.pagging = pagging
        this.props.pageData.reels = reels;
        if(items && items.length == 0){
            this.setState({localUpdate:true,closePopup:false})
        }
    }
   
    updateStories = (items,pagging) => {
        let stories = {}
        stories.results = items;
        stories.pagging = pagging
        this.props.pageData.stories = stories;
        if(items && items.length == 0){
            this.setState({localUpdate:true,closePopup:false})
        }
    }
    closePopup = (type) => {
        if(typeof type == "undefined")
            type = false;
        if(type == "close")
            type = false;

        if(this.props.stories && this.props.stories.results.length == 0){
            type = false;
        }
        this.setState({localUpdate:true,closePopup:type},() => {
            if(!this.state.closePopup)
                $("body").removeClass("stories-open");
        })
    }
    render(){

        return (
            <React.Fragment>
                {
                    this.state.slideshow ?
                        <Slideshow {...this.props} class={`${this.props.pageData.appSettings['video_adv_slider'] == 1 ? " nobtn" : ""}`} />
                        : null
                    }
                    {
                        !this.state.slideshow && this.state.videos && this.state.videos.featured ? 
                            <VideoSlider {...this.props}  videos={this.state.videos.featured} />
                        :
                        null 
                    }
                    {
                        this.state.announcements ? 
                            <Announcements {...this.props}  announcements={this.state.announcements} />
                        :
                        null 
                    }
                    {
                        this.props.pageData.appSettings["enable_stories"] == 1 && (this.props.pageData.levelPermissions["stories.view"] == 1 || this.props.pageData.levelPermissions["stories.view"] == 2) && (this.state.stories  || this.props.pageData.levelPermissions["stories.create"] == 1) ? 
                            <div className={`${this.state.closePopup ? `` : `container `}VideoRoWrap stories-cnt`}>
                                <div className="row">
                                        <div className="col-md-12">
                                            <div className="titleWrap">
                                                {
                                                    <span className="title">
                                                        <React.Fragment>
                                                            {Translate(this.props,`Stories`)}
                                                        </React.Fragment>
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                <Stories {...this.props} closePopupFirst={this.closePopup} updateStories={this.updateStories} />
                            </div>
                        : null
                    }
                    
                    {
                        this.state.slideshow && this.state.videos && this.state.videos.featured ? 
                            <React.Fragment>
                                <TopVideos  {...this.props}   openPlaylist={this.props.openPlaylist} headerTitle={<span className="featured">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}   seemore={true} title={Translate(this.props,"Featured Videos")} videos={this.state.videos.featured} type="featured"  />
                            </React.Fragment>
                        : null
                    }
                    
                    {
                        this.state.videos && this.state.videos.featured ? 
                            this.props.pageData.appSettings['featuredvideo_ads'] ? 
                                <AdsIndex paddingTop="20px" className="featuredvideo_ads" ads={this.props.pageData.appSettings['featuredvideo_ads']} />
                            : null            
                        : null            
                    }
                    {
                        this.state.videos && this.state.videos.sponsored ? 
                             <React.Fragment>
                                 {
                                    this.state.videos && this.state.videos.featured &&  this.state.slideshow ? 
                                        <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                    : null
                                }
                            <TopVideos  {...this.props}   openPlaylist={this.props.openPlaylist} headerTitle={<span className="sponsored">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                            </span>}   seemore={true} title={Translate(this.props,"Sponsored Videos")} videos={this.state.videos.sponsored} type="sponsored"  />
                            {
                                    this.props.pageData.appSettings['sponsoredvideo_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="sponsoredvideo_ads" ads={this.props.pageData.appSettings['sponsoredvideo_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    
                     {
                        this.state.videos && this.state.videos.hot ? 
                            <React.Fragment>
                                {
                                    this.state.videos && this.state.videos.sponsored ? 
                                        <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                    : null
                                }
                                <TopVideos  {...this.props}   openPlaylist={this.props.openPlaylist} headerTitle={<span className="hot">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}  seemore={true} title={Translate(this.props,"Hot Videos")} type="hot" videos={this.state.videos.hot}  />
                                {
                                    this.props.pageData.appSettings['hotvideo_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="hotvideo_ads" ads={this.props.pageData.appSettings['hotvideo_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.videos && this.state.videos.recent_videos ? 
                            <React.Fragment>
                                {
                                    this.state.videos && (this.state.videos.sponsored || this.state.videos.hot) ? 
                                        <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                : null
                                }
                                <TopVideos  {...this.props}   openPlaylist={this.props.openPlaylist} headerTitle={<span className="recent_video"><span className="material-icons" data-icon="video_library"></span></span>}  seemore={true} title={Translate(this.props,"Recent Videos")} sort="recent" videos={this.state.videos.recent_videos}  />
                                {
                                    this.props.pageData.appSettings['recentvideo_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="recentvideo_ads" ads={this.props.pageData.appSettings['recentvideo_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.props.pageData.appSettings["enable_reels"] == 1 && (this.props.pageData.levelPermissions["reels.view"] == 1 || this.props.pageData.levelPermissions["reels.view"] == 2) && this.state.reels && this.state.reels.results.length > 0 ? 
                            <div className={`${this.state.closePopup ? `` : `container `}VideoRoWrap stories-cnt`}>
                                <div className="row">
                                        <div className="col-md-12">
                                            <div className="titleWrap" onClick={this.openReels}>
                                                <Link href={`/reel`} customParam={`id=${this.state.reels.results[0].reel_id}`} as={`/reel/${this.state.reels.results[0].reel_id}`}>
                                                    <a>
                                                        <span className="title">
                                                            <React.Fragment>
                                                                {Translate(this.props,`Reels and short videos`)}
                                                            </React.Fragment>
                                                        </span>
                                                    </a>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                <Reels {...this.props} closePopupFirst={this.closePopup} updatereels={this.updatereels} />
                            </div>
                        : null
                    }
                    {
                        this.state.livestreamers ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <div className="container">
                                    <Members  {...this.props}  headerTitle={<span className="recent_video"><span className="material-icons" data-icon="live_tv"></span></span>}  seemore={true} titleHeading={Translate(this.props,"Best Livestreamer Of The Month")} sort="recent" type="member" members={this.state.livestreamers} />
                                    {
                                        this.props.pageData.appSettings['livestreamer_ads'] ? 
                                            <AdsIndex paddingTop="20px" className="livestreamer_ads" ads={this.props.pageData.appSettings['livestreamer_ads']} />
                                        : null
                                    }
                                </div>
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.members ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <div className="container">
                                    <Members  {...this.props}  headerTitle={<span className="recent_video"><span className="material-icons" data-icon="people"></span></span>}  seemore={true} titleHeading={Translate(this.props,"Popular Members")} sort="recent" type="member" members={this.state.members} />
                                    {
                                        this.props.pageData.appSettings['popularmembers_ads'] ? 
                                            <AdsIndex paddingTop="20px" className="popularmembers_ads" ads={this.props.pageData.appSettings['popularmembers_ads']} />
                                        : null
                                    }
                                </div>
                            </React.Fragment>
                    : null
                    }


                    {
                        this.state.movies && this.state.movies.featured ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                             <Movies  {...this.props} headerType="Movies"  headerTitle={<span className="featured">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                             </span>}   seemore={true} title={Translate(this.props,"Featured Movies")} movies={this.state.movies.featured} type="featured" />
                             {
                                    this.props.pageData.appSettings['featuredmovie_ads'] ? 
                                        <AdsIndex className="featuredmovie_ads"  paddingTop="20px" ads={this.props.pageData.appSettings['featuredmovie_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.movies && this.state.movies.sponsored ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <Movies  {...this.props} headerType="Movies"    headerTitle={<span className="sponsored">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}  seemore={true} title={Translate(this.props,"Sponsored Movies")} movies={this.state.movies.sponsored} type="sponsored"  />
                                {
                                    this.props.pageData.appSettings['sponsoredmovie_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="sponsoredmovie_ads" ads={this.props.pageData.appSettings['sponsoredmovie_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.movies && this.state.movies.hot ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <Movies  {...this.props} headerType="Movies"   headerTitle={<span className="hot">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}   seemore={true} title={Translate(this.props,"Hot Movies")} type="hot" movies={this.state.movies.hot}  />
                                {
                                    this.props.pageData.appSettings['hotmovie_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="hotmovie_ads" ads={this.props.pageData.appSettings['hotmovie_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.movies && this.state.movies.recent_movies ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <Movies  {...this.props}  headerType="Movies" headerTitle={<span className="recent_video"><span className="material-icons" data-icon="video_library"></span></span>}   seemore={true} title={Translate(this.props,"Recent Movies")} sort="latest" movies={this.state.movies.recent_movies}  />
                            </React.Fragment>
                    : null
                    }

                    {
                        this.state.series && this.state.series.featured ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                             <Movies  {...this.props}  headerType="Series"  headerTitle={<span className="featured">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                             </span>}   seemore={true} title={Translate(this.props,"Featured Series")} movies={this.state.series.featured} type="featured" />
                             {
                                    this.props.pageData.appSettings['featuredseries_ads'] ? 
                                        <AdsIndex className="featuredseries_ads" paddingTop="20px" ads={this.props.pageData.appSettings['featuredseries_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.series && this.state.series.sponsored ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <Movies  {...this.props} headerType="Series"   headerTitle={<span className="sponsored">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}  seemore={true} title={Translate(this.props,"Sponsored Series")} movies={this.state.series.sponsored} type="sponsored"  />
                                {
                                    this.props.pageData.appSettings['sponsoredseries_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="sponsoredseries_ads" ads={this.props.pageData.appSettings['sponsoredseries_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.series && this.state.series.hot ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <Movies  {...this.props}  headerType="Series" headerTitle={<span className="hot">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}   seemore={true} title={Translate(this.props,"Hot Series")} type="hot" movies={this.state.series.hot}  />
                                {
                                    this.props.pageData.appSettings['hotseries_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="hotseries_ads" ads={this.props.pageData.appSettings['hotseries_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.series && this.state.series.recent_series ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <Movies  {...this.props}  headerType="Series" headerTitle={<span className="recent_video"><span className="material-icons" data-icon="video_library"></span></span>}   seemore={true} title={Translate(this.props,"Recent Series")} sort="latest" movies={this.state.series.recent_series}  />
                            </React.Fragment>
                    : null
                    }

                    {
                        this.state.channels && this.state.channels.posts ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <ChannelPost  {...this.props} posts={this.state.channels.posts}  />
                                {
                                    this.props.pageData.appSettings['channelpost_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="channelpost_ads" ads={this.props.pageData.appSettings['channelpost_ads']} />
                                    : null
                                }
                            </React.Fragment>
                        : null
                    }
                    {
                        this.state.channels && this.state.channels.featured ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                             {
                                 this.props.pageData.themeType != 2 ? 
                             <Channels  {...this.props}  headerTitle={<span className="featured">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                             </span>}   seemore={true} title={Translate(this.props,"Featured Channels")} channels={this.state.channels.featured} type="featured" />
                             :
                             <ChannelCarousel  {...this.props}  headerTitle={<span className="featured">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                             </span>}   seemore={true} title={Translate(this.props,"Featured Channels")} channels={this.state.channels.featured} type="featured" />
                             }
                             {
                                    this.props.pageData.appSettings['featuredchannel_ads'] ? 
                                        <AdsIndex className="featuredchannel_ads" paddingTop="20px" ads={this.props.pageData.appSettings['featuredchannel_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.channels && this.state.channels.sponsored ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                {
                                 this.props.pageData.themeType != 2 ? 
                                <Channels  {...this.props}   headerTitle={<span className="sponsored">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}  seemore={true} title={Translate(this.props,"Sponsored Channels")} channels={this.state.channels.sponsored} type="sponsored"  />
                                :
                                <ChannelCarousel  {...this.props}   headerTitle={<span className="sponsored">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}  seemore={true} title={Translate(this.props,"Sponsored Channels")} channels={this.state.channels.sponsored} type="sponsored"  />
                                }
                                
                                {
                                    this.props.pageData.appSettings['sponsoredchannel_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="sponsoredchannel_ads" ads={this.props.pageData.appSettings['sponsoredchannel_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.channels && this.state.channels.hot ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                {
                                 this.props.pageData.themeType != 2 ? 
                                <Channels  {...this.props}  headerTitle={<span className="hot">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}   seemore={true} title={Translate(this.props,"Hot Channels")} type="hot" channels={this.state.channels.hot}  />
                                :
                                <ChannelCarousel  {...this.props}  headerTitle={<span className="hot">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </span>}   seemore={true} title={Translate(this.props,"Hot Channels")} type="hot" channels={this.state.channels.hot}  />
                                }
                                {
                                    this.props.pageData.appSettings['hotchannel_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="hotchannel_ads" ads={this.props.pageData.appSettings['hotchannel_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    {
                        this.state.audio && this.state.audio ? 
                            <React.Fragment>
                                <div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                <Audio  {...this.props}  headerTitle={
                                <span className="recent_video"><span className="material-icons" data-icon="headset"></span></span>
                                }   seemore={true} title={Translate(this.props,"Recent Audio")} type="latest" audio={this.state.audio}  />
                                {
                                    this.props.pageData.appSettings['audio_ads'] ? 
                                        <AdsIndex paddingTop="20px" className="audio_ads" ads={this.props.pageData.appSettings['audio_ads']} />
                                    : null
                                }
                            </React.Fragment>
                    : null
                    }
                    
                    {
                        this.state.categories ? 
                            this.state.categories.map(cat => {
                                return <React.Fragment key={cat.category.category_id+"_cnt"}><div className="container hr"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div><TopVideos key={cat.category.category_id+"_cat_videos"} {...this.props}   openPlaylist={this.props.openPlaylist} headerTitle={<span className="category"><span className="material-icons" data-icon="category"></span></span>}  subType="category_id" seemore={true} key={cat.category.category_id}  videos={cat.videos} title={Translate(this.props,cat.category.title)} type={cat.category.category_id}  /></React.Fragment>
                            })
                    : null
                    }
                    {
                        this.state.categories ? 
                            this.props.pageData.appSettings['categoryvideo_ads'] ? 
                                <AdsIndex paddingTop="20px" className="categoryvideo_ads" ads={this.props.pageData.appSettings['categoryvideo_ads']} />
                            : null            
                        : null            
                    }
                    {
                        this.state.page == 1 ? 
                        <React.Fragment>
                            <div className="VideoRoWrap">
                                <div className="container">
                                    <div className="shimmer-elem">
                                        <div className="heading shimmer"></div>
                                        <div className="grid">
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                        </div>
                                    </div>
                                    <div className="shimmer-elem">
                                        <div className="heading shimmer"></div>
                                        <div className="grid">
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                        </div>
                                    </div>
                                    <div className="shimmer-elem">
                                        <div className="heading shimmer"></div>
                                        <div className="grid">
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                        </div>
                                    </div>
                                    <div className="shimmer-elem">
                                        <div className="heading shimmer"></div>
                                        <div className="grid">
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                            <div className="item shimmer"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                        :null
                    }

                    {
                        !this.props.pageData.loggedInUserDetails ? 
                        <NewsLetter {...this.props}  />
                        : null
                    }
                    
            </React.Fragment>
        )
    }
}


  const mapDispatchToProps = dispatch => {
    return {
        openPlaylist: (open, video_id) => dispatch(actions.openPlaylist(open, video_id)),
    };
};
export default connect(null,mapDispatchToProps)(Home)