import React, { Component } from "react"
import { connect } from "react-redux";
import * as actions from '../../store/actions/general';
import Validator from '../../validators';
import axios from "../../axios-orders"
const AddVideos = dynamic(() => import("../../containers/Video/Popup"), {
  ssr: false
});
const Form = dynamic(() => import("../../components/DynamicForm/Index"), {
  ssr: false
});
import Cover from "../Cover/Index"
import Translate from "../../components/Translate/Index"
import Rating from "../Rating/Index"
const Comment = dynamic(() => import("../Comments/Index"), {
  ssr: false
});
import Videos from "./Videos"
const Playlists = dynamic(() => import("../Playlist/Playlists"), {
  ssr: false
});
const Artists = dynamic(() => import("../Artist/Artists"), {
  ssr: false
});
import dynamic from 'next/dynamic'
import Router from 'next/router';
import swal from "sweetalert"
import Link from "../../components/Link/index"
import CensorWord from "../CensoredWords/Index"
import ShortNumber from "short-number"
const Community = dynamic(() => import("./Communities"), {
  ssr: false
});
import AddPost from "./AddPost"
const Members = dynamic(() => import("../User/Browse"), {
  ssr: false
});
const CarouselChannels = dynamic(() => import("./CarouselChannel"), {
  ssr: false
});

const Plans = dynamic(() => import("../User/Plans"), {
  ssr: false
});
import Date from "../Date"

class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      submitting: false,
      channel: props.pageData.channel,
      openPopup: false,
      openPlaylistPopup: false,
      relatedChannels: props.pageData.relatedChannels,
      password:props.pageData.password,
      adult:props.pageData.adultChannel,
      needSubscription:props.pageData.needSubscription,
      plans:props.pageData.plans,
      tabType:props.pageData.tabType ? props.pageData.tabType : "videos"
    }
    this.closePopup = this.closePopup.bind(this)
    this.chooseVideos = this.chooseVideos.bind(this)
    this.closePlaylistPopup = this.closePlaylistPopup.bind(this)
    this.choosePlaylist = this.choosePlaylist.bind(this)
  }
  
  static getDerivedStateFromProps(nextProps, prevState) {
    if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
        return null;
    }
    console.log(nextProps);
    if(prevState.localUpdate){
        return {...prevState,localUpdate:false}
    }else if ( nextProps.pageData.channel != prevState.channel) {
        return { 
          channel: nextProps.pageData.channel, 
          relatedChannels: nextProps.pageData.relatedChannels,
          password:nextProps.pageData.password,
          adult:nextProps.pageData.adultChannel,
          openPopup:false,
          openPlaylistPopup:false,
          needSubscription:nextProps.pageData.needSubscription,
          plans:nextProps.pageData.plans,
          tabType:nextProps.pageData.tabType ? nextProps.pageData.tabType : "videos"
        }
    } else{
        return null
    }
  }
  checkPassword = model => {
    if (this.state.submitting) {
      return
    }
    const formData = new FormData();
    for (var key in model) {
      formData.append(key, model[key]);
    }
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    };
    let url = '/channels/password/' + this.props.pageData.id;

    this.setState({localUpdate:true, submitting: true, error: null });
    axios.post(url, formData, config)
      .then(response => {
        if (response.data.error) {
          this.setState({localUpdate:true, error: response.data.error, submitting: false });
        } else {
          this.setState({localUpdate:true, submitting: false, error: null })
        }
      }).catch(err => {
        this.setState({localUpdate:true, submitting: false, error: err });
      });
  }
  deleteChannel = (e) => {
    e.preventDefault()
    swal({
      title: Translate(this.props,"Are you sure?"),
      text: Translate(this.props,"Once deleted, you will not be able to recover this channel!"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          const formData = new FormData()
          formData.append('id', this.state.channel.custom_url)
          const url = "/channels/delete"
          axios.post(url, formData)
            .then(response => {
              if (response.data.error) {
                swal("Error", Translate(this.props,"Something went wrong, please try again later"), "error");
              } else {
                this.props.openToast(Translate(this.props,response.data.message), "success");
                Router.push(`/dashboard?type=channels`, `/dashboard/channels`)
              }
            }).catch(err => {
              swal("Error", Translate(this.props,"Something went wrong, please try again later"), "error");
            });
          //delete
        } else {

        }
      });
  }
  componentDidMount() {
    if($(".nav-tabs > li > a.active").length == 0){
      if(this.state.needSubscription){
        this.pushTab("plans")
      }else{
        this.pushTab("videos")
      }
    }
   
    this.props.socket.on('ratedItem', data => {
      let id = data.itemId
      let type = data.itemType
      let Statustype = data.type
      let rating = data.rating
      if (this.state.channel && id == this.state.channel.channel_id && type == "channels") {
        const data = {...this.state.channel}
        data.rating = rating
        this.setState({localUpdate:true, channel: data })
      }
    });


    this.props.socket.on('unfollowUser', data => {
      let id = data.itemId
      let type = data.itemType
      let ownerId = data.ownerId
      if (this.state.channel && id == this.state.channel.channel_id && type == "channels") {
        const data = {...this.state.channel}
        data.follow_count = data.follow_count - 1
        if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
          data.follower_id = null
        }
        this.setState({localUpdate:true, channel: data })
      }
    });

    this.props.socket.on('followUser', data => {
      let id = data.itemId
      let type = data.itemType
      let ownerId = data.ownerId
      if (this.state.channel && id == this.state.channel.channel_id && type == "channels") {
        const data = {...this.state.channel}
        data.follow_count = data.follow_count + 1
        if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
          data.follower_id = 1
        }
        this.setState({localUpdate:true, channel: data })
      }
    });

    this.props.socket.on('unfavouriteItem', data => {
      let id = data.itemId
      let type = data.itemType
      let ownerId = data.ownerId
      if (this.state.channel && id == this.state.channel.channel_id && type == "channels") {
        if (this.state.channel.channel_id == id) {
          const data = {...this.state.channel}
          data.favourite_count = data.favourite_count - 1
          if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
            data.favourite_id = null
          }
          this.setState({localUpdate:true, channel: data })
        }
      }
    });
    this.props.socket.on('favouriteItem', data => {
      let id = data.itemId
      let type = data.itemType
      let ownerId = data.ownerId
      if (this.state.channel && id == this.state.channel.channel_id && type == "channels") {
        if (this.state.channel.channel_id == id) {
          const data = {...this.state.channel}
          data.favourite_count = data.favourite_count + 1
          if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
            data.favourite_id = 1
          }
          this.setState({localUpdate:true, channel: data })
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
      if (this.state.channel && itemType == "channels" && this.state.channel.channel_id == itemId) {
        const item = {...this.state.channel}
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
        this.setState({localUpdate:true, channel: item })
      }
    });
    if(!this.state.needSubscription){
      this.props.socket.on('videoAdded', data => {
        if (this.state.channel &&  data.channel_id == this.state.channel.channel_id) {
          this.props.openToast(Translate(this.props,data.message), "success");
          setTimeout(() => {
            Router.push(`/channel?id=${this.state.channel.custom_url}`, `/channel/${this.state.channel.custom_url}`)
          },1000);
          
        }
      }) 
      this.props.socket.on('playlistAdded', data => {
        if (this.state.channel && data.channel_id == this.state.channel.channel_id) {
          this.props.openToast(data.message, "success");
          setTimeout(() => {
            Router.push(`/channel?id=${this.state.channel.custom_url}`, `/channel/${this.state.channel.custom_url}`)
          },1000);
          
        }
      })
    }
    this.props.socket.on('channelCoverReposition', data => {
      let id = data.channel_id
      if (this.state.channel && id == this.state.channel.channel_id) {
          const item = {...this.state.channel}
          item.cover_crop = data.image
          item.showCoverReposition = false
          this.setState({localUpdate:true, channel: item, loadingCover: false },() => {
            this.props.openToast(Translate(this.props, data.message), "success")
          })
          
      }
  });
    this.props.socket.on('channelMainPhotoUpdated', data => {
      let id = data.channel_id
      if (this.state.channel && id == this.state.channel.channel_id) {
        const item = {...this.state.channel}
        item.image = data.image
        item.showCoverReposition = false
        this.setState({localUpdate:true, channel: item },() => {
          this.props.openToast(Translate(this.props,data.message), "success");
        })
        
      }
    });
    this.props.socket.on('channelCoverUpdated', data => {
      let id = data.channel_id
      if (this.state.channel && id == this.state.channel.channel_id) {
        const item = {...this.state.channel}
        item.cover = data.image
        item.channelcover = true;
        item.cover_crop = data.cover_crop;
        if(data.image && (data.image.indexOf(".gif") == -1 && data.image.indexOf(".GIF") == -1)){
          item.showCoverReposition = true
        }
        this.setState({localUpdate:true, channel: item, loadingCover: false },() => {
          this.props.openToast(Translate(this.props,data.message), "success");
        })
      }
    });
  }
  openPopup = () => {
    this.setState({localUpdate:true, openPopup: true })
  }
  openImportPopup = () => {
    this.setState({localUpdate:true,openImportPopup:true})
  }
  closePopup = () => {
    this.setState({localUpdate:true, openPopup: false })
  }
  adPost = (e) => {
    e.preventDefault();
    this.setState({localUpdate:true,addpost:true});
  }
  closePOst = (postData) => {
    this.setState({localUpdate:true,addpost:false});
  }
  chooseVideos(e, selectedVideos) {
    if (selectedVideos) {
      this.setState({localUpdate:true, openPopup: false })
      let formData = new FormData();
      formData.append('channel_id', this.state.channel.channel_id)
      formData.append('selectedVideos', selectedVideos)
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      let url = '/channels/add-videos';
      axios.post(url, formData, config)
        .then(response => {
          if (response.data.videos) {
            //Router.push()
          }
        }).catch(err => {
          this.setState({localUpdate:true, loading: false })
        });
    }
    this.setState({localUpdate:true, openPopup: false })
  }

  openPlaylistPopup = () => {
    this.setState({localUpdate:true, openPlaylistPopup: true })
  }
  closePlaylistPopup = () => {
    this.setState({localUpdate:true, openPlaylistPopup: false })
  }
  choosePlaylist(e, selectedPlaylists) {
    if (selectedPlaylists) {
      let formData = new FormData();
      this.setState({localUpdate:true, openPlaylistPopup: false })
      formData.append('channel_id', this.state.channel.channel_id)
      formData.append('selectedPlaylists', selectedPlaylists)
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      let url = '/channels/add-playlists';
      axios.post(url, formData, config)
        .then(response => {

        }).catch(err => {
          this.setState({localUpdate:true, loading: false })
        });
    }
    this.setState({localUpdate:true, openPopup: false })
  }
  pushTab = (type) => {
    if(this.state.tabType == type || !this.state.channel){
      return
    }
    this.setState({tabType:type,localUpdate:true})
    Router.push(`/channel?id=${this.state.channel.custom_url}`, `/channel/${this.state.channel.custom_url}?type=${type}`,{ shallow: true })
  }
  formChannelSubmit = (e) => {
    e.preventDefault();
    if(this.state.channelFormSubmit || !this.state.channelID){
      return
    }
    this.setState({channelFormSubmit:true,localUpdate:true});
    let formData = new FormData();
      formData.append('channel_id', this.state.channel.channel_id)
      formData.append('channel_import_id', this.state.channelID)
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      let url = '/channels/import-yt-channel-videos';
      axios.post(url, formData, config)
      .then(response => {
        if(!response.data.error){
          this.props.openToast(Translate(this.props,response.data.message), "success");
        }else{
          this.setState({localUpdate:true, channelerror: response.data.error })
        }
      }).catch(err => {
        this.setState({localUpdate:true, channelFormSubmit: false })
      });
  }
  render() {
    let validatorUploadImport = []
    let fieldUploadImport = []
    validatorUploadImport.push({
      key: "password",
      validations: [
        {
          "validator": Validator.required,
          "message": "Password is required field"
        }
      ]
    })
    fieldUploadImport.push({ key: "password", label: "", type: "password",isRequired:true })

    // if(this.state.adult){
    //   return (
    //     <div>
    //       <div className="container">
    //         <div className="row">
    //           <div className="col-md-12">
    //               <div className="adult-wrapper">
    //                   {Translate(this.props,'This channel contains adult content.To view this channel, Turn on adult content setting from site footer.')}
    //               </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   )
    // }


    console.log(this.state);

    return (

      this.state.password ?
          <Form
            {...this.props}
            className="form password-mandatory"
            generalError={this.state.error}
            title={"Enter Password"}
            validators={validatorUploadImport}
            model={fieldUploadImport}
            submitText={this.state.submitting ? "Submit..." : "Submit"}
            onSubmit={model => {
              this.checkPassword(model);
            }}
          />
        :
        <React.Fragment>   
            {
              this.state.channel && this.state.addpost ? 
              <AddPost {...this.props} closePOst={this.closePOst} channel_id={this.state.channel.channel_id} />
              : null
            }         
            {
              this.state.channel && this.state.channel.approve != 1 ? 
                  <div className="col-md-12  approval-pending">
                      <div className="generalErrors">
                          <div className="alert alert-danger alert-dismissible fade show" role="alert">
                              {Translate(this.props,'This channel still waiting for admin approval.')}
                          </div>
                    </div>
                </div>
            : null
            }
            {
              this.state.openPopup ?
                <AddVideos {...this.props}  channel_id={this.state.channel.channel_id} chooseVideos={this.chooseVideos} closePopup={this.closePopup} title={Translate(this.props,"Add videos to channel")} />
                : null
            }
            {
              this.state.openImportPopup ?
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="VideoDetails-commentWrap">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{this.props.t("Enter YouTube Channel ID")}</h2>
                                    <a onClick={(e) => {
                                      e.preventDefault();
                                      this.setState({localUpdate:true,openImportPopup:false,channelerror:null,channelFormSubmit:false})
                                    }} className="_close"><i></i></a>
                                </div>
                                <div className="user_wallet row">
                                    <form onSubmit={this.formChannelSubmit}>
                                        <div className="form-group">
                                            <input type="text" className="form-control" value={this.state.channelID ? this.state.channelID : ""} onChange={(e) => {
                                              this.setState({localUpdate:true,channelID:e.target.value})
                                            }} />
                                            {
                                                this.state.channelerror ? 
                                                <p className="error">
                                                    {
                                                        this.state.channelerror
                                                    }
                                                </p>
                                                : null
                                            }
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label"></label>
                                            <button type="submit">{this.state.channelFormSubmit ? this.props.t("Submit...") : this.props.t("Submit")}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              : null
            }
            {
              this.state.openPlaylistPopup ?
                <AddVideos {...this.props}  playlist={true} channel_id={this.state.channel.channel_id} chooseVideos={this.choosePlaylist} closePopup={this.closePlaylistPopup} title={Translate(this.props,"Add playlists to channel")} />
                : null
            }
            {
                !this.state.adult ?                      
                <Cover  {...this.props}  {...this.state.channel} item={this.state.channel} type="channel" id={this.state.channel.channel_id} deleteChannel={this.deleteChannel} url={`/channel/${this.state.channel.custom_url}`} />
              : null
            }
            <div>
                      <div className="container">
                        <div className="row">
                          <div className="col-md-12">
                          {
                              this.state.adult ?
                                  <div className="adult-wrapper">
                                      {Translate(this.props,'This channel contains adult content.To view this channel, Turn on adult content setting from site footer.')}
                                  </div>
                            :
                             <React.Fragment>
                            <div className="details-tab">
                              <ul className="nav nav-tabs" id="myTab" role="tablist">
                              {
                                this.state.needSubscription ? 
                                <li className="nav-item">
                                  <a className={`nav-link${this.state.tabType == "plans" ? " active" : ""}`} onClick={
                                    (e) => { e.preventDefault(); this.pushTab("plans") }
                                  } data-bs-toggle="tab" href="#" role="tab" aria-controls="discription" aria-selected="false">{Translate(this.props,"Choose Plan")}</a>
                                </li>
                                : null
                              }
                              {
                                !this.state.needSubscription ? 
                                <li className="nav-item">
                                    <a className={`nav-link${this.state.tabType == "videos" ? " active" : ""}`} onClick={
                                    (e) => { e.preventDefault(); this.pushTab("videos") }
                                  } data-bs-toggle="tab" href="#" role="tab" aria-controls="discription" aria-selected="false">{Translate(this.props,"Videos")}</a>
                                  </li>
                                  : null
                                }
                                {
                                  this.state.channel && this.state.channel.playlists ?
                                    <li className="nav-item">
                                      <a className={`nav-link${this.state.tabType == "playlists" ? " active" : ""}`} onClick={
                                    (e) => { e.preventDefault(); this.pushTab("playlists")}
                                  } data-bs-toggle="tab" href="#" role="tab" aria-controls="playlists" aria-selected="true">{Translate(this.props,"Playlists")}</a>
                                    </li>
                                    : null
                                }
                                {
                                  this.state.channel && this.state.channel.supporters ?
                                    <li className="nav-item">
                                      <a className={`nav-link${this.state.tabType == "supporters" ? " active" : ""}`} onClick={
                                    (e) => { e.preventDefault(); this.pushTab("supporters") }
                                  } data-bs-toggle="tab" href="#" role="tab" aria-controls="supporters" aria-selected="true">{Translate(this.props,"Supporters")}</a>
                                    </li>
                                    : null
                                }
                                {
                                  !this.state.needSubscription ? 
                                    <li className="nav-item">
                                      <a className={`nav-link${this.state.tabType == "community" ? " active" : ""}`} onClick={
                                    (e) => { e.preventDefault(); this.pushTab("community") }
                                  } data-bs-toggle="tab" href="#" role="tab" aria-controls="community" aria-selected="true">{Translate(this.props,"Community")}</a>
                                    </li>
                                  : null
                                }
                                {
                                  this.state.channel && this.state.channel.artists && this.state.channel.artists.results && this.state.channel.artists.results.length ?
                                  <li className="nav-item">
                                      <a className={`nav-link${this.state.tabType == "artists" ? " active" : ""}`} onClick={
                                    (e) => { e.preventDefault(); this.pushTab("artists") }
                                  } data-bs-toggle="tab" href="#" role="tab" aria-controls="artists" aria-selected="true">{Translate(this.props,"Artists")}</a>
                                    </li>
                                    : null
                                }
                                {
                                  this.state.channel && this.props.pageData.appSettings[`${"channel_comment"}`] == 1 && this.state.channel.approve == 1 ?
                                    <li className="nav-item">
                                      <a className={`nav-link${this.state.tabType == "comments" ? " active" : ""}`} onClick={
                                    (e) => { e.preventDefault(); this.pushTab("comments") }
                                  } data-bs-toggle="tab" href="#" role="tab" aria-controls="comments" aria-selected="true">{`${Translate(this.props,"Comments")}`}</a>
                                    </li>
                                    : null
                                }
                                {
                                  this.state.channel ?
                                <li className="nav-item">
                                  <a className={`nav-link${this.state.tabType == "about" ? " active" : ""}`} onClick={
                                    (e) => { e.preventDefault(); this.pushTab("about") }
                                  } data-bs-toggle="tab" href="#" role="tab" aria-controls="about" aria-selected="true">{Translate(this.props,"About")}</a>
                                </li>
                                : null
                                }
                              </ul>
                              <div className="tab-content" id="myTabContent">
                                {
                                  this.state.needSubscription ? 
                                    <div className={`tab-pane fade${this.state.tabType == "plans" ? " active show" : ""}`} id="plans" role="tabpanel">
                                      <div className="details-tab-box">
                                        <p className="plan-upgrade-subscribe">
                                            {
                                              this.state.needSubscription.type == "upgrade" ? 
                                                this.props.t("To watch more content, kindly upgrade your Subcription Plan.")
                                                :
                                                this.props.t("To watch more content, kindly Subscribe.")
                                            }
                                        </p>
                                        <Plans {...this.props} userSubscription={this.state.needSubscription.loggedin_package_id ? true : false} userSubscriptionID={this.state.needSubscription.loggedin_package_id} itemObj={this.state.channel} member={this.state.channel.owner} user_id={this.state.channel.owner_id} plans={this.state.plans} />
                                      </div>
                                    </div>
                                  : null
                                }
                                {
                                  !this.state.needSubscription ? 
                                <div className={`tab-pane fade${this.state.tabType == "videos" ? " active show" : ""}`} id="videos" role="tabpanel">
                                  <div className="details-tab-box">{
                                    this.state.channel.canEdit ?
                                      
                                        <React.Fragment>
                                          <button onClick={this.openPopup}>{Translate(this.props,"Add Videos")}</button>
                                          <button onClick={this.openImportPopup}>{Translate(this.props,"Import Videos from YouTube Channel")}</button>
                                        </React.Fragment>
                                      
                                      : null
                                  }
                                    <Videos canDelete={this.state.channel.canDelete}  {...this.props}  videos={this.state.channel.videos.results} pagging={this.state.channel.videos.pagging} channel_id={this.state.channel.channel_id} />
                                  </div>
                                </div>
                                  : null
                                }
                                {
                                  !this.state.needSubscription ?
                                <div className={`tab-pane fade${this.state.tabType == "community" ? " active show" : ""}`} id="community" role="tabpanel">
                                  <div className="details-tab-box">{
                                    this.state.channel.canEdit ?
                                      <button onClick={this.adPost}>{Translate(this.props,"Add Post")}</button>
                                      : null
                                  }
                                    <Community canDelete={this.state.channel.canDelete} canEdit={this.state.channel.canEdit} channel={this.state.channel}  {...this.props}  posts={this.state.channel.posts.results} pagging={this.state.channel.posts.pagging} channel_id={this.state.channel.channel_id} />
                                  </div>
                                </div>
                                : null
                                }

                                {
                                  this.state.channel.playlists ?
                                    <div className={`tab-pane fade${this.state.tabType == "playlists" ? " active show" : ""}`} id="playlists" role="tabpanel">
                                      <div className="details-tab-box">
                                        {
                                          this.state.channel.canEdit ?
                                            <button onClick={this.openPlaylistPopup}>{Translate(this.props,"Add Playlists")}</button>
                                            : null
                                        }
                                        <Playlists canDelete={this.state.channel.canDelete}  {...this.props}  playlists={this.state.channel.playlists.results} pagging={this.state.channel.playlists.pagging} channel_id={this.state.channel.channel_id} />
                                      </div>
                                    </div>
                                    : null
                                }
                                {
                                  this.state.channel.supporters ?
                                    <div className={`tab-pane fade${this.state.tabType == "supporters" ? " active show" : ""}`} id="supporters" role="tabpanel">
                                      <div className="details-tab-box">
                                        <Members  {...this.props} globalSearch={true}  channel_members={this.state.channel.supporters.results} channel_pagging={this.state.channel.supporters.pagging} channel_id={this.state.channel.channel_id} />
                                      </div>
                                    </div>
                                    : null
                                }
                                {
                                  this.state.channel.artists && this.state.channel.artists.results && this.state.channel.artists.results.length ?
                                    <div className={`tab-pane fade${this.state.tabType == "artists" ? " active show" : ""}`} id="artists" role="tabpanel">
                                      <div className="details-tab-box">
                                        <Artists canDelete={this.state.channel.canDelete}  {...this.props}  artists={this.state.channel.artists.results} pagging={this.state.channel.artists.pagging} channel_id={this.state.channel.channel_id} />
                                      </div>
                                    </div>
                                    : null
                                }


                                
                                {
                                  this.props.pageData.appSettings[`${"channel_comment"}`] == 1 && this.state.channel.approve == 1 ?
                                    <div className={`tab-pane fade${this.state.tabType == "comments" ? " active show" : ""}`} id="comments" role="tabpanel">
                                      <div className="details-tab-box">
                                        <Comment  {...this.props}  owner_id={this.state.channel.owner_id} hideTitle={true} appSettings={this.props.pageData.appSettings} commentType="channel" type="channels" comment_item_id={this.state.channel.channel_id} />
                                      </div>
                                    </div>
                                    : null
                                }
                              <div className={`tab-pane fade${this.state.tabType == "about" ? " active show" : ""}`} id="about" role="tabpanel">
                                  <div className="details-tab-box">
                                  {
                                    this.props.pageData.appSettings[`${"channel_rating"}`] == 1 && this.state.channel.approve == 1 ?
                                  <div className="tabInTitle">
                                      <h6>{Translate(this.props,'Rating')}</h6>
                                      <div className="rating">
                                          <React.Fragment>
                                              <div className="animated-rater">
                                                  <Rating {...this.props} rating={this.state.channel.rating} type="channel" id={this.state.channel.channel_id} />
                                              </div>
                                          </React.Fragment>
                                      </div>
                                    </div>
                                  : null
                                  }
                                    <div className="tabInTitle">
                                      <h6>{this.props.t("view_count", { count: this.state.channel.view_count ? this.state.channel.view_count : 0 })}</h6>
                                      <div className="owner_name">
                                          <React.Fragment>
                                          {`${ShortNumber(this.state.channel.view_count ? this.state.channel.view_count : 0)}`}{" "}{this.props.t("view_count", { count: this.state.channel.view_count ? this.state.channel.view_count : 0 })}
                                          </React.Fragment>
                                      </div>
                                    </div>
                                    <div className="tabInTitle">
                                      <h6>{Translate(this.props, "Created")}</h6>
                                      <div className="owner_name">
                                          {
                                            <span dangerouslySetInnerHTML={{__html:Date(this.props,this.state.channel.creation_date,this.props.initialLanguage,'dddd, MMMM Do YYYY',this.props.pageData.defaultTimezone)}}></span>
                                          }
                                      </div>
                                    </div>
                                    {
                                      this.state.channel.category ?
                                        <React.Fragment>
                                          <div className="tabInTitle categories_cnt">
                                            <h6>{Translate(this.props,"Category")}</h6>
                                            <div className="boxInLink">
                                            {
                                              <Link href={`/category`} customParam={`type=channel&id=` + this.state.channel.category.slug} as={`/channel/category/` + this.state.channel.category.slug}>
                                                <a>
                                                  {<CensorWord {...this.props} text={this.state.channel.category.title} />}
                                                </a>
                                              </Link>
                                            }
                                            </div>
                                            {
                                              this.state.channel.subcategory ?
                                                <React.Fragment>
                                                  {/* <span> >> </span> */}
                                                  <div className="boxInLink">
                                                  <Link href={`/category`} customParam={`type=channel&id=` + this.state.channel.subcategory.slug} as={`/channel/category/` + this.state.channel.subcategory.slug}>
                                                    <a>
                                                      {<CensorWord {...this.props} text={this.state.channel.subcategory.title} />}
                                                    </a>
                                                  </Link>
                                                  </div> 
                                                  {
                                                    this.state.channel.subsubcategory ?
                                                      <React.Fragment>
                                                        {/* <span> >> </span> */}
                                                        <div className="boxInLink">
                                                        <Link href={`/category`} customParam={`type=channel&id=` + this.state.channel.subsubcategory.slug} as={`/channel/category/` + this.state.channel.subsubcategory.slug}>
                                                          <a>
                                                            {<CensorWord {...this.props} text={this.state.channel.subsubcategory.title} />}
                                                          </a>
                                                        </Link>
                                                        </div>
                                                      </React.Fragment>
                                                      : null
                                                  }
                                                </React.Fragment>
                                                : null
                                            }
                                            
                                          </div> 
                                        </React.Fragment>
                                        : null
                                    }

                                    {
                                      this.state.channel.tags && this.state.channel.tags != "" ?
                                        <div className="blogtagListWrap">
                                          <div className="tabInTitle">
                                            <h6>{Translate(this.props,"Tags")}</h6>
                                            <ul className="TabTagList clearfix">
                                              {
                                                this.state.channel.tags.split(',').map(tag => {
                                                  return (
                                                    <li key={tag}>
                                                      <Link href="/channels" customParam={`tag=${tag}`} as={`/channels?tag=${tag}`}>
                                                        <a>{<CensorWord {...this.props} text={tag} />}</a>
                                                      </Link>
                                                    </li>
                                                  )
                                                })
                                              }
                                            </ul>
                                          </div>
                                        </div>
                                        : null
                                    }
                                    {
                                      this.state.channel.description ?
                                        <React.Fragment>
                                          <div className="tabInTitle">
                                            <h6>{Translate(this.props,"Description")}</h6>
                                            <div className="channel_description">
                                              <CensorWord {...this.props} text={this.state.channel.description} />
                                            </div>
                                          </div>
                                        </React.Fragment>
                                        : null
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                            </React.Fragment>
                            }
                          </div>
                        </div>
                      </div>
              {
                  this.state.relatedChannels && this.state.relatedChannels.length ?
                  <React.Fragment>
                    <div className="container"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                    <CarouselChannels {...this.props}  {...this.props} type="blog" carouselType="channel" channels={this.state.relatedChannels} />
                  </React.Fragment>
                    : null
              }
            </div>
        </React.Fragment>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openToast: (message, typeMessage) => dispatch(actions.openToast(message, typeMessage)),
  };
};
export default connect(null, mapDispatchToProps)(Index)