import React from "react"
import Episode from './Episode'
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Translate from "../../components/Translate/Index";
import Link from "../../components/Link/index";

class Browse extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            episodes: props.pageData.episodes,
            page: 2,
            pagging: props.pageData.pagging,
            loading: false,
            movie_id:props.pageData.id,
            season_id:props.pageData.season_id,
            movie:props.pageData.movie
        }
        this.loadMoreContent = this.loadMoreContent.bind(this)
        this.refreshContent = this.refreshContent.bind(this)
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        
        if (prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.episodes && nextProps.episodes != prevState.episodes) {
            return {movie:nextProps.pageData.movie,movie_id:nextProps.pageData.movie_id,id:nextProps.pageData.season_id,episodes: nextProps.pageData.episodes, pagging: nextProps.pageData.pagging, page: 2,  }
        } else {
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
        formData.append('season',this.state.season_id)
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
    
    render() {
        let items = this.state.episodes.map((item,_) => {
            return (
                <Episode key={item.episode_id} {...this.props} episode={item} movie_id={this.state.movie_id} season_id={this.state.season_id} />
            )
        })

        return (
            <React.Fragment>
                <div className="season-browse container py-3">
                    <h2>
                        <Link href="/watch" customParam={`id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}`}>
                            {this.state.movie.title}
                        </Link> - {this.props.t("Season")} {this.state.season_id}
                    </h2>
                    <InfiniteScroll
                        dataLength={this.state.episodes.length}
                        next={this.loadMoreContent}
                        hasMore={this.state.pagging}
                        loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.episodes.length} />}
                        endMessage={
                            <EndContent {...this.props} text={ Translate(this.props,'No episodes created yet for this season.')} itemCount={this.state.episodes.length} />
                        }
                        pullDownToRefresh={false}
                        pullDownToRefreshContent={<Release release={false} {...this.props} />}
                        releaseToRefreshContent={<Release release={true} {...this.props} />}
                        refreshFunction={this.refreshContent}
                    >
                        {
                            this.props.containerE ? 
                                <div className="container">
                                    <div className="gridContainer gridSeason">
                                        {items}
                                    </div>
                                </div>
                        : 
                            <div className="gridContainer gridSeason">
                                {items}
                            </div>
                        }
                    </InfiniteScroll>
                </div>
            </React.Fragment>
        )
    }
}



export default Browse