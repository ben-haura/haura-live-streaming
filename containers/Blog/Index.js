import React from "react"
import { connect } from "react-redux";
import * as actions from '../../store/actions/general';
import UserImage from "../User/Image"
import UserTitle from "../User/Title"
import Timeago from "../Common/Timeago"
import Comment from "../../containers/Comments/Index"
import Link from "../../components/Link/index"
import MemberFollow from "../User/Follow"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import SocialShare from "../SocialShare/Index"
import Rating from "../Rating/Index"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import swal from "sweetalert"
import axios from "../../axios-orders"
const CarouselBlogs = dynamic(() => import("./CarouselBlogs"), {
    ssr: false
  }); 
import Translate from "../../components/Translate/Index"
import general from '../../store/actions/general';
import CensorWord from "../CensoredWords/Index"
import Plans from "../User/Plans"


class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            blog: this.props.pageData.blog,
            adult:this.props.pageData.adultBlog,
            needSubscription:props.pageData.needSubscription,
            plans:props.pageData.plans,
        }
    }
    deleteBlog = (e) => {
        e.preventDefault()
        swal({
            title: Translate(this.props, "Are you sure?"),
            text: Translate(this.props, "Once deleted, you will not be able to recover this blog!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', this.state.blog.custom_url)
                    const url = "/blogs/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal(Translate(this.props, "Error", "Something went wrong, please try again later"), "error");
                            } else {
                                this.props.openToast(Translate(this.props,response.data.message), "success");
                                Router.push(`/dashboard?type=blogs`, `/dashboard/blogs`)
                            }
                        }).catch(err => {
                            swal("Error", Translate(this.props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if ((nextProps.pageData.blog && nextProps.pageData.blog != prevState.blog)) {
            return { 
                blog: nextProps.pageData.blog, adult:nextProps.pageData.adultBlog,
                needSubscription:nextProps.pageData.needSubscription,
                plans:nextProps.pageData.plans,
            }
        } else{
            return null
        }
    }

    componentDidMount() {
        this.props.socket.on('blogDeleted', data => {
            let id = data.blog_id
            if (this.state.blog && id == this.state.blog.blog_id && (!this.props.pageData.loggedInUserDetails || data.owner_id != this.props.pageData.loggedInUserDetails.user_id)) {
                window.location.reload()
            }
        })
        this.props.socket.on('unfollowUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.blog && id == this.state.blog.owner.user_id && type == "members") {
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    if (this.state.blog.owner_id == id) {
                        const data = this.state.blog
                        const owner = data.owner
                        owner.follower_id = null
                        this.setState({localUpdate:true, blog: data })
                    }
                }
            }
        });
        this.props.socket.on('followUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.blog && id == this.state.blog.owner.user_id && type == "members") {
                if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                    if (this.state.blog.owner_id == id) {
                        const data = this.state.blog
                        const owner = data.owner
                        owner.follower_id = 1
                        this.setState({localUpdate:true, blog: data })
                    }
                }
            }
        });
        this.props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            if (this.state.blog && id == this.state.blog.blog_id && type == "blogs") {
                const data = this.state.blog
                data.rating = rating
                this.setState({localUpdate:true, blog: data })
            }
        });
        this.props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.blog && id == this.state.blog.blog_id && type == "blogs") {
                if (this.state.blog.blog_id == id) {
                    const data = this.state.blog
                    data.favourite_count = data.favourite_count - 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = null
                    }
                    this.setState({localUpdate:true, blog: data })
                }
            }
        });
        this.props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (this.state.blog && id == this.state.blog.blog_id && type == "blogs") {
                if (this.state.blog.blog_id == id) {
                    const data = this.state.blog
                    data.favourite_count = data.favourite_count + 1
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = 1
                    }
                    this.setState({localUpdate:true, blog: data })
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
            if (this.state.blog && itemType == "blogs" && this.state.blog.blog_id == itemId) {
                const item = this.state.blog
                let loggedInUserDetails = {}
                if (this.props.pageData && this.props.pageData.loggedInUserDetails) {
                    loggedInUserDetails = this.props.pageData.loggedInUserDetails
                }
                if (removeLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['like_count'] = parseInt(item['like_count']) - 1
                }
                if (removeDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['dislike_count'] = parseInt(item['dislike_count']) - 1
                }
                if (insertLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "like"
                    item['like_count'] = parseInt(item['like_count']) + 1
                }
                if (insertDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "dislike"
                    item['dislike_count'] = parseInt(item['dislike_count']) + 1
                }
                this.setState({localUpdate:true, blog: item })
            }
        });

    }
    openReport = (e) => {
        e.preventDefault()
        if (this.props.pageData && !this.props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            this.props.openReport(true, this.state.blog.custom_url, 'blogs')
        }
    }
    replaceTags(description) {
        if(!description){
            return description
        }
        description = description.replace(/(<a [^>]*)(target="[^"]*")([^>]*>)/gi, '$1$3');
        description = description.replace(/(<a [^>]*)(>)/gi, '$1 target="_blank" rel="nofollow"$2');
        return description;
    }
    componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank" rel="nofollow">
          {text}
        </a>
     );
    render() {
        return (
            
                <React.Fragment>
                <div className="user-area">
                    <div className="maxwidht1300">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                            {
                                this.state.blog && this.state.blog.approve != 1 ? 
                                    <div className="generalErrors  approval-pending">
                                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                            {Translate(this.props,'This blog still waiting for admin approval.')}
                                        </div>
                                    </div>
                                : null
                                }
                                <div className="blog-details">
                                {
                                    this.state.adult ?
                                            <div className="adult-wrapper">
                                                {Translate(this.props,'This blog contains adult content.To view this blog, Turn on adult content setting from site footer.')}
                                            </div>
                                    :
                                    <React.Fragment>
                                    <div className="blog-details-title">
                                        <h1 className="title">
                                            <CensorWord {...this.props} text={this.state.blog.title} />
                                        </h1>
                                    </div>
                                    <div className="UserInfo clearfix">
                                        <div className="img">
                                            <UserImage  {...this.props} data={this.state.blog.owner} imageSuffix={this.props.pageData.imageSuffix} />
                                        </div>
                                        <div className="blog_user">
                                            <div className="content">
                                                <span className="userflow">
                                                    <UserTitle  {...this.props} data={this.state.blog.owner} className="UserName"></UserTitle>
                                                    {
                                                    this.props.pageData.loggedInUserDetails &&  this.state.blog.owner.user_id != this.props.pageData.loggedInUserDetails.user_id ? 
                                                    <MemberFollow  {...this.props} type="members" user={this.state.blog.owner} user_id={this.state.blog.owner.follower_id} />
                                                    : null
                                                    }
                                                </span>                                            
                                            </div>
                                            <div className="blog_time"><span><Timeago {...this.props}>{this.state.blog.creation_date}</Timeago></span> · <span>{this.state.blog.readingTime.text}</span></div>
                                        </div>
                                    </div>
                                    {
                                                this.state.blog.category ?
                                                    <div className="categories">
                                                        {
                                                            <Link href={`/category`} customParam={`type=blog&id=${this.state.blog.category.slug}`} as={`/blog/category/` + this.state.blog.category.slug}>
                                                                <a >
                                                                    {this.props.t(this.state.blog.category.title)}
                                                                </a>
                                                            </Link>
                                                        }
                                                        {
                                                            this.state.blog.subcategory ?
                                                                <React.Fragment>
                                                                    <Link href={`/category`} customParam={`type=blog&id=${this.state.blog.subcategory.slug}`} as={`/blog/category/` + this.state.blog.subcategory.slug}>
                                                                        <a >
                                                                            {`${this.props.t(this.state.blog.subcategory.title)}`}
                                                                        </a>
                                                                    </Link>
                                                                    {
                                                                        this.state.blog.subsubcategory ?
                                                                            <React.Fragment>
                                                                                <Link href={`/category`}  customParam={`type=blog&id=${this.state.blog.subsubcategory.slug}`} as={`/blog/category/` + this.state.blog.subsubcategory.slug}>
                                                                                    <a >
                                                                                        {`${this.props.t(this.state.blog.subsubcategory.title)}`}
                                                                                    </a>
                                                                                </Link>
                                                                            </React.Fragment>
                                                                            : null
                                                                    }
                                                                </React.Fragment>
                                                                : null
                                                        }
                                                    </div>
                                                    : null
                                            }
                                    <div className="blog-content">
                                        {
                                        this.state.needSubscription ? 
                                            <div className="details-tab">
                                                <div className={`tab-content tab-pane active show`}>
                                                    <div className="details-tab-box">
                                                        <p className="plan-upgrade-subscribe">
                                                            {
                                                            this.state.needSubscription.type == "upgrade" ? 
                                                                this.props.t("To watch more content, kindly upgrade your Subcription Plan.")
                                                                :
                                                                this.props.t("To watch more content, kindly Subscribe.")
                                                            }
                                                        </p>
                                                        <Plans {...this.props} userSubscription={this.state.needSubscription.loggedin_package_id ? true : false} userSubscriptionID={this.state.needSubscription.loggedin_package_id} itemObj={this.state.blog} member={this.state.blog.owner} user_id={this.state.blog.owner_id} plans={this.state.plans} />
                                                    </div>
                                                </div>
                                            </div>
                                        : 
                                        <React.Fragment>
                                            {
                                                this.state.blog.image ?
                                                    <div className="img-fluid mb-3">
                                                        <img className="imgFull400h" src={this.props.pageData.imageSuffix + this.state.blog.image} alt={CensorWord("fn",this.props,this.state.blog.title)} />
                                                    </div>
                                                    : null
                                            }
                                            <div className="content user-html" dangerouslySetInnerHTML={{ __html: this.replaceTags(this.state.blog.description) }}>
                                                
                                            </div>
                                        </React.Fragment>
                                        }
                                        
                                    </div>
                                    {
                                        this.state.blog.tags && this.state.blog.tags != "" ?
                                            <div className="blogtagListWrap">
                                                <ul className="blogtagList clearfix">
                                                    {
                                                        this.state.blog.tags.split(',').map(tag => {
                                                            return (
                                                                <li key={tag}>
                                                                    <Link href="/blogs" customParam={`tag=${tag}`} as={`/blogs?tag=${tag}`}>
                                                                        <a>{<CensorWord {...this.props} text={this.props.t(tag)} />}</a>
                                                                    </Link>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                            : null
                                    }

                                    <div className="BlogShareLike blogDetailsBtmCol">
                                    {
                                        this.state.blog.approve == 1 ? 
                                        <React.Fragment>
                                            <div className="LikeDislikeWrap">
                                                <ul className="LikeDislikeList">
                                                    <li>
                                                        <Like  {...this.props} icon={true} like_count={this.state.blog.like_count} item={this.state.blog} type="blog" id={this.state.blog.blog_id} />
                                                    </li>
                                                    <li>
                                                        <Dislike  {...this.props} icon={true} dislike_count={this.state.blog.dislike_count} item={this.state.blog} type="blog" id={this.state.blog.blog_id} />
                                                    </li>
                                                    <li>
                                                        <Favourite  {...this.props} icon={true} favourite_count={this.state.blog.favourite_count} item={this.state.blog} type="blog" id={this.state.blog.blog_id} />
                                                    </li>
                                                    <SocialShare  hideTitle={true} {...this.props} tags={this.state.blog.tags} url={`/blog/${this.state.blog.custom_url}`} title={CensorWord("fn",this.props,this.state.blog.title)} imageSuffix={this.props.pageData.imageSuffix} media={this.state.blog.image} />
                                                <div className="dropdown TitleRightDropdown">
                                                    <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_horiz"></span></a>
                                                    <ul className="dropdown-menu dropdown-menu-right edit-options">
                                                    {
                                                        this.state.blog.canEdit ?
                                                        <li>
                                                            <Link href="/create-blog" customParam={`id=${this.state.blog.custom_url}`} as={`/create-blog/${this.state.blog.custom_url}`}>
                                                                <a><span className="material-icons" data-icon="edit"></span>{Translate(this.props, "Edit")}</a>
                                                            </Link>
                                                            </li>
                                                            : null
                                                    }
                                                    {
                                                        this.state.blog.canDelete ?
                                                        <li>
                                                            <a onClick={this.deleteBlog.bind(this)} href="#"><span className="material-icons" data-icon="delete"></span>{Translate(this.props, "Delete")}</a>
                                                            </li>
                                                            : null
                                                    }
                                                     {
                                                        this.state.blog.approve == 1 && !this.state.blog.canEdit ? 
                                                    <li>
                                                        <a href="#" onClick={this.openReport.bind(this)}>
                                                            <span className="material-icons" data-icon="flag"></span>
                                                            {Translate(this.props, "Report")}
                                                        </a>
                                                    </li>
                                                     : null
                                                    }
                                                    </ul>
                                                </div>
                                                </ul>
                                            </div>
                                        
                                        {
                                            !this.state.needSubscription && this.props.pageData.appSettings[`${"blog_rating"}`] == 1 ?
                                                <div className="animated-rater">
                                                    <Rating {...this.props} rating={this.state.blog.rating} type="blog" id={this.state.blog.blog_id} />
                                                </div>
                                                : null
                                        }
                                        </React.Fragment>
                                        : null
                                    }
                                        

                                       
                                    </div>
                                    </React.Fragment>
                                }
                                    {
                                        this.props.pageData.relatedBlogs ?
                                            <CarouselBlogs {...this.props}  {...this.props} carouselType="blog" blogs={this.props.pageData.relatedBlogs} />
                                            : null
                                    }
                                {
                                    !this.state.adult && this.state.blog.approve == 1 ?
                                    <div className="blog-comment container">
                                        <div className="row">
                                            <div className="col-sm-12 col-12">
                                                <Comment {...this.props}  owner_id={this.state.blog.owner_id} appSettings={this.props.pageData.appSettings} commentType="blog" type="blogs" comment_item_id={this.state.blog.blog_id} />
                                            </div>
                                        </div>
                                    </div>
                                : null
                                }
                                </div>
                            </div>
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
        openToast: (message, typeMessage) => dispatch(actions.openToast(message, typeMessage)),
        openReport: (status, contentId, contentType) => dispatch(general.openReport(status, contentId, contentType))
    };
};

export default connect(null, mapDispatchToProps)(Index)