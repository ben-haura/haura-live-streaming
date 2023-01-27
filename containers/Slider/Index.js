import React from 'react'
import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

class Index extends React.Component{
    constructor(props){
        super(props)
        this.state = { 
            items:props.children ? props.children : props.items,
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }

        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if ((nextProps.children != prevState.children || nextProps.items != prevState.items) || nextProps.i18n.language != prevState.language) {
            return { items: nextProps.children ? nextProps.children : nextProps.items,language:nextProps.i18n.language }
        } else{
            return null
        }

    }
   
    
    render(){

      let customClass = ""
      
      if(this.props.carouselType){
        if(this.props.carouselType == "movie"){
          customClass = " movie-carousel"
        }else if(this.props.carouselType == "video"){
          customClass = " video-carousel"
        }else if(this.props.carouselType == "user"){
          customClass = " user-carousel"
        }else if(this.props.carouselType == "channel_post"){
          customClass = " channel-posts-carousel"
        }else if(this.props.carouselType == "channel"){
          customClass = " channel-carousel"
        }else if(this.props.carouselType == "blog"){
          customClass = " blog-carousel"
        }else if(this.props.carouselType == "audio"){
          customClass = " audio-carousel"
        }
      }

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

       


        var settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: this.props.defaultItemCount ? this.props.defaultItemCount : this.props.itemAt1024,
            slidesToScroll: 1,
            className:`carousel-slider${customClass ? customClass : ''}`,
            initialSlide: 0,
            // rtl:this.props.pageData.isRTL ? true : false,
            nextArrow:<Right />,
            prevArrow:<Left />,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: this.props.itemAt1024,
                  slidesToScroll: 1,
                  infinite: false,
                  initialSlide: 0,
                  dots: false
                }
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: this.props.itemAt600,
                  slidesToScroll: 1,
                  infinite: false,
                  initialSlide: 0,
                  dots: false
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: this.props.itemAt480,
                  slidesToScroll: 1,
                  infinite: false,
                  dots: false
                }
              }
            ]
          };

          if(this.props.itemAt1200){
                settings.responsive.push(
                    {
                        breakpoint: 1200,
                        settings: {
                        slidesToShow: this.props.itemAt1200,
                        slidesToScroll: 1,
                        infinite: false,
                        dots: false
                        }
                    }
                )
            }
            if(this.props.itemAt1500){
                settings.responsive.push(
                    {
                        breakpoint: 1500,
                        settings: {
                        slidesToShow: this.props.itemAt1500,
                        slidesToScroll: 1,
                        infinite: false,
                        dots: false
                        }
                    }
                )
            }
            if(this.props.itemAt900){
                settings.responsive.push(
                    {
                        breakpoint: 900,
                        settings: {
                          slidesToShow: this.props.itemAt900,
                          slidesToScroll: 1,
                          infinite: false,
                          dots: false
                        }
                    }
                )
            }

            if(this.props.pageData.appSettings && this.props.pageData['themeType'] == 2){
              settings.responsive = []
              settings.responsive.push(
                {
                    breakpoint: 576,
                    settings: {
                      slidesToShow: 1.1,
                      slidesToScroll: 1,
                      infinite: false,
                      dots: false
                    }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2.1,
                    slidesToScroll: 1,
                    infinite: false,
                    dots: false
                  }
                },
                {
                  breakpoint: 992,
                  settings: {
                    slidesToShow: 3.1,
                    slidesToScroll: 1,
                    infinite: false,
                    dots: false
                  }
                },
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 4.1,
                    slidesToScroll: 1,
                    infinite: false,
                    dots: false
                  }
                },
                {
                  breakpoint: 1500,
                  settings: {
                    slidesToShow: 5.1,
                    slidesToScroll: 1,
                    infinite: false,
                    dots: false
                  }
                },
                {
                  breakpoint: 1900,
                  settings: {
                    slidesToShow: 5.1,
                    slidesToScroll: 1,
                    infinite: false,
                    dots: false
                  }
                }
              )
            }

        return (
            <Slider {...settings}> {this.state.items} </Slider>
        )
    }

}

export default Index