import React from 'react';
import dynamic from 'next/dynamic'
import LoadMore from "../../LoadMore/Index"
import EndContent from "../../LoadMore/EndContent"
import InfiniteScroll from "react-infinite-scroll-component";

import axios from "../../../axios-orders"
import Timeago from "../../Common/Timeago"
const Stories = dynamic(() => {
    return import('./Stories')
});

class Archive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type:"archive"
        } 
    }
    componentDidMount() {
        this.loadMoreContent();
    }
    loadMoreContent(){
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/get-archive-stories';

        if(this.state.archiveStories){
            formData.append("min_story_id",this.state.archiveStories[this.state.archiveStories.length - 1].story_id);
        }

        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                
            }else{
                this.setState({localUpdate:true,archiveStories:this.state.archiveStories ? [...this.state.archiveStories,...response.data.stories] : response.data.stories,archiveStoriesPagging:response.data.pagging})
            }
        }).catch(err => {
            
        });

    }
    removeStory = (id) => {
        const items = [...this.state.archiveStories];
        let itemIndex = items.findIndex(p => p["story_id"] == id);        
        let stateItem = {localUpdate:true}
        if(itemIndex > -1){
            items.splice(itemIndex, 1);
            stateItem.openStory = false
            stateItem["archiveStories"] = items;
            this.setState(stateItem);
        }
    }
    getOwnerIndex(owner_id){
        if(this.state.archiveStories){
            const items = [...this.state.archiveStories];
            const itemIndex = items.findIndex(p => p.story_id == owner_id);
            return itemIndex;
        }
        return -1
    }
    getStoryIndex(stories,story_id){
        if(this.state.archiveStories){
            const items = [...stories];
            const itemIndex = items.findIndex(p => p.story_id == story_id);
            return itemIndex;
        }
        return -1
    }
    getStoryViewer = (item,story_id) => {
        this.setState({loadingViewer:true,localUpdate:true});
        let itemIndex = this.getOwnerIndex(story_id);
        let stories = null;
        const items = [...this.state.archiveStories];
        if(itemIndex > -1){
            let storyIndex = this.getStoryIndex(items[itemIndex].stories,story_id);
            if(storyIndex > -1){
                stories = items[itemIndex].stories[storyIndex];

            }
        }
        let owner_id = false
        if(this.props.pageData.loggedInUserDetails && item.owner_id != this.props.pageData.loggedInUserDetails.user_id){
            owner_id = this.props.pageData.loggedInUserDetails.user_id
        }else if(!this.props.pageData.loggedInUserDetails){
            owner_id = -1;
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        if(owner_id){
            //update viewers
            formData.append('owner_id',owner_id);
        }
        formData.append('story_id',story_id);
        if(this.props.pageData.loggedInUserDetails && item.owner_id == this.props.pageData.loggedInUserDetails.user_id){
            if(stories){
                formData.append('getViewer',1);
                if(stories.viewers && stories.viewers[stories.viewers.length - 1]){
                    formData.append('last',stories.viewers[stories.viewers.length - 1].user_id);
                }
            }
        }
        
        let url = '/stories/get-update-viewer';
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                //silent
            }else{
                if(response.data.viewers){
                    if(stories.viewers){
                        stories.viewers = [...stories.viewers,...response.data.viewers]
                    }else{
                        stories.viewers = []
                        stories.viewers = response.data.viewers
                    }
                    this.setState({localUpdate:true,archiveStories:items,loadingViewer:false})
                }else if(stories){
                    if(!stories.viewers){
                        stories.viewers = []
                    }
                    stories.viewersPagging = true;
                    this.setState({localUpdate:true,archiveStories:items,loadingViewer:false})
                }
                   
            }
        }).catch(err => {
            //silent
        });

    }
    muteUser = (id) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/mute/'+id;
        formData.append("owner_id",id);

        const items = [...this.state.mutedUsers];
        const itemIndex = items.findIndex(p => p.resource_id == id);
        if(itemIndex < 0) {
            return;
        }

        items[itemIndex].is_mute = items[itemIndex].is_mute ? null : true;        
        this.setState({localUpdate:true,mutedUsers:items})

        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                
            }else{
                
            }
        }).catch(err => {
            
        });
    }
    mutedUsers = () => {
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/get-muted-users';

        if(this.state.mutedUsers){
            formData.append("min_user_id",this.state.mutedUsers[this.state.mutedUsers.length - 1].mute_id);
        }

        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                
            }else{
                this.setState({localUpdate:true,mutedUsers:this.state.mutedUsers ? [...this.state.mutedUsers,...response.data.users] : response.data.users,mutedUsersPagging:response.data.pagging})
            }
        }).catch(err => {
            
        });
    }
    render(){

        let openStory = null;
        if(this.state.openStory){
            openStory = <Stories {...this.props} getStoryViewer={this.getStoryViewer} closePopup={(e) => {
                this.setState({localUpdate:true,openStory:false})
                $("body").removeClass("archiveStories");
            }} fromArchive={true} loadingViewer={false} fetchingData={false} removeStory={this.removeStory} items={[this.state.archiveStories[this.state.openStory-1]]} pagging={false} openStory={0} />
        }
        let logo = ""
        if (this.props.pageData.themeMode == "dark") {
            logo = this.props.pageData['imageSuffix'] + this.props.pageData.appSettings['darktheme_logo']
        } else {
            logo = this.props.pageData['imageSuffix'] + this.props.pageData.appSettings['lightheme_logo']
        }
        return (
            <React.Fragment>
                
                <div className="story-details archive-stories">
                    <div className='popupHeader'>
                        <div className='HeaderCloseLogo'>
                        <a className='closeBtn' href="#" onClick={(e) => {
                            e.preventDefault();
                            this.props.closePopup(e);
                        }}><span className="material-icons">close</span></a>
                            <div className='HeaderCloseLogo-logo'>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    this.props.closePopup(e);
                                }}>
                                    <img src={logo} className="img-fluid" />
                                </a>
                            </div>
                        </div>
                    </div>

                        
                        <div className="story-sidebar">
                            
                            <div className="storyList">
                                <div className="storyListBox sidebar-scroll">
                                    <a className={`d-flex align-items-center addStoryBtn${this.state.type == 'archive' ? ` active` : ``}`} href="#" onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({localUpdate:true,type:"archive"});
                                    }}>
                                        <div className="btncrle">
                                            <span className="material-icons">archive</span>
                                        </div>
                                        <div className="flex-grow-1 addStoryBtnText">
                                            <h5 className="m-0">{this.props.t("Story Archive")}</h5>
                                        </div>
                                    </a>
                                    <a className={`d-flex align-items-center addStoryBtn mt-3${this.state.type != 'archive' ? ` active` : ``}`} href="#" onClick={(e) => {
                                        e.preventDefault();
                                        if(!this.state.mutedUsers) {
                                            this.mutedUsers();
                                        }
                                        this.setState({localUpdate:true,type:"mute"});
                                    }}>
                                        <div className="btncrle">
                                            <span className="material-icons">volume_mute</span>
                                        </div>
                                        <div className="flex-grow-1 addStoryBtnText">
                                            <h5 className="m-0">{this.props.t("Stories Muted")}</h5>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                        {
                            this.state.type == 'archive' ? 
                        <div className="story-content position-relative">
                            <div className="storyDetails-contentWrap">
                                <div className={`storyGrid-contentBox storyListBox${!this.state.archiveStories ? ` stories-loader` : ``}`} id="stories-archive-scrollableDiv">                               
                                        {
                                            !this.state.archiveStories ? 
                                            <div className={`loader`}>
                                                <div className="duo duo1">
                                                    <div className="dot dot-a"></div>
                                                    <div className="dot dot-b"></div>
                                                </div>
                                                <div className="duo duo2">
                                                    <div className="dot dot-a"></div>
                                                    <div className="dot dot-b"></div>
                                                </div>
                                            </div>
                                            :
                                            this.state.archiveStories.length == 0 ?
                                                <div className="no-content text-center">
                                                    {this.props.t("No archive stories found.")}
                                                </div>
                                            :
                                            <InfiniteScroll
                                                dataLength={this.state.archiveStories.length}
                                                next={this.loadMoreContent}
                                                hasMore={this.state.archiveStoriesPagging}
                                                loader={<LoadMore {...this.props} loading={true} itemCount={this.state.archiveStories.length} />}
                                                endMessage={
                                                    <EndContent {...this.props} text={""} itemCount={this.state.archiveStories.length} />
                                                }
                                                scrollableTarget="stories-archive-scrollableDiv"
                                            >
                                                <div className="storyGrid">
                                                    {
                                                        this.state.archiveStories.map((story,index) => {
                                                            let item = story["stories"][0];
                                                            let image = this.props.pageData.imageSuffix + (item.type == 3 ? item.background_image : item.image);

                                                            return (
                                                                <div key={index} className="storyGrid-coloumn">
                                                                    <a className="storyArchiveThumb" href="#" onClick={(e) => {
                                                                        e.preventDefault();
                                                                        $("body").addClass("archiveStories")
                                                                        this.setState({localUpdate:true,openStory:index+1})
                                                                    }}>
                                                                        <div className="storyArchiveThumb-img">
                                                                            <img src={image} alt="userimg" />
                                                                        </div>
                                                                        <div className="story-date">
                                                                            <Timeago {...this.props}>{item.creation_date}</Timeago>
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </InfiniteScroll>
                                        }
                                </div>
                            </div>
                        </div>
                        :
                            <div className="story-content position-relative">
                                <div className="storyDetails-contentWrap">
                                <div className={`storyMuted-contentBox storyListBox${!this.state.mutedUsers ? ` stories-loader` : ``}`} id="muted-users">                               
                                        <div className="storyMuted-list">
                                        {
                                            !this.state.mutedUsers ? 
                                            <div className={`loader`}>
                                                <div className="duo duo1">
                                                    <div className="dot dot-a"></div>
                                                    <div className="dot dot-b"></div>
                                                </div>
                                                <div className="duo duo2">
                                                    <div className="dot dot-a"></div>
                                                    <div className="dot dot-b"></div>
                                                </div>
                                            </div>
                                            :
                                            this.state.mutedUsers.length == 0 ?
                                                <div className="no-content text-center">
                                                    {this.props.t("No user muted yet.")}
                                                </div>
                                            :
                                            <InfiniteScroll
                                                dataLength={this.state.mutedUsers.length}
                                                next={this.mutedUsers}
                                                hasMore={this.state.mutedUsersPagging}
                                                loader={<LoadMore {...this.props} loading={true} itemCount={this.state.mutedUsers.length} />}
                                                endMessage={
                                                    <EndContent {...this.props} text={""} itemCount={this.state.mutedUsers.length} />
                                                }
                                                scrollableTarget="muted-users"
                                            >
                                                {
                                                    this.state.mutedUsers.map((item, index) =>{
                                                        return (
                                                            <div key={index} className="frndRow d-flex align-items-center justify-content-between w-100">
                                                                <div className="frndImgName d-flex align-items-center">
                                                                    <div className="img">
                                                                        <img className="avatar-40 rounded-circle" src={this.props.pageData.imageSuffix+item.avtar} alt="user" />
                                                                    </div>
                                                                    <h6>{item.displayname}</h6>
                                                                </div>
                                                                <div className="likeBtn active btn btn-secondary" onClick={(e) => {
                                                                    this.muteUser(item.resource_id);
                                                                }}>
                                                                    {
                                                                        !item.is_mute ? 
                                                                            this.props.t("Unmute")
                                                                        :
                                                                            this.props.t("Mute")
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </InfiniteScroll>
                                        }
                                            

                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    {openStory}
            </React.Fragment>
        )
    }
}

export default Archive