import React from "react"
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import Image from "../Image/Index"
import Date from "../Date"
import Translate from "../../components/Translate/Index"
import Link from "../../components/Link/index";
import AddReview from "../Form/Review"
import Rating from "../../containers/Rating/Index"

class Reviews extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            pagging:props.reviews.pagging,
            reviews:props.reviews.results,
            page:2,
            moreItems:[],
            movie:props.movie,
            canEdit:props.canEdit,
            canDelete:props.canDelete,
            writereview:false
        }
        this.refreshContent = this.refreshContent.bind(this)
        this.loadMoreContent = this.loadMoreContent.bind(this)
    }
    getItemIndex(item_id) {
        const reviews = [...this.state.reviews];
        const itemIndex = reviews.findIndex(p => p["review_id"] == item_id);
        return itemIndex;
    }

    componentDidMount(){
        this.props.socket.on('reviewMovieDelete', data => {
            let id = data.id
            let movieID = data.movieID
            if (this.state.movie && this.state.movie.movie_id == movieID) {
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const reviews = [...this.state.reviews]
                    reviews.splice(itemIndex, 1);
                    this.setState({localUpdate:true, reviews: reviews })
                }
            }
        });
        this.props.socket.on('movieReviewUpdated', data => {
            let review = data.review
            if (this.state.movie && this.state.movie.movie_id == review.movie_id) {
                const itemIndex = this.getItemIndex(review.review_id)
                if (itemIndex > -1) {
                    const reviews = [...this.state.reviews]
                    reviews[itemIndex] = review
                    this.setState({localUpdate:true, reviews: reviews })
                }
            }
        });
        this.props.socket.on('movieReviewCreated', data => {
            let review = data.review
            if (this.state.movie && this.state.movie.movie_id == review.movie_id) {
                const reviews = [...this.state.reviews]
                reviews.unshift(review)
                this.setState({localUpdate:true, reviews: reviews })
            }
        });
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.pageData.movie != prevState.movie) {
           return {
                pagging:nextProps.reviews.pagging,
                reviews:nextProps.reviews.results,
                page:2,
                moreItems:[],
                movie:nextProps.movie,
                writereview:false
            }
        } else{
            return null
        }

    }
    refreshContent(){
        this.setState({localUpdate:true,page:1,cast:[]})
        this.loadMoreContent()
    }
    loadMoreContent(){
        this.getContent()
    }
    loadMoreContent(){
        this.setState({localUpdate:true,loading:true})
        let formData = new FormData();        
        formData.append('page',this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = "/movies/reviews"
        formData.append('movie_id',this.state.movie.movie_id)
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.reviews){
                let pagging = response.data.pagging
                this.setState({localUpdate:true,page:this.state.page+1,pagging:pagging,reviews:[...this.state.reviews,...response.data.reviews],loading:false})
            }else{
                this.setState({localUpdate:true,loading:false})
            }
        }).catch(err => {
            this.setState({localUpdate:true,loading:false})
        });
    }
    writeAReview = () => {
        if(this.props.pageData.loggedInUserDetails){
            const reviews = [...this.state.reviews];
            const itemIndex = reviews.findIndex(p => p["owner_id"] == this.props.pageData.loggedInUserDetails.user_id);
            if(itemIndex > -1){
                let review = reviews[itemIndex]
                this.setState({localUpdate:true,writereview:true,editItem:review})
            }else{
                this.setState({localUpdate:true,writereview:true})
            }
        }else{
            document.getElementById('loginFormPopup').click();
            return
        }
    }
    delete = (id,e) => {
        e.preventDefault();
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: Translate(this.props, `Once deleted, you will not be able to recover this review!`),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                const formData = new FormData()
                formData.append('movie_id', this.state.movie.movie_id)
                formData.append('review_id', id)
                const url = "/review/delete"
                axios.post(url, formData)
                    .then(response => {
                        if (response.data.error) {
                            swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                        } else {
                            
                        } 
                    }).catch(err => {
                        swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                    });
                //delete
            } else {

            }
        });
    }
    closePopup = () => {
        this.setState({localUpdate:true,editItem:null,writereview:false})
    }
    render(){

        return (
            <React.Fragment>
                {
                    this.state.writereview ? 
                        <div className="popup_wrapper_cnt">
                            <div className="popup_cnt">
                                <div className="comments">
                                    <div className="VideoDetails-commentWrap">
                                        <div className="popup_wrapper_cnt_header">
                                            <h2>{Translate(this.props, !this.state.editItem ? "Add Review" : "Update Review")}</h2>
                                            <a onClick={this.closePopup} className="_close"><i></i></a>
                                        </div>
                                        <div className="row">
                                            <AddReview {...this.props} closePopup={this.closePopup} movie_id={this.state.movie.movie_id} editItem={this.state.editItem} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    : null
                }
                <button className="write-review mb-3" onClick={this.writeAReview}>{this.props.t("Write a Review")}</button>
                <InfiniteScroll
                    dataLength={this.state.reviews.length}
                    next={this.loadMoreContent}
                    hasMore={this.state.pagging}
                    loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.reviews.length} />}
                    endMessage={
                        <EndContent {...this.props} text={Translate(this.props,"There are no reviews created yet.")} itemCount={this.state.reviews.length} />
                    }
                    pullDownToRefresh={false}
                    pullDownToRefreshContent={<Release release={false} {...this.props} />}
                    releaseToRefreshContent={<Release release={true} {...this.props} />}
                    refreshFunction={this.refreshContent}
                >
                    {
                        this.state.reviews.map(review => {
                            let descriptionText = review.description
                            let type = ""
                            if(descriptionText.length > 500){
                                if(this.state.moreItems[review.review_id]){
                                    type = "less"
                                }else{
                                    descriptionText = descriptionText.substring(0,500)+"...";
                                    type = "more"
                                }
                            }
                            let description = descriptionText
                            return (
                                <div key={review.review_id} className='review-container'>
                                    <div className="header">
                                        <div className="image">
                                        <Link href="/member" customParam={`id=${review.username}`} as={`/${review.username}`}>
                                            <a>                        
                                                <Image title={review.displayname} height="40" width="40" image={review.avtar} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                            </a>
                                        </Link>
                                        </div>
                                        <div className="info">
                                            <div className="author">
                                                <Link href="/member" customParam={`id=${review.username}`} as={`/${review.username}`}>
                                                    <a>                        
                                                        {review.displayname}
                                                    </a>
                                                </Link>
                                            </div>
                                            <div className="date">
                                                {
                                                    <span dangerouslySetInnerHTML={{__html:Date(this.props,review.creation_date,this.props.initialLanguage,'dddd, MMMM Do YYYY',this.props.pageData.defaultTimezone)}}></span>
                                                }
                                            </div>
                                            <div className="rating">
                                                <Rating {...this.props} rating={review.rating} hideStats={true} updateRating={true} ratingInteract={true} />
                                            </div>
                                        </div>
                                        {
                                            this.state.canDelete || (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == review.owner_id) ?
                                                <div className="option">
                                                    <a href="#" onClick={this.delete.bind(this,review.review_id)}>
                                                        <span className="material-icons" data-icon="delete"></span>
                                                    </a>
                                                </div>
                                        : null
                                        }
                                    </div>
                                    <div className="content">
                                        <span>
                                            {description}
                                        </span>
                                        {
                                            type == "more" ? 
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                let items = [...this.state.moreItems]
                                                items[review.review_id] = review.review_id;
                                                this.setState({localUpdate:true,moreItems:items})
                                            }}>
                                                {this.props.t("view more")}
                                            </a>
                                            : type == "less" ?
                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    let items = [...this.state.moreItems]
                                                    items[review.review_id] = null
                                                    this.setState({localUpdate:true,moreItems:items})
                                                }}>
                                                    {this.props.t("view less")}
                                                </a>
                                            : null
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </InfiniteScroll>
            </React.Fragment>
        )
    }
}



export default Reviews