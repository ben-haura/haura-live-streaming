import React from "react"
import Slider from "react-slick"
import axios from "../../../axios-orders"
import dynamic from 'next/dynamic'
import Link from "../../../components/Link"



class Carousel extends React.Component{
    constructor(props){
        super(props)
        //add item at first position
        let items = props.pageData.reels && props.pageData.reels.results ? props.pageData.reels.results : []
        
        this.state = {
            items:items,
            pagging:props.pageData.reels && props.pageData.reels.pagging ? props.pageData.reels.pagging : false,
            openReel:false,
            page:2,
            fromReel:true
            
        }
        this.closePopup = this.closePopup.bind(this)
        this.newDataPosted = this.newDataPosted.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if(nextProps.pageData.reels && nextProps.pageData.reels.results != prevState.items){
            let items = nextProps.pageData.reels && nextProps.pageData.reels.results ? nextProps.pageData.reels.results : []
            
            return {
                ...prevState,
                items:items,
                page:2,
                openReel:false,
                pagging:nextProps.pageData.reels && nextProps.pageData.reels.pagging ? nextProps.pageData.reels.pagging : false
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
        this.props.socket.on('reelDeleted', data => {
            let id = data.reel_id
            let itemIndex = this.getReelIndex(id);
            if(itemIndex > -1){
                let items = [...this.state.items]
                items.splice(itemIndex, 1);
                this.props.updatereels(items,this.state.pagging)
                this.setState({localUpdate:true, items: items })
            }
        });
       
    }
    getReelIndex(reels,reel_id){
        if(this.state.items){
            const items = [...reels];
            const itemIndex = items.findIndex(p => p.reel_id == reel_id);
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
            this.fetchReelsData()
    }
    
    fetchReelsData = () => {
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
        this.state.items.forEach(reel => {
            ids.push(reel.reel_id)
        })
        formData.append('ids',ids)
        let url = '/reels/get-reels';
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                //silent
            }else{
                if(response.data.reels){
                    this.props.updatereels([...this.state.items,...response.data.reels],response.data.pagging)
                    this.setState({localUpdate:true,fetchingData:false,items:[...this.state.items,...response.data.reels],pagging:response.data.pagging})
                }
            }
        }).catch(err => {
            //silent
        });
    }
    closePopup = (e) => {
        if(e != "notClose")
            this.props.closePopupFirst(false);
        let data = {localUpdate:true,create:false,fromReel:true}
        if(e == "close")
            data.openReel = false;
        this.setState(data)    
    }
    closeReelsPopup = (e) => {
        this.props.closePopupFirst(false);
        this.setState({localUpdate:true,openReel:false})    
    }
    removeReel = (id,owner_id) => {
        const items = [...this.state.items];
        let itemIndex = items.findIndex(p => p["owner_id"] == owner_id);        
        let stateItem = {localUpdate:true}
        if(itemIndex > -1){
            let reels = this.state.items[itemIndex]
            let reelIndex = reels.reels.findIndex(p => p.reel_id == id);
            if(reelIndex > -1){
                //remove Reel
                reels.reels.splice(reelIndex, 1);
                if(reels.reels.length == 0){
                    //remove reel
                    items.splice(itemIndex, 1);
                    let totalLength = items.length;
                    if(items.length && items[0].type == "create"){
                        totalLength = totalLength - 1;
                        itemIndex = itemIndex -1
                    }
                    if(itemIndex <= totalLength - 1){
                        stateItem.selectedOpenReel = itemIndex;
                    }else if(itemIndex - 1 <= totalLength - 1){
                        stateItem.selectedOpenReel = itemIndex - 1;
                    }else{
                        $("body").removeClass("reels-open");
                        stateItem.openReel = false
                    }
                    stateItem.selectedReel = 0
                }else{
                    if(reels.reels.length - 1 < reelIndex){
                        stateItem.selectedReel = 0
                    }
                }
                stateItem["items"] = items;
                this.props.updatereels(items,this.state.pagging)
                this.setState(stateItem,()=>{
                    this.setState({localUpdate:true,selectedReel:null,selectedReel:null})
                });
            }
        }
    }
    
    newDataPosted = (data) => {
        if(!data)
            return;
        const items = [...this.state.items];
        let itemIndex = items.findIndex(p => p["owner_id"] == data.owner_id); 
        if(itemIndex > -1){
            items[itemIndex].reels.unshift(data.reels[0]);            
        }else{
            items.splice(1,0,data)
        }    
        this.props.updatereels(items,this.state.pagging)
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

        let customClass = " stories reels" 

        var settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 6,
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
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                }
              }
            ]
          };

        let content = this.state.items.map((item,index) => {
            return (
                <div className="slide-item" key={item.owner_id}>
                    <div className="storyThumb">
                        <Link as={`/reel/${item.reel_id}`} href={`/reel`} customParam={`id=${item.reel_id}`}>
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
            )
            
        })

     

        return (
            <React.Fragment>
                <div className="strory-widget">
                    <Slider {...settings} > {content} </Slider>
                </div>
            </React.Fragment>
        )
    }
}



export default Carousel