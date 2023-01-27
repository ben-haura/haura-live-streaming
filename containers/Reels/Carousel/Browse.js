import React from "react"
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "../../../components/Link"
import LoadMore from "../../LoadMore/Index"
import EndContent from "../../LoadMore/EndContent"
import Release from "../../LoadMore/Release"
import axios from "../../../axios-orders"
import Translate from "../../../components/Translate/Index";

class ReelsBrowse extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            reels: props.reels ? props.reels : props.pageData.reels,
            pagging: props.pagging ? props.pagging : props.pageData.pagging,
            loading: false,
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
        }else if (nextProps.pageData && nextProps.reels && nextProps.reels != prevState.reels) {
            return { members: nextProps.reels, pagging: nextProps.pagging }
        }  else{
            return null
        }

    }
    componentDidMount() {
        
        this.props.socket.on('reelDeleted', data => {
            let id = data.reel_id
            let itemIndex = this.getItemIndex(id);
            if(itemIndex > -1){
                let reels = [...this.state.reels]
                reels.splice(itemIndex, 1);
                this.setState({localUpdate:true, reels: reels })
            }
        });
    }
    getItemIndex(item_id) {
        const reels = [...this.state.reels];
        const itemIndex = reels.findIndex(p => p["reel_id"] == item_id);
        return itemIndex;
    }

    refreshContent() {
        this.setState({localUpdate:true, page: 1, members: [] })
        this.loadMoreContent()
    }
   
    loadMoreContent() {
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
        let ids = []
        //get current reels
        this.state.reels.forEach(reel => {
            ids.push(reel.reel_id)
        })
        formData.append('ids',ids)
        if(this.props.user_id){
            formData.append('user_id',this.props.user_id)    
        }
        let url = '/reels/get-reels';
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                //silent
            }else{
                if(response.data.reels){
                    this.setState({localUpdate:true,fetchingData:false,reels:[...this.state.reels,...response.data.reels],pagging:response.data.pagging})
                }
            }
        }).catch(err => {
            //silent
        });
    }
    render() { 
        let reels = this.state.reels.map(item => {
            return <div key={item.reel_id} className="gridColumn">
                <div className="slide-item" key={item.owner_id}>
                    <div className="storyThumb">
                    <Link as={`/reel/${item.reel_id}`} href={`/reel`} customParam={`id=${item.reel_id}&user_id=${this.props.user_id}&username=${this.props.username}`}>
                            <a className="storyThumb-content storyThumb-overlay">
                                <div className="storyThumb-img">
                                    <img src={this.props.pageData.imageSuffix + item.image} />
                                </div>
                                <div className="storyThumb-name">
                                    {item.title}
                                </div>
                                <div className="reel-content-info">
                                    <div className="view">
                                        <span className="material-icons-outlined md-18" data-icon="visibility"></span>
                                        {item.view_count}
                                    </div>
                                    <div className="VdoDuration">
                                        {item.duration}
                                    </div>                                    
                                </div>
                                <div className="storyThumb-profileImg reelThumb-profileImg">
                                    <img src={this.props.pageData.imageSuffix+ item.avtar} alt="" />
                                    {item.user_displayname}
                                </div>
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        })
        return (
            <React.Fragment>                
                <InfiniteScroll
                    dataLength={this.state.reels.length}
                    next={this.loadMoreContent}
                    hasMore={this.state.pagging}
                    loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.reels.length} />}
                    endMessage={
                        <EndContent {...this.props} text={Translate(this.props,'No reels created yet.')} itemCount={this.state.reels.length} />
                    }
                    pullDownToRefresh={false}
                    pullDownToRefreshContent={<Release release={false} {...this.props} />}
                    releaseToRefreshContent={<Release release={true} {...this.props} />}
                    refreshFunction={this.refreshContent}
                >
                    <div className="gridContainer gridReels">
                        {reels}
                    </div>
                </InfiniteScroll>
            </React.Fragment>
        )
    }
}



export default ReelsBrowse