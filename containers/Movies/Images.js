import React from "react"
import Image from "../Image/Index"

class Images extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            movie:props.movie,
            images:props.images
        }
        this.openImage = this.openImage.bind(this)
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.pageData.movie != prevState.movie) {
           return {
                movie:nextProps.movie,
                images:nextProps.images
            }
        } else{
            return null
        }

    }
    openImage = (id,e) => {
        e.preventDefault()
        if(typeof lightboxJquery == "undefined"){
            return
        }

        var items = [];
        this.state.images.forEach(photo => {

            let isS3 = true
            if (photo.image) {
                const splitVal = photo.image.split('/')
                if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                    isS3 = false
                }
            }

            items.push({
                src:  (isS3 ? this.props.pageData.imageSuffix : "") + photo.image,
                //title: photo.title,
                //description: photo.description,
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
    render(){

        let items = this.state.images.map((item,key) => {
            return (
                <div className="gridColumn" key={item.photo_id}>
                    <div className="ptv_artists_wrap" >
                        <div className="ptv_artist_thumb">
                            <a href="#" onClick={(e) => {this.openImage(key,e)}}>
                                <Image image={item.image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                            </a>
                        </div>
                    </div>
                </div>
            )
        })

        return (            
            <div className="gridContainer gridMovieImage">
                {items}
            </div>
        )
    }
}


export default Images