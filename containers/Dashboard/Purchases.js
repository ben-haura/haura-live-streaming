import React from "react"
import Video from "../Video/Browse";
import Movie from "../Movies/Browse";

class Purchases extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            value:"video",
            movies:props.pageData.items.movies,
            pagging:props.pageData.items.movies_pagging
        }
    }

    render(){

        return(
            <div className="dashboard-purchases">
                {
                    this.state.movies ? 
                    <div>
                        <div className="serachRsltsort">
                            <div className="totalno"></div>
                            <div className="sortby formFields">
                                <div className="form-group sortbys">
                                    <select className="form-control form-select purchase" value={this.state.value} onChange={(e) => this.setState({value:e.target.value})}>
                                        <option value="video">{this.props.t("Video")}</option>
                                        <option value="movie">{this.props.t("Movies & Series")}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    : null
                }
                {
                    this.state.value == "video" ?
                    <Video {...this.props} contentType={this.props.contentType} member={this.props.member}  />
                    :
                    <Movie {...this.props} contentTypeMovie={this.props.contentType} member={this.props.member} movies={this.state.movies} pagging={this.state.pagging} />
                }
            </div>
        )

    }
}

export default Purchases