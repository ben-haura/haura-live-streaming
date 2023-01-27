import React from "react"
import Link from "../../components/Link/index";
import Image from "../Image/Index"

import Translate from "../../components/Translate/Index"
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";

class Trailers extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            movie:props.movie,
            trailers:props.trailers,
            pagging:props.pagging,
            page:2,
            episode:props.episode,
            seasons:props.seasons
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
        } else if (nextProps.pageData.movie != prevState.movie || prevState.episode != nextProps.episode) {
           return {
                episode:nextProps.episode,
                movie:nextProps.movie,
                trailers:nextProps.trailers,
                pagging:nextProps.pagging,
                page:2,
                seasons:nextProps.seasons
            }
        } else{
            return null
        }
    }

    refreshContent() {
        this.setState({localUpdate:true, page: 1, trailers: [] })
        this.loadMoreContent()
    }
    
    loadMoreContent() {
        this.setState({localUpdate:true, loading: true })
        let formData = new FormData();
        formData.append('page', this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `/movies-trailers`;
        formData.append('movie_id',this.state.movie.movie_id)
        if(this.state.episode && this.state.seasons){
            formData.append('episode_id',this.state.episode.episode_id)
        }
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.trailers) {
                    let pagging = response.data.pagging
                    this.setState({localUpdate:true, page: this.state.page + 1, pagging: pagging, trailers: [...this.state.trailers, ...response.data.trailers], loading: false })
                } else {
                    this.setState({localUpdate:true, loading: false })
                }
            }).catch(err => {
                this.setState({localUpdate:true, loading: false })
            });
    }

    render(){

        let items = this.state.trailers.map((item,_) => {
            let html = <a className="ThumbBox-link">
                            <div className="ThumbBox-coverImg">
                                <span>
                                    <Image image={item.image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                </span>
                            </div>         
                            {
                                item.duration ?
                                    <div className="VdoDuration show-gradient">{item.duration}</div>
                                    : null
                            }                       
                            <div className="ThumbBox-Title">
                                <div className="title ellipsize2Line">
                                    <h4 className="m-0">{`${item.category.charAt(0).toUpperCase() + item.category.slice(1)}: ${item.title}`}</h4>
                                </div>
                            </div>
                        </a>
            return (
                <div key={item.movie_video_id} className="gridColumn">
                    <div className="ThumbBox-wrap">
                        {
                            item.type == "external" ? 
                            <a href={item.code} target="_blank">
                                {html}
                            </a>
                        :
                        this.state.episode && this.state.seasons? 
                            <Link href="/watch" customParam={`trailer_id=${item.movie_video_id}&id=${this.state.movie.custom_url}&season_id=${this.state.episode.season}&episode_id=${this.state.episode.episode_number}`} as={`/watch/${this.state.movie.custom_url}/season/${this.state.episode.season}/episode/${this.state.episode.episode_number}/trailer/${item.movie_video_id}`}>
                                {html}        
                            </Link>
                        :
                            <Link href="/watch" customParam={`trailer_id=${item.movie_video_id}&id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}/trailer/${item.movie_video_id}`}>
                                {html}        
                            </Link>
                        }
                    </div> 
                </div>
            )
        })

        return (    
            <InfiniteScroll
                dataLength={this.state.trailers.length}
                next={this.loadMoreContent}
                hasMore={this.state.pagging}
                loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.trailers.length} />}
                endMessage={
                    <EndContent {...this.props} text={ Translate(this.props,'No trailers created yet.')} itemCount={this.state.trailers.length} />
                }
                pullDownToRefresh={false}
                pullDownToRefreshContent={<Release release={false} {...this.props} />}
                releaseToRefreshContent={<Release release={true} {...this.props} />}
                refreshFunction={this.refreshContent}
            >
                <div className="gridContainer gridTrailers">
                    {items}
                </div>
            </InfiniteScroll>
        )
    }
}




export default Trailers