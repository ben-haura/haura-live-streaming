import React from "react"
import Link from "../../components/Link/index";
import Image from "../Image/Index"


class Season extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            movie:props.movie,
            seasons:props.seasons
        }
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
                seasons:nextProps.seasons
            }
        } else{
            return null
        }

    }

    render(){

        let items = this.state.seasons.map((item,_) => {
            return (
                <div key={item.season_id} className="item">
                    <div className="ThumbBox-wrap">
                        <Link href="/season" customParam={`season_id=${item.season}&id=${this.state.movie.custom_url}`} as={`/watch/${this.state.movie.custom_url}/season/${item.season}`}>
                            <a className="ThumbBox-link">
                                <div className="ThumbBox-coverImg">
                                    <span>
                                        <Image image={item.image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                                    </span>
                                </div>                                
                                <div className="ThumbBox-Title">
                                    <div className="title ellipsize2Line">
                                        <h4 className="m-0">{`Season ${item.season}`}{" "} <span className="material-icons">fiber_manual_record</span> {" "} {`${item.episodes_count} Episodes`}</h4>
                                    </div>
                                </div>
                            </a>
                        </Link>
                    </div> 
                </div>
            )
        })

        return (            
            <div className="gridContainer gridSeason">
                {items}
            </div>
        )
    }
}



export default Season