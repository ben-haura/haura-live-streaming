import React from "react"
import Image from "../Image/Index" 

import CensorWord from "../CensoredWords/Index"
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Translate from "../../components/Translate/Index"
import axios from "../../axios-orders"


class Photos extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            photos: props.photos.results,
            pagging: props.photos.pagging,
            artist:props.artist,
            page:2,
            cast:props.cast
        }
        this.refreshContent = this.refreshContent.bind(this)
        this.loadMoreContent = this.loadMoreContent.bind(this)
        this.openImage = this.openImage.bind(this)
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (prevState.photos != nextProps.photos.results) {
           return { photos: nextProps.photos.results,pagging:nextProps.photos.pagging,page:2 }
        } else{
            return null
        }

    }
    
    refreshContent() {
        this.setState({ page: 1, items: [] })
        this.loadMoreContent()
    }
    openImage = (id,e) => {
        e.preventDefault()
        if(typeof lightboxJquery == "undefined"){
            return
        }

        var items = [];
        this.state.photos.forEach(photo => {

            let isS3 = true
            if (photo.image) {
                const splitVal = photo.image.split('/')
                if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                    isS3 = false
                }
            }

            items.push({
                src:  (isS3 ? this.props.pageData.imageSuffix : "") + photo.image,
                title: photo.title,
                description: photo.description,
                type: 'image'
            });
        });
        lightboxJquery.magnificPopup.open({
            items:items,
            gallery: {
              enabled: true 
            },
            tCounter:""
          },id);
    }
    loadMoreContent() {
        if(this.state.loading){
            return
        }
        this.setState({ loading: true,localUpdate:true })
        let formData = new FormData();
        if(this.state.cast)
            formData.append('cast_crew_member_id', this.state.cast.cast_crew_member_id)
        else
            formData.append('artist_id', this.state.artist.artist_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = "/artist-photos"
        if(this.state.cast)
            url = "/movies/cast-photos"
        formData.append("page", this.state.page)
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.results) {
                    let pagging = response.data.pagging
                    this.setState({localUpdate:true, page: this.state.page + 1, pagging: pagging, photos: [...this.state.photos, ...response.data.results], loading: false })
                } else {
                    this.setState({ loading: false ,localUpdate:true})
                }
            }).catch(err => {
                this.setState({ loading: false ,localUpdate:true})
            });

    }
    render() {
        const photos = this.state.photos.map((photo,key) => {
            return (
                <div className="gridColumn" key={photo.photo_id}>
                    <div className="ptv_artists_wrap" >
                        <div className="ptv_artist_thumb">
                            <a href="#" onClick={(e) => {this.openImage(key,e)}}>
                                <Image title={CensorWord("fn",this.props,photo.name)} image={photo.image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                            </a>
                        </div>
                        <div className="artist_photo_content">
                            <div className="title">
                                <a href="#" onClick={(e) => {this.openImage(key,e)}}>
                                    <h4><CensorWord {...this.props} text={photo.name} /></h4>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )
            
        })
        
        return (
            <InfiniteScroll
                dataLength={this.state.photos.length}
                next={this.loadMoreContent}
                hasMore={this.state.pagging}
                loader={<LoadMore {...this.props} page={this.state.page} loading={true} itemCount={this.state.photos.length} />}
                endMessage={
                    <EndContent {...this.props} text={Translate(this.props, "No photo uploaded for this artist.")} itemCount={this.state.photos.length} />
                }
                pullDownToRefresh={false}
                pullDownToRefreshContent={<Release release={false} {...this.props} />}
                releaseToRefreshContent={<Release release={true} {...this.props} />}
                refreshFunction={this.refreshContent}
            >
                <div className="gridContainer artist-gallery">
                    {photos}
                </div>
            </InfiniteScroll>
        )
    }
}

export default Photos
