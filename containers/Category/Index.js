import React from "react"
import { connect } from "react-redux";
import Breadcrum from "../../components/Breadcrumb/Category"

import dynamic from 'next/dynamic'
import Router from 'next/router';
const Video = dynamic(() => import("../Video/Item"), {
    ssr: false
  });
const Channel = dynamic(() => import("../Channel/Item"), {
    ssr: false
  });
const Blog = dynamic(() => import("../Blog/Item"), {
    ssr: false
  });
const Movie = dynamic(() => import("../Movies/Item"), {
    ssr: false
  });
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import playlist from '../../store/actions/general';
import InfiniteScroll from "react-infinite-scroll-component";
import Translate from "../../components/Translate/Index";
const Masonry = dynamic(() => import("react-masonry-css"), {
    ssr: false
});

class Index extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            id:props.pageData.id,
            type:props.pageData.type,
            items:props.pageData.items,
            category:props.pageData.category,
            subsubcategories:props.pageData.subsubcategories,
            subcategories:props.pageData.subcategories,
            page:2,
            pagging:props.pageData.pagging,
            seriespage:2,
            seriespagging:props.pageData.seriespagging,
            loading:false,
            series:props.pageData.series
        }
        this.onChange = this.onChange.bind(this)
        this.loadMoreContent = this.loadMoreContent.bind(this)
        this.refreshContent = this.refreshContent.bind(this)
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.pageData.id && nextProps.pageData.id != prevState.id) {
            return { 
                id:nextProps.pageData.id,
                type:nextProps.pageData.type,
                items:nextProps.pageData.items,
                category:nextProps.pageData.category,
                subsubcategories:nextProps.pageData.subsubcategories,
                subcategories:nextProps.pageData.subcategories,
                page:2,
                pagging:nextProps.pageData.pagging,
                loading:false,
                seriespage:2,
                seriespagging:nextProps.pageData.seriespagging,
                series:nextProps.pageData.series
             }
        } else{
            return null
        }
    }

    componentDidMount(){

        if(this.state.type == "movies-series"){
            this.props.socket.on('unwatchlaterMovies', data => {
                let id = data.itemId
                let ownerId = data.ownerId
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.watchlater_id = null
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, items: items })
                }

                //update series
                const itemIndexSeries = this.getItemSeriesIndex(id)
                if (itemIndexSeries > -1) {
                    const items = [...this.state.series]
                    const changedItem = {...items[itemIndexSeries]}
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.watchlater_id = null
                    }
                    items[itemIndexSeries] = changedItem
                    this.setState({localUpdate:true, series: items })
                }

            });
            this.props.socket.on('watchlaterMovies', data => {
                let id = data.itemId
                let ownerId = data.ownerId
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.watchlater_id = 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true, items: items })
                }
                //update series
                const itemIndexSeries = this.getItemSeriesIndex(id)
                if (itemIndexSeries > -1) {
                    const items = [...this.state.series]
                    const changedItem = {...items[itemIndexSeries]}
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.watchlater_id = 1
                    }
                    items[itemIndexSeries] = changedItem
                    this.setState({localUpdate:true, series: items })
                }
            });
        }else if(this.state.type == "video"){
            this.props.socket.on('unwatchlater',data => {
                let id = data.itemId
                let ownerId = data.ownerId
                const itemIndex = this.getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    if(this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.watchlater_id = null
                    }
                    items[itemIndex] = changedItem
                    
                    this.setState({localUpdate:true,items:items})
                }
            });
            this.props.socket.on('watchlater',data => {
                let id = data.itemId
                let ownerId = data.ownerId
                const itemIndex = this.getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    if(this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.watchlater_id = 1
                    }
                    items[itemIndex] = changedItem
                    
                    this.setState({localUpdate:true,items:items})
                }
            });
    
        }
        this.props.socket.on('unfollowUser',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == (this.state.type == "movies-series" ? "movie" : this.state.type)+"s"){   
                const itemIndex = this.getItemIndex(id)  
                if(itemIndex > -1){
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}       
                    changedItem.follow_count = changedItem.follow_count - 1
                    if(this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.follower_id = null
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true,items:items})
                }
            }
       });
       this.props.socket.on('followUser',data => {
           let id = data.itemId
           let type = data.itemType
           let ownerId = data.ownerId
           if(type == (this.state.type == "movies-series" ? "movie" : this.state.type)+"s"){
              const itemIndex = this.getItemIndex(id)
              if(itemIndex > -1){
                const items = [...this.state.items]
                const changedItem = {...items[itemIndex]}
                changedItem.follow_count = data.follow_count + 1
                if(this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                    changedItem.follower_id = 1
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true,items:items})
              }
           }
      });
        this.props.socket.on('unfavouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == (this.state.type == "movies-series" ? "movie" : this.state.type)+"s"){
                const itemIndex = this.getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if(this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true,items:items})
                }
            }
        });
        this.props.socket.on('favouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == (this.state.type == "movies-series" ? "movie" : this.state.type)+"s"){
                const itemIndex = this.getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if(this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true,items:items})
                }
            }
        });


        this.props.socket.on('likeDislike',data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId =  data.ownerId
            let removeLike  = data.removeLike
            let removeDislike  = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike =  data.insertDislike
            if(itemType == (this.state.type == "movies-series" ? "movie" : this.state.type)+"s"){
                const itemIndex = this.getItemIndex(itemId)
                if(itemIndex > -1){
                    const items = [...this.state.items]
                    const changedItem = {...items[itemIndex]}
                    let loggedInUserDetails = {}
                    if(this.props.pageData && this.props.pageData.loggedInUserDetails){
                        loggedInUserDetails = this.props.pageData.loggedInUserDetails
                    }
                    if(removeLike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['like_count'] = parseInt(changedItem['like_count']) - 1
                    }
                    if(removeDislike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) - 1
                    }
                    if(insertLike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "like"
                        changedItem['like_count'] = parseInt(changedItem['like_count']) + 1
                    }
                    if(insertDislike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "dislike"
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) + 1
                    }
                    items[itemIndex] = changedItem
                    this.setState({localUpdate:true,items:items})
                }
            }
        });
    }
    getItemSeriesIndex(item_id){
        if(this.state.series){
            const items = [...this.state.series];            
            let checkId = "movie_id"
            const itemIndex = items.findIndex(p => p[checkId] == item_id);
            return itemIndex;
        }
        return -1;
    }
    getItemIndex(item_id){
        if(this.state.items){
            const items = [...this.state.items];
            let checkId = "blog_id"
            if(this.state.type == "channel"){
                checkId = "channel_id"
            }else if(this.state.type == "video"){
                checkId = "video_id"
            }else if(this.state.type == "movies-series"){
                checkId = "movie_id"
            }
            const itemIndex = items.findIndex(p => p[checkId] == item_id);
            return itemIndex;
        }
        return -1;
    }
    
    

    onChange(e){
        if(e.target.value){
            Router.push(`/category?type=${this.state.type}&id=${e.target.value}`,`/${this.state.type}/category/${e.target.value}`)
        }
    }
    refreshContent(){
        this.setState({localUpdate:true,page:1,items:[]})
        this.loadMoreContent()
    }
    loadMoreSeriesContent(){
        if(this.state.loadingSeries){
            return
        }
        this.setState({localUpdate:true,loadingSeries:true})
        let formData = new FormData();        
        formData.append('page',this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `${(this.state.type == "movies-series" ? "movies" : this.state.type)}-category/${this.state.id}`;
        formData.append("type",'series')
        
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.items){
                let pagging = response.data.pagging
                this.setState({localUpdate:true,page:this.state.page+1,seriespagging:pagging,series:[...this.state.series,...response.data.items],loadingSeries:false})
            }else{
                this.setState({localUpdate:true,loadingSeries:false})
            }
        }).catch(err => {
            this.setState({localUpdate:true,loadingSeries:false})
        });
    }
    loadMoreContent(){
        if(this.state.loading){
            return
        }
        this.setState({localUpdate:true,loading:true})
        let formData = new FormData();        
        formData.append('page',this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `${(this.state.type == "movies-series" ? "movies" : this.state.type)}-category/${this.state.id}`;
        if(this.state.type == "movies-series"){
            formData.append("type",'movies')
        }
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.items){
                let pagging = response.data.pagging
                this.setState({localUpdate:true,page:this.state.page+1,pagging:pagging,items:[...this.state.items,...response.data.items],loading:false})
            }else{
                this.setState({localUpdate:true,loading:false})
            }
        }).catch(err => {
            this.setState({localUpdate:true,loading:false})
        });

    }
    render(){ 
        let items = null
        if(this.state.type == "blog"){
                const breakpointColumnsObj = {
                    default: 3,
                    1300: 3,
                    900:2,
                    700: 2,
                    500: 1
                };
                items = 
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="my-masonry-grid row"
                        columnClassName="my-masonry-grid_column">
                            {
                                this.state.items.map(item => {
                                    return  <Blog {...this.props}  key={item.blog_id} {...item} result={item} />
                                               
                                })
                            }
                    </Masonry>
        }else if(this.state.type == "channel"){
            items =  <div className="gridContainer gridChannel">
                {
                    this.state.items.map(item => {
                        return  <div key={item.channel_id} className="gridColumn">
                                        <Channel {...this.props}  key={item.channel_id} {...item} channel={item}  />
                                    </div>
                                
                        })
                }
            </div>
        }else if(this.state.type == "video"){
            items =  <div className="gridContainer gridVideo">
            {
                this.state.items.map(item => {
                    return  <div key={item.video_id} className={"gridColumn"}>
                                 <Video {...this.props}  key={item.video_id} {...item} video={item}  />
                             </div>
                 })
            }
            </div>
        }

        if(this.state.type == "movies-series"){

            return (
                <React.Fragment>
                    <Breadcrum {...this.props}  onChange={this.onChange} subcategories={this.state.subcategories} subsubcategories={this.state.subsubcategories} image={this.state.category.image ? this.state.category.image : this.props.pageData.appSettings["movie_category_default_photo"]} title={this.state.category.title} />
                    
                    <div className="container details-tab">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item">
                                <a className={`nav-link active`} data-bs-toggle="tab" href="#movies" role="tab" aria-controls="discription" aria-selected="false">{Translate(this.props,"Movies")}</a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link`} data-bs-toggle="tab" href="#series" role="tab" aria-controls="discription" aria-selected="false">{Translate(this.props,"Series")}</a>
                            </li>
                        </ul>

                        <div className="tab-content" id="myTabContent">
                            <div className={`tab-pane fade active show`} id="movies" role="tabpanel">
                                <div className="details-tab-box">
                                        <InfiniteScroll 
                                            dataLength={this.state.items.length}
                                            next={this.loadMoreContent}
                                            hasMore={this.state.pagging}
                                            loader={<LoadMore {...this.props} page={this.state.page} loading={true}  itemCount={this.state.items.length}  />}
                                            endMessage={
                                                <EndContent {...this.props} text={Translate(this.props,"No movies created in this category yet.") } itemCount={this.state.items.length} />
                                            }
                                            pullDownToRefresh={false}
                                            pullDownToRefreshContent={<Release release={false} {...this.props} />}
                                            releaseToRefreshContent={<Release release={true} {...this.props} />}
                                            refreshFunction={this.refreshContent}
                                        >
                                            <div className="gridContainer gridMovie">
                                                {
                                                    this.state.items.map(item => {
                                                        return <div className="item" key={item.movie_id}><Movie {...this.props} key={item.movie_id}  {...item} movie={item}  /></div>
                                                    }) 
                                                }
                                            </div>
                                        </InfiniteScroll>
                                </div>
                            </div>

                            <div className={`tab-pane fade`} id="series" role="tabpanel">
                                <div className="details-tab-box">
                                        <InfiniteScroll
                                            dataLength={this.state.series.length}
                                            next={this.loadMoreSeriesContent}
                                            hasMore={this.state.seriespagging}
                                            loader={<LoadMore {...this.props} page={this.state.seriespage} loading={true}  itemCount={this.state.series.length}  />}
                                            endMessage={
                                                <EndContent {...this.props} text={Translate(this.props,"No series created in this category yet.")} itemCount={this.state.series.length} />
                                            }
                                            pullDownToRefresh={false}
                                            pullDownToRefreshContent={<Release release={false} {...this.props} />}
                                            releaseToRefreshContent={<Release release={true} {...this.props} />}
                                            refreshFunction={this.refreshContent}
                                        >
                                            <div className="gridContainer gridMovie">
                                                {
                                                    this.state.series.map(item => {
                                                        return <div className="item" key={item.movie_id}><Movie {...this.props} key={item.movie_id}  {...item} movie={item}  /></div>
                                                    })
                                                }
                                            </div>
                                        </InfiniteScroll>
                                </div>
                            </div>
                        </div>
                    </div>

                </React.Fragment>
            )


        }

        return(
            <React.Fragment>
                    <Breadcrum {...this.props}  onChange={this.onChange} subcategories={this.state.subcategories} subsubcategories={this.state.subsubcategories} image={this.state.category.image ? this.state.category.image : this.props.pageData.appSettings[this.state.type+"_category_default_photo"]} title={this.state.category.title} />
                    <div className="user-area">
                            <InfiniteScroll
                                dataLength={this.state.items.length}
                                next={this.loadMoreContent}
                                hasMore={this.state.pagging}
                                loader={<LoadMore {...this.props} page={this.state.page} loading={true}  itemCount={this.state.items.length}  />}
                                endMessage={
                                    <EndContent {...this.props} text={this.state.type == "blog" ? Translate(this.props,"No blog created in this category yet.") : (this.state.type == "channel" ? Translate(this.props,'No channel created in this category yet.') : Translate(this.props,'No video created in this category yet.'))} itemCount={this.state.items.length} />
                                }
                                pullDownToRefresh={false}
                                pullDownToRefreshContent={<Release release={false} {...this.props} />}
                                releaseToRefreshContent={<Release release={true} {...this.props} />}
                                refreshFunction={this.refreshContent}
                            >
                                <div className="container">
                                    {items}
                                </div>
                            </InfiniteScroll>
                    </div>
            </React.Fragment>
        )
    }
}



  const mapDispatchToProps = dispatch => {
    return {
        openPlaylist: (open, video_id) => dispatch(playlist.openPlaylist(open, video_id)),
    };
};
export default connect(null,mapDispatchToProps)(Index)