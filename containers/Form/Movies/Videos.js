import React, { Component } from "react"
import { connect } from 'react-redux';
import Translate from "../../../components/Translate/Index";
import dynamic from 'next/dynamic'
import swal from "sweetalert"
import * as actions from '../../../store/actions/general';
import axios from "../../../axios-orders"
import AddVideo from "./AddVideo"
import Image from "../../Image/Index"
import LoadMore from "../../LoadMore/Index"
import EndContent from "../../LoadMore/EndContent"
import Release from "../../LoadMore/Release"
import InfiniteScroll from "react-infinite-scroll-component";

class Videos extends Component {
    constructor(props) {
        super(props)
        this.state = {
            videos:props.videos.results,
            pagging:props.videos.pagging,
            movie:props.movie ? props.movie : {},
            seasons:props.seasons ? props.seasons : [],
            editItem:props.editItem ? props.editItem : null,
            page:2
        }
        this.loadMoreContent = this.loadMoreContent.bind(this)
        this.refreshContent = this.refreshContent.bind(this)
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else {
            return {
                page:2,
                videos:nextProps.videos && nextProps.videos.results ? nextProps.videos.results : [],   
                pagging:nextProps.videos.pagging,    
                movie:nextProps.movie ? nextProps.movie : {},
                seasons:nextProps.seasons ? nextProps.seasons : [],
                editItem:nextProps.editItem ? nextProps.editItem : null  
            }
        }
    }
    updateValues = (values) => {
        //update the values
        let videosItem = {}
        videosItem["pagging"] = this.state.pagging
        videosItem["results"] = values
        this.props.updateSteps({key:"videos",value:videosItem})
    }
    closeCreate = (data,message) => {
        if(message && data){
            this.props.openToast(Translate(this.props,message), "success");
        }
        const items = [...this.state.videos]
        if(this.state.editVideoItem){
            const videoIndex = items.findIndex(p => p["movie_video_id"] == this.state.editVideoItem.movie_video_id);
            if(videoIndex > -1){
                items[videoIndex] = data
                this.setState({addVideo:false,editVideoItem:null},() => {
                    this.updateValues(items)
                })
            }
        }else{
            items.unshift(data)
            this.setState({addVideo:false,editVideoItem:null},() => {
                this.updateValues(items)
            })
        }        
    }
    closeVideo = () => {
        this.setState({addVideo:false,editVideoItem:null})
    }
    editVideo = (video_id,e) => {
        e.preventDefault();
        const items = [...this.state.videos]
        const itemIndex = items.findIndex(p => p["movie_video_id"] == video_id)
        if(itemIndex > -1){
            let video = items[itemIndex];
            this.setState({addVideo:true,editVideoItem:video})
        }
    }
    deleteVideo = (video_id,e) => {
        e.preventDefault();
        swal({
            title: Translate(this.props,"Are you sure?"),
            text: Translate(this.props,"Once deleted, you will not be able to recover this video!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', video_id)
                    formData.append('movie_id', this.state.movie.movie_id)
                    const url = "/movies/video/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(this.props,"Something went wrong, please try again later", "error"));
                            } else {
                                let message = response.data.message
                                this.props.openToast(Translate(this.props,message), "success");
                                const items = [...this.state.videos]
                                const itemIndex = items.findIndex(p => p["movie_video_id"] == video_id)
                                if(itemIndex > -1){
                                    items.splice(itemIndex, 1)
                                    this.updateValues(items)
                                }
                            }
                        }).catch(err => {
                            swal("Error", Translate(this.props,"Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    addVideo = () => {
        this.setState({addVideo:true})
    }
    refreshContent() {
        this.setState({localUpdate:true, page: 1, videos: [] })
        this.loadMoreContent()
    }
    loadMoreContent(values) {
        this.setState({localUpdate:true, loading: true })
        let formData = new FormData();
        formData.append('page', this.state.page)
        formData.append('movie_id', this.state.movie.movie_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `/movies/videos`;
        let queryString = ""
        if (this.props.pageData.search) {
            queryString = Object.keys(this.props.pageData.search).map(key => key + '=' + this.props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        } 
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.videos) {
                    let pagging = response.data.pagging
                    this.setState({localUpdate:true, page: this.state.page + 1, pagging: pagging, videos: [...this.state.videos, ...response.data.videos], loading: false })
                } else {
                    this.setState({localUpdate:true, loading: false })
                }
            }).catch(err => {
                this.setState({localUpdate:true, loading: false })
            });
    }
    render(){
        let addVideo = null

        if(this.state.addVideo){
            addVideo = (
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="VideoDetails-commentWrap">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{this.state.editVideoItem ? Translate(this.props,"Edit Video") : Translate(this.props,"Create Video")}</h2>
                                    <a onClick={this.closeVideo}  className="_close"><i></i></a>
                                </div>
                                <AddVideo {...this.props} closeCreate={this.closeCreate} movie_id={this.state.movie.movie_id} closeVideoCreate={this.closeVideo} editItem={this.state.editVideoItem} movie={this.state.movie} seasons={this.state.seasons} />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }


        return (
            <React.Fragment>
                {
                    addVideo
                }
                <div className="movie_videos">
                    <div className="container">
                        <div className="row"> 
                            <div className="col-md-12">        
                                <button className="add_videos" onClick={this.addVideo.bind(this)}>
                                    {
                                        this.props.t("Add Video")
                                    }
                                </button>     
                                {
                                    this.state.videos.length > 0 ? 
                                    <InfiniteScroll
                                        dataLength={this.state.videos.length}
                                        next={this.loadMoreContent}
                                        hasMore={this.state.pagging}
                                        loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.videos.length} />}
                                        endMessage={
                                            <EndContent {...this.props} text={this.props.pageData.search ?  Translate(this.props,'No video found with your matching criteria.') : Translate(this.props,'No video created yet.')} itemCount={this.state.videos.length} />
                                        }
                                        pullDownToRefresh={false}
                                        pullDownToRefreshContent={<Release release={false} {...this.props} />}
                                        releaseToRefreshContent={<Release release={true} {...this.props} />}
                                        refreshFunction={this.refreshContent}
                                    >
                                        <div className="table-responsive">
                                            <table className="table custTble1">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">{this.props.t("Name")}</th>
                                                        <th scope="col">{this.props.t("Type")}</th>
                                                        {
                                                            this.props.pageData.selectType == "movie" ? 
                                                                <th scope="col">{this.props.t("Category")}</th>
                                                        : null
                                                        }
                                                        <th scope="col">{this.props.t("Plays")}</th>
                                                        <th scope="col">{this.props.t("Season")}</th>
                                                        <th scope="col">{this.props.t("Episode")}</th>
                                                        <th scope="col">{this.props.t("Status")}</th>
                                                        <th scope="col">{this.props.t("Options")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="movie-video-listing">
                                                    
                                                        {
                                                            this.state.videos.map((video,index) => {
                                                                return (
                                                                    <tr key={video.movie_video_id}>
                                                                        <td className="center-img-txt">
                                                                            <Image className="img" height="35" width="35" image={video.image} imageSuffix={this.props.pageData.imageSuffix}  siteURL={this.props.pageData.siteURL}/>
                                                                            {video.title}
                                                                        </td>
                                                                        <td>
                                                                            {video.type}
                                                                        </td>
                                                                        {
                                                                            this.props.pageData.selectType == "movie" ? 
                                                                                <td>{this.props.t(video.category)}</td>
                                                                        : null
                                                                        }
                                                                        <td>
                                                                                {video.plays}
                                                                        </td>
                                                                        <td>
                                                                                {
                                                                                    !video.season || video.season == 0 ? "-" : video.season
                                                                                }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                !video.episode_number || video.episode_number == 0 ? "-" : video.episode_number
                                                                            }
                                                                        </td>
                                                                        <td>{video.completed == 1 ? "Completed" : "Processing"}</td>
                                                                        <td>
                                                                            <div className="actionBtn">
                                                                                <a className="text-success" href="#" title={Translate(this.props, "Edit")} onClick={this.editVideo.bind(this, video.movie_video_id)}><span className="material-icons" data-icon="edit"></span></a> 
                                                                                <a className="text-danger" href="#" title={Translate(this.props, "Delete")} onClick={this.deleteVideo.bind(this, video.movie_video_id)}><span className="material-icons" data-icon="delete"></span></a>                                                                                           
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                </tbody>
                                            </table>
                                        </div>
                                    </InfiniteScroll>
                                : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}


const mapDispatchToProps = dispatch => {
    return {
        openToast: (message, typeMessage) => dispatch(actions.openToast(message, typeMessage))
    };
}

export default connect(null, mapDispatchToProps)(Videos);