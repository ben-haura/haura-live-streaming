import React from "react"
import Movie from './Item'
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Search from "../Search/Index"
import Translate from "../../components/Translate/Index";
import dynamic from 'next/dynamic'
const Slideshow = dynamic(() => import("./Slideshow"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="slider shimmer"> </div>
    </div>
});

class Browse extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            movies: props.movies ? props.movies :  (props.pageData.movies ? props.pageData.movies : props.pageData.items.results),
            page: 2,
            type: "movie",
            pagging: typeof props.pagging != "undefined" ? props.pagging : (typeof props.pageData.pagging != "undefined" ? props.pageData.pagging : props.pageData.items.pagging),
            loading: false,
            searchType: "creation_date",
            search: props.search ? props.search : [],
            contentType:props.contentType,
            slideshow:props.pageData.slideshow
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
        }else if (nextProps.movies && nextProps.movies != prevState.movies) {
            return {slideshow:nextProps.pageData.slideshow, movies: nextProps.movies, pagging: nextProps.pagging, page: 2, search: nextProps.search ? nextProps.search : [],pageType:nextProps.pageType }
        }else if (nextProps.pageData.movies && nextProps.pageData.movies != prevState.movies) {
            return {slideshow:nextProps.pageData.slideshow, movies: nextProps.pageData.movies, pagging: nextProps.pageData.pagging, page: 2, search: nextProps.search ? nextProps.search : [],pageType:nextProps.pageData.pageType }
        } else if (nextProps.pageData.movies && nextProps.pageData.movies != prevState.movies) {
            return {slideshow:nextProps.pageData.slideshow, movies: nextProps.pageData.movies, pagging: nextProps.pageData.pagging, page: 2, search: nextProps.search ? nextProps.search : [],pageType:nextProps.pageData.pageType }
        } else {
            return null
        }
    }
    
    componentDidMount() {
        this.props.socket.on('movieDeleted', data => {
            let id = data.movie_id
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const movies = [...this.state.movies]
                movies.splice(itemIndex, 1);
                this.setState({localUpdate:true, movies: movies })
            }
        })
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType 
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1 && type == this.state.type + "s") {
                const items = [...this.state.movies]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, movies: items })
            }
        });
        this.props.socket.on('unwatchlaterMovies', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...this.state.movies]
                const changedItem = {...items[itemIndex]}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.watchlater_id = null
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, movies: items })
            }
        });
        this.props.socket.on('watchlaterMovies', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...this.state.movies]
                const changedItem = {...items[itemIndex]}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.watchlater_id = 1
                }
                items[itemIndex] = changedItem
                this.setState({localUpdate:true, movies: items })
            }
        });

        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == this.state.type + "s") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const movies = [...this.state.movies]
                    const changedItem = {...movies[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    movies[itemIndex] = changedItem
                    this.setState({localUpdate:true, movies: movies })
                }
            }
        });
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == this.state.type + "s") {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const movies = [...this.state.movies]
                    const changedItem = {...movies[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    movies[itemIndex] = changedItem
                    this.setState({localUpdate:true, movies: movies })
                }
            }
        });


        this.props.socket.on('likeDislike', data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId = data.ownerId
            let removeLike = data.removeLike
            let removeDislike = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike = data.insertDislike
            if (itemType == this.state.type + "s") {
                const itemIndex = this.getItemIndex(itemId)
                if (itemIndex > -1) {
                    const movies = [...this.state.movies]
                    const changedItem =  {...movies[itemIndex]};
                    let loggedInUserDetails = {}
                    if (this.props.pageData && this.props.pageData.loggedInUserDetails) {
                        loggedInUserDetails = this.props.pageData.loggedInUserDetails
                    }
                    if (removeLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['like_count'] = parseInt(changedItem['like_count']) - 1
                    }
                    if (removeDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) - 1
                    }
                    if (insertLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "like"
                        changedItem['like_count'] = parseInt(changedItem['like_count']) + 1
                    }
                    if (insertDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "dislike"
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) + 1
                    }
                    movies[itemIndex] = changedItem
                    this.setState({localUpdate:true, movies: movies })
                }
            }
        });
    }
    getItemIndex(item_id) {
        const movies = [...this.state.movies];
        const itemIndex = movies.findIndex(p => p["movie_id"] == item_id);
        return itemIndex;
    }

    refreshContent() {
        this.setState({localUpdate:true, page: 1, movies: [] })
        this.loadMoreContent()
    }
    searchResults(values) {
        this.setState({localUpdate:true, page: 1 })
        this.loadMoreContent(values)
    }
    loadMoreContent(values) {

        this.setState({localUpdate:true, loading: true })
        let formData = new FormData();
        formData.append('page', this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `/movies-browse`;
        let queryString = "" 
        if(this.props.typeData == "series"){
            formData.append("type","series")
        }else{
            formData.append("type","movies")
        }
        if (this.props.pageData.search) {
            queryString = Object.keys(this.props.pageData.search).map(key => key + '=' + this.props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        }else if(this.props.user_id){
            formData.append('owner_id',this.props.user_id)
             url = `/members/movies`;
        } else if (this.props.globalSearch) {
            queryString = Object.keys(this.state.search).map(key => key + '=' + this.state.search[key]).join('&');
            url = `/search?${queryString}`
        }else if(this.props.contentTypeMovie){
            formData.append('moviePurchased','1')
            formData.append('movie_user_id',this.props.member.user_id)            
        }else if(this.props.contentType){
            let queryUser = ""
            if(this.props.userContent){
                queryUser = "?user="+this.props.userContent
            }
            url = `/dashboard/${this.props.typeData}/${this.props.contentType}${queryUser}`;
        }
        if(this.props.is_cast){
            url = "/movies-browse"
            formData.append("is_cast",this.props.is_cast)
        }
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.movies) {
                    let pagging = response.data.pagging
                    this.setState({localUpdate:true, page: this.state.page + 1, pagging: pagging, movies: [...this.state.movies, ...response.data.movies], loading: false })
                } else {
                    this.setState({localUpdate:true, loading: false })
                }
            }).catch(err => {
                this.setState({localUpdate:true, loading: false })
            });
    }
    
    render() {
        return (
            <React.Fragment>
                {
                    this.state.slideshow ? 
                    <Slideshow {...this.props} slides={this.state.slideshow}  />
                    : null
                }
                {
                    !this.props.globalSearch ? 
                    <div className={`${!this.props.no_user_area ? "user-area" : ""}`}>
                        {
                            (!this.props.globalSearch && !this.props.contentType) || this.props.showSearch ?
                                <div className="container">
                                    <Search {...this.props} type="movie" typeData={this.props.typeData} />
                                </div>
                                : null
                        }
                        <InfiniteScroll
                            dataLength={this.state.movies.length}
                            next={this.loadMoreContent}
                            hasMore={this.state.pagging}
                            loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.movies.length} />}
                            endMessage={
                                <EndContent {...this.props} text={this.props.pageData.search || this.props.globalSearch ?  Translate(this.props,`No ${this.props.typeData ? this.props.typeData : "movies"} found with your matching criteria.`) : Translate(this.props,`No ${this.props.typeData ? this.props.typeData : "movies"} found to display.`)} itemCount={this.state.movies.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...this.props} />}
                            releaseToRefreshContent={<Release release={true} {...this.props} />}
                            refreshFunction={this.refreshContent}
                        >
                            <div className={`${!this.props.no_user_area ? "container" : ""}`}>
                                <div className="gridContainer gridMovie">
                                    {
                                        this.state.movies.map(item => {
                                            return  <div className="item" key={item.movie_id}><Movie {...this.props}   {...item} movie={item}  /></div>
                                        })
                                    }
                                </div>
                            </div>
                        </InfiniteScroll>      
                    </div>
                :
                <div className="cnt-movies">
                    <InfiniteScroll
                            dataLength={this.state.movies.length}
                            next={this.loadMoreContent}
                            hasMore={this.state.pagging}
                            loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.movies.length} />}
                            endMessage={
                                <EndContent {...this.props} text={this.props.pageData.search || this.props.globalSearch ?  Translate(this.props,'No data found with your matching criteria.') : Translate(this.props,'No data found to display.')} itemCount={this.state.movies.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...this.props} />}
                            releaseToRefreshContent={<Release release={true} {...this.props} />}
                            refreshFunction={this.refreshContent}
                        >
                            <div className="container">
                                <div className="gridContainer gridMovie">
                                    {
                                        this.state.movies.map(item => {
                                            return <div className="item" key={item.movie_id}><Movie {...this.props} key={item.movie_id}  {...item} movie={item}  /></div>
                                        })
                                    }
                                </div>
                            </div>
                    </InfiniteScroll> 
                </div>
            }
            </React.Fragment>
        )
    }
}



export default Browse