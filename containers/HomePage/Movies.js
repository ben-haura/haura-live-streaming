import React from "react"
import Item from "../Movies/Item"
import Translate from "../../components/Translate/Index"
import dynamic from 'next/dynamic'
import Link from "../../components/Link"

const Carousel = dynamic(() => import("../Slider/Index"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="heading shimmer"></div>
        <div className="grid">
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
        </div>
    </div>
});

class CarouselMovies extends React.Component {
    constructor(props) {
        super(props)
        let propsData = {...props}
        this.state = {
            movies: propsData.movies,
            key: 1,
            type:"movie",
            language:propsData.i18n.language,
        }
        this.slider = null
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.movies != prevState.movies || nextProps.i18n.language != prevState.language) {
            return { movies: nextProps.movies,language:nextProps.i18n.language }
        } else{
            return null
        }

    }
    
    componentDidMount(){
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
    
    render() {
        if (!this.state.movies || !this.state.movies.length) {
            return null
        }
       

        const content = this.state.movies.map(result => {
            return <div  key={result.movie_id}><Item {...this.props} {...result} movie={result} /></div>
        })

        return (
            <div className="VideoRoWrap">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="titleWrap">
                            {
                                this.props.pageData.themeType == 2 && this.props.seemore ?
                                <Link href={`/${this.props.headerType == "Series" ? "series" : "movies"}?${this.props.type ? "type" : "sort"}=${this.props.type ? this.props.type : this.props.sort}`}>
                                    <a className="link">
                                        <span className="title">
                                            <React.Fragment>
                                                {
                                                    this.props.headerTitle ? 
                                                        this.props.headerTitle : 
                                                        null
                                                }
                                                {Translate(this.props,this.props.title)}
                                            </React.Fragment>
                                        </span>
                                    </a>
                                    </Link>
                                :
                                <span className="title">
                                    <React.Fragment>
                                        {
                                            this.props.headerTitle ?
                                                this.props.headerTitle :
                                                null
                                        }
                                        {Translate(this.props, this.props.title ? this.props.title : `Popular ${this.props.headerType}`)}
                                    </React.Fragment>
                                </span>
                                }
                                {
                                    this.props.seemore && this.state.movies.length > 8 ?
                                        this.props.headerType == "Series" ? 
                                        <Link href={`/series?${this.props.type ? "type" : "sort"}=${this.props.type ? this.props.type : this.props.sort}`}>
                                            <a className="seemore_link">
                                                {Translate(this.props, "See more")}
                                            </a>
                                        </Link>
                                        :
                                        <Link href={`/movies?${this.props.type ? "type" : "sort"}=${this.props.type ? this.props.type : this.props.sort}`}>
                                            <a className="seemore_link">
                                                {Translate(this.props, "See more")}
                                            </a>
                                        </Link>
                                        : null
                                }
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            {
                                <Carousel {...this.props} carouselType="movie" items={content} itemAt1024={4} itemAt1200={4} itemAt900={3} itemAt600={2} itemAt480={1} >
                                    {content}
                                </Carousel>
                            }
                        </div>
                    </div>


                </div>
            </div>
        )
    }
}



export default CarouselMovies