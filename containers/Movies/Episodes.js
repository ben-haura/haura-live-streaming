import React from "react"
import Episode from "./Episode"
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Translate from "../../components/Translate/Index"


class Episodes extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            movie:props.movie,
            episodes:props.episodes,
            pagging:props.pagging,
            season:props.season,
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
        } else if (nextProps.pageData.movie != prevState.movie) {
           return {
                movie:nextProps.movie,
                episodes:nextProps.episodes,
                pagging:nextProps.pagging,
                season:nextProps.season,
                page:2
            }
        } else{
            return null
        }

    }
    refreshContent() {
        this.setState({localUpdate:true, page: 1, episodes: [] })
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
        let url = `/movies-episodes`;
        formData.append('movie_id',this.state.movie.movie_id)
        formData.append('season',this.state.season)
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.episodes) {
                    let pagging = response.data.pagging
                    this.setState({localUpdate:true, page: this.state.page + 1, pagging: pagging, episodes: [...this.state.episodes, ...response.data.episodes], loading: false })
                } else {
                    this.setState({localUpdate:true, loading: false })
                }
            }).catch(err => {
                this.setState({localUpdate:true, loading: false })
            });
    }

    render(){

        let items = this.state.episodes.map((item,_) => {
            return (
                <Episode key={item.episode_id} {...this.props} episode={item} movie_id={this.state.movie.custom_url} season_id={this.state.season} />
            )
        })

        return (
            <InfiniteScroll
                dataLength={this.state.episodes.length}
                next={this.loadMoreContent}
                hasMore={this.state.pagging}
                loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.episodes.length} />}
                endMessage={
                    <EndContent {...this.props} text={ Translate(this.props,'No episodes created yet.')} itemCount={this.state.episodes.length} />
                }
                pullDownToRefresh={false}
                pullDownToRefreshContent={<Release release={false} {...this.props} />}
                releaseToRefreshContent={<Release release={true} {...this.props} />}
                refreshFunction={this.refreshContent}
            >
                <div className="gridContainer gridEpisode">
                    {items}
                </div>
            </InfiniteScroll>
        )
    }
}


export default Episodes