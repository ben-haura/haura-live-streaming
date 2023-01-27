import React from "react"
import Slider from "react-slick"
import axios from "../../../axios-orders"
import dynamic from 'next/dynamic'
import Stories from "./Stories"

const Create = dynamic(() => import("./Create"), {
    ssr: false,
    loading: () => <></>
});

class Carousel extends React.Component{
    constructor(props){
        super(props)
        //add item at first position
        let items = props.pageData.stories && props.pageData.stories.results ? props.pageData.stories.results : []
        
        this.state = {
            items:items,
            pagging:props.pageData.stories && props.pageData.stories.pagging ? props.pageData.stories.pagging : false,
            openStory:props.openStory ?? false,
            // selectedStory: 0,
            page:2,
            fromStory:true
            
        }
        this.closePopup = this.closePopup.bind(this)
        this.newDataPosted = this.newDataPosted.bind(this)
        this.getStoryViewer = this.getStoryViewer.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if(nextProps.pageData.stories && nextProps.pageData.stories.results != prevState.items){
            let items = nextProps.pageData.stories && nextProps.pageData.stories.results ? nextProps.pageData.stories.results : []
            
            return {
                ...prevState,
                items:items,
                page:2,
                openStory:false,
                pagging:nextProps.pageData.stories && nextProps.pageData.stories.pagging ? nextProps.pageData.stories.pagging : false
            }
        } else{
            return null
        }
    }
   
    getItemIndex(item_id){
        if(this.state.items){
            const items = [...this.state.items];
            const itemIndex = items.findIndex(p => p.attachment_id == item_id);
            return itemIndex;
        }
        return -1
    }
    componentDidMount(){ 
        this.props.socket.on('storiesCreated', data => {
            let id = data.id;
            let owner_id = data.owner_id
            let file = data.file
            let status = data.status 
            let itemIndex = this.getOwnerIndex(owner_id)
            if(itemIndex > -1){
                const items = this.state.items
                if(items[itemIndex].stories){
                    let getStoryIndex = this.getStoryIndex(items[itemIndex].stories,id)
                    if(getStoryIndex > -1){
                        items[itemIndex].stories[getStoryIndex].file = file
                        items[itemIndex].stories[getStoryIndex].status = status
                        let stateItem = {localUpdate:true}
                        stateItem["items"] = items;
                        this.props.updateStories(items,this.state.pagging)
                        this.setState(stateItem,() => {
                            
                        });
                    }
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
            let itemOwnerID = data.itemOwnerID
            if (itemType == "stories") {
                let itemIndex = this.getOwnerIndex(itemOwnerID)
                if(itemIndex > -1){
                    const items = [...this.state.items]
                    let getStoryIndex = this.getStoryIndex(items[itemIndex].stories,itemId)
                    if(getStoryIndex > -1){
                        const changedItem = items[itemIndex].stories[getStoryIndex]

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
                        this.props.updateStories(items,this.state.pagging)
                        this.setState({localUpdate:true, items: items })
                    }
                }
            }
        });


        this.props.socket.on('unfollowUser', data => {
            let type = data.itemType
            let id = data.itemId
            let ownerId = data.ownerId
            let changed = false;
            if (type == "members") {
                let itemIndex = this.getOwnerIndex(id)
                if(itemIndex > -1){
                    let items = [...this.state.items]
                    
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changed = true;
                        items[itemIndex].follower_id = null
                    }

                
                    if(changed){
                        this.props.updateStories(items,this.state.pagging)
                        this.setState({localUpdate:true,items:items,loadingViewer:true})
                    }
                        
                }
            }
        });
        this.props.socket.on('followUser', data => {
            let type = data.itemType
            let ownerId = data.ownerId
            let id = data.itemId
            let changed = false;
            if (type == "members") {
                let itemIndex = this.getOwnerIndex(id)
                if(itemIndex > -1){
                    let items = [...this.state.items]
                    
                    if (this.props.pageData.loggedInUserDetails && this.props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changed = true;
                        items[itemIndex].follower_id = 1
                    }
                
                    if(changed){
                        this.props.updateStories(items,this.state.pagging)
                        this.setState({localUpdate:true,items:items,loadingViewer:true})
                    }
                        
                }
            }
        });

        this.props.socket.on('deleteStory',data => {
            let story = data.story
            let owner_id = story.owner_id
            let itemIndex = this.getOwnerIndex(owner_id)
            if(itemIndex > -1){
                const items = this.state.items
                if(items[itemIndex].stories){
                    let getStoryIndex = this.getStoryIndex(items[itemIndex].stories,story.story_id)
                    if(getStoryIndex > -1){
                        items[itemIndex].stories.splice(getStoryIndex, 1)
                        let stateItem = {localUpdate:true}
                        if(items[itemIndex].stories.length == 0){
                            //remove story
                            items.splice(itemIndex, 1);
                            let totalLength = items.length;
                            if(items.length && items[0].type == "create"){
                                totalLength = totalLength - 1;
                                itemIndex = itemIndex -1
                            }
                            if(itemIndex <= totalLength - 1){
                                stateItem.selectedOpenStory = itemIndex;
                            }else if(itemIndex - 1 <= totalLength - 1){
                                stateItem.selectedOpenStory = itemIndex - 1;
                            }else{
                                $("body").removeClass("stories-open");
                                stateItem.openStory = false
                            }
                            stateItem.selectedStory = 0
                        }else{
                            if(items[itemIndex].stories.length - 1 < getStoryIndex){
                                stateItem.selectedStory = 0
                            }
                        }
                        stateItem["items"] = items;
                        this.props.updateStories(items,this.state.pagging)
                        this.setState(stateItem,() => {
                            this.setState({localUpdate:true,selectedOpenStory:null,selectedStory:null});
                        });
                    }
                }
            }
        })
        this.props.socket.on('muteStory',data => {
            let resource_owner = data.resource_owner
            let owner_id = data.owner_id
            if(this.props.pageData.loggedInUserDetails && owner_id == this.props.pageData.loggedInUserDetails.user_id){
                let itemIndex = this.getOwnerIndex(resource_owner)
                if(itemIndex > -1){
                    const items = [...this.state.items]
                    items.splice(itemIndex, 1);
                    let stateItem = {localUpdate:true}
                    let totalLength = items.length;
                    if(items.length && items[0].type == "create"){
                        totalLength = totalLength - 1;
                        itemIndex = itemIndex -1
                    }
                    if(itemIndex <= totalLength - 1){
                        stateItem.selectedOpenStory = itemIndex;
                    }else if(itemIndex - 1 <= totalLength - 1){
                        stateItem.selectedOpenStory = itemIndex - 1;
                    }else{
                        $("body").removeClass("stories-open");
                        stateItem.openStory = false
                    }
                    this.props.updateStories(items,this.state.pagging)
                    stateItem.items = items
                    this.setState(stateItem,() => {
                        this.setState({localUpdate:true,selectedOpenStory:null,selectedStory:null});
                    });
                }
            }
        })
    }
    getStoryIndex(stories,story_id){
        if(this.state.items){
            const items = [...stories];
            const itemIndex = items.findIndex(p => p.story_id == story_id);
            return itemIndex;
        }
        return -1
    }
    getOwnerIndex(owner_id){
        if(this.state.items){
            const items = [...this.state.items];
            const itemIndex = items.findIndex(p => p.owner_id == owner_id);
            return itemIndex;
        }
        return -1
    }
    slideChange = (slide) => {
        if(this.state.items.length > 4 && slide < this.state.items.length - 4 && this.state.pagging)
            this.fetchStoriesData()
    }
    getStoryViewer = (item,story_id) => {
        this.setState({loadingViewer:true,localUpdate:true});
        let itemIndex = this.getOwnerIndex(item.owner_id);
        let stories = null;
        const items = [...this.state.items];
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
                    this.props.updateStories(items,this.state.pagging)
                    this.setState({localUpdate:true,items:items,loadingViewer:false})
                }else if(stories){
                    if(!stories.viewers){
                        stories.viewers = []
                    }
                    stories.viewersPagging = true;
                    this.props.updateStories(items,this.state.pagging)
                    this.setState({localUpdate:true,items:items,loadingViewer:false})
                }
                   
            }
        }).catch(err => {
            //silent
        });

    }
    fetchStoriesData = () => {
        if(this.state.fetchingData){
            return;
        }
        this.setState({localUpdate:true,fetchingData:true});
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        formData.append('page',this.state.page);
        let ids = []
        //get current stories
        this.state.items.forEach(story => {
            if(story.owner_id)
                ids.push(story.owner_id)
        })
        formData.append('ids',ids)
        let url = '/stories/get-stories';
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                //silent
            }else{
                if(response.data.stories){
                    this.props.updateStories([...this.state.items,...response.data.stories],response.data.pagging)
                    this.setState({localUpdate:true,fetchingData:false,page:this.state.page + 1,items:[...this.state.items,...response.data.stories],pagging:response.data.pagging})
                }
            }
        }).catch(err => {
            //silent
        });
    }
    closePopup = (e) => {
        if(e != "notClose")
            this.props.closePopupFirst(false);
        let data = {localUpdate:true,create:false,fromStory:true}
        if(e == "close")
            data.openStory = false;
        this.setState(data)    
    }
    closeStoriesPopup = (e) => {
        this.props.closePopupFirst(false);
        this.setState({localUpdate:true,openStory:false})    
    }
    removeStory = (id,owner_id) => {
        const items = [...this.state.items];
        let itemIndex = items.findIndex(p => p["owner_id"] == owner_id);        
        let stateItem = {localUpdate:true}
        if(itemIndex > -1){
            let stories = this.state.items[itemIndex]
            let storyIndex = stories.stories.findIndex(p => p.story_id == id);
            if(storyIndex > -1){
                //remove Story
                stories.stories.splice(storyIndex, 1);
                if(stories.stories.length == 0){
                    //remove story
                    items.splice(itemIndex, 1);
                    let totalLength = items.length;
                    if(items.length && items[0].type == "create"){
                        totalLength = totalLength - 1;
                        itemIndex = itemIndex -1
                    }
                    if(itemIndex <= totalLength - 1){
                        stateItem.selectedOpenStory = itemIndex;
                    }else if(itemIndex - 1 <= totalLength - 1){
                        stateItem.selectedOpenStory = itemIndex - 1;
                    }else{
                        $("body").removeClass("stories-open");
                        stateItem.openStory = false
                    }
                    stateItem.selectedStory = 0
                }else{
                    if(stories.stories.length - 1 < storyIndex){
                        stateItem.selectedStory = 0
                    }
                }
                stateItem["items"] = items;
                this.props.updateStories(items,this.state.pagging)
                this.setState(stateItem,()=>{
                    this.setState({localUpdate:true,selectedStory:null,selectedStory:null})
                });
            }
        }
    }
    muteStory = (id) => {
        let items = [...this.state.items];
        let itemIndex = items.findIndex(p => p["owner_id"] == id);        
        let stateItem = {localUpdate:true}
        if(itemIndex > -1){
            items.splice(itemIndex, 1);
            let totalLength = items.length;
            if(items.length && items[0].type == "create"){
                totalLength = totalLength - 1;
                itemIndex = itemIndex - 1
            }
            if(itemIndex <= totalLength - 1){
                stateItem.selectedOpenStory = itemIndex;
            }else if(itemIndex - 1 <= totalLength - 1){
                stateItem.selectedOpenStory = itemIndex - 1;
            }else{
                $("body").removeClass("stories-open");
                stateItem.openStory = false
            }
            stateItem["items"] = items;
            this.props.updateStories(items,this.state.pagging)
            this.setState(stateItem,() => {
                this.setState({localUpdate:true,selectedOpenStory:null,selectedStory:null});
            });
        }
    }
    newDataPosted = (data) => {
        if(!data)
            return;
        const items = [...this.state.items];
        let itemIndex = items.findIndex(p => p["owner_id"] == data.owner_id); 
        if(itemIndex > -1){
            items[itemIndex].stories.unshift(data.stories[0]);            
        }else{
            items.splice(1,0,data)
        }    
        this.props.updateStories(items,this.state.pagging)
        this.setState({localUpdate:true,items:items});
    }

    render(){
        if(!this.state.items || this.state.items.length == 0){
            return null
        }
        // const Right = props => (
        //     <button className={`storySlide-next storySlideBtn${props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""}`}  onClick={props.onClick}>
        //         <span className="material-icons-outlined">
        //             arrow_forward_ios
        //         </span>
        //     </button>
        //   )
        // const Left = props => {
        //   return  <button className={`storySlide-prev storySlideBtn${props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""}`}  onClick={props.onClick}>
        //             <span className="material-icons-outlined">
        //                 arrow_back_ios
        //             </span>
        //         </button>
        // }
        const Right = props => (
            <button className={`control-arrow control-next${props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""}`} onClick={props.onClick}>
              <span className="material-icons" data-icon="keyboard_arrow_right"></span>
            </button>
          )
        const Left = props => {
          return  <button className={`control-arrow control-prev${props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""}`} onClick={props.onClick}>
              <span className="material-icons" data-icon="keyboard_arrow_left"></span>
            </button>
        }
        
        let customClass = " stories" 

        var settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 10,
            slidesToScroll: 1,
            className:`carousel-slider${customClass ? customClass : ''}`,
            initialSlide: 0,
            nextArrow:<Right />,
            prevArrow:<Left />,
            afterChange: current => this.slideChange(current),
            responsive: [
                {
                    breakpoint: 1400,
                    settings: {
                      slidesToShow: 6,
                    }
                },
                {
                    breakpoint: 1300,
                    settings: {
                        slidesToShow: 5,
                    }
                },
                {
                    breakpoint: 1000,
                    settings: {
                        slidesToShow: 4,
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                    }
                }
            ]
          };

          const truncateString = (string = '', maxLength = 50) => 
            string.length > maxLength 
                ? `${string.substring(0, maxLength)}…`
                : string

        let content = this.state.items.map((item,index) => {
            return (
                item.type == "create" && this.props.pageData.loggedInUserDetails && this.props.pageData.levelPermissions["stories.create"] == 1 ? 
                    <div className="slide-item" key={item}>
                        <div className="storyThumb createStoryBlock">
                            <a className="storyThumb-content storyThumb-overlay" href="#" onClick={
                                (e) => {
                                    
                                    e.preventDefault();
                                    this.setState({localUpdate:true,create:true})
                                }
                            }>
                                <div className="storyThumb-img">
                                    <img src={this.props.pageData.imageSuffix+this.props.pageData.loggedInUserDetails.avtar} alt="" />
                                </div>
                                <div className="create-story-btn">
                                        <div className="icon"><span className="material-icons">add</span></div>
                                        <div className="text">{this.props.t("Create Story")}</div>
                                    </div>

                                {/* <div className="storyThumb-name">
                                    {this.props.t("Create Story")}
                                </div> */}
                            </a>
                        </div>
                    </div>
                :
                    <div className="slide-item" key={item.owner_id}>
                        <div className="storyThumb">
                            <a className="storyThumb-content storyThumb-overlay" href="#" onClick={(e) => {
                                e.preventDefault();
                                let indexNumber = index
                                if(this.state.items[0].type == "create"){
                                    indexNumber = index - 1
                                }
                                this.setState({localUpdate:true,openStory:indexNumber},()=>{
                                    
                                })
                            }}>
                                <div className="storyThumb-img">
                                    <img src={this.props.pageData.imageSuffix + (item.stories[0].type == 3 ? item.stories[0].background_image : item.stories[0].image)} alt="" />
                                    {
                                        item.stories[0].type == 3 ? 
                                            <p style={{color:item.stories[0].text_color}}>{truncateString(item.stories[0].description, 30)}</p>
                                        : null
                                    }
                                </div>
                                <div className="storyThumb-name">
                                    {item.yourstory ? item.yourstory : item.displayname}
                                </div>
                                <div className="storyThumb-profileImg">
                                    <img src={this.props.pageData.imageSuffix+ item.avtar} alt="" />
                                </div>
                            </a>
                        </div>
                    </div>
            )
            
        })

        let createD = null
        if(this.state.create){
            createD = <Create {...this.props} fromDirect={this.state.fromStory} closePopup={this.closePopup} closePopupFirst={this.props.closePopupFirst} newDataPosted={this.newDataPosted} />
        }
        let openStory = null
        if(this.state.openStory === 0 || this.state.openStory){
            let items = [...this.state.items]
            if(items.length && items[0].type == "create"){
                items.shift(); 
            }
            openStory = <Stories {...this.props} closePopupFirst={this.props.closePopupFirst} loadingViewer={this.state.loadingViewer} getStoryViewer={this.getStoryViewer} pagging={this.state.pagging} fetchingData={this.state.fetchingData} fetchStoriesData={this.fetchStoriesData} muteStory={this.muteStory} selectedOpenStory={this.state.selectedOpenStory} selectedStory={this.state.selectedStory} removeStory={this.removeStory} items={items} openStory={this.state.openStory} closePopup={this.closeStoriesPopup} createStory={
                (e) => {
                    e.preventDefault();
                    this.setState({localUpdate:true,create:true,fromStory:false})
                }
            } />
        }

        return (
            <React.Fragment>
                {openStory}
                {createD}
                {
                    this.props.fromStoryViewPage ? 
                    null
                :
                <div className="strory-widget">
                    <Slider {...settings} > {content} </Slider>
                </div>
                }
            </React.Fragment>
        )
    }
}



export default Carousel