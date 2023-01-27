import React from "react"
import Image from "../Image/Index"

import Link from "../../components/Link/index";

import SocialShare from "../SocialShare/Index"

import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import Translate from "../../components/Translate/Index"
import CensorWord from "../CensoredWords/Index"

class CastItem extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            cast:props.cast
        }
    }
    
    render(){
        return (
            <div className="single-user">
                <div className={`img${this.props.className ? " "+this.props.className : ""}`}>
                    <Link href="/cast-and-crew" customParam={`id=${this.state.cast.cast_crew_member_id}`} as={`/cast-and-crew/${this.state.cast.cast_crew_member_id}`}>
                        <a>                        
                            <Image title={CensorWord("fn",this.props,Translate(this.props,this.state.cast.name))} image={this.state.cast.image} imageSuffix={this.props.pageData.imageSuffix} siteURL={this.props.pageData.siteURL} />
                        </a>
                    </Link>
                </div>
                    <div className="content">
                        <Link href="/cast-and-crew" customParam={`id=${this.state.cast.cast_crew_member_id}`} as={`/cast-and-crew/${this.state.cast.cast_crew_member_id}`}>
                            <a className="name">          
                                <React.Fragment>         
                                {<CensorWord {...this.props} text={Translate(this.props,this.state.cast.name)} />}
                                 {
                                    this.state.cast.verified ? 
                                        <span className="verifiedUser" title={Translate(this.props,"verified")}><span className="material-icons" data-icon="check"></span></span>
                                    : null
                                }
                                </React.Fragment>     
                            </a>
                        </Link>
                        {
                            !this.props.removeDes ? 
                        <p className="des">
                            {this.state.cast.character ? this.state.cast.character : `${this.state.cast.job} (${this.state.cast.department})`}
                        </p>
                        : null
                        }
                        <div className="LikeDislikeWrap">
                        <ul className="LikeDislikeList">
                        {
                        this.props.pageData.appSettings["cast_crew_member_like"] == "1" ?
                            <li>
                                <Like icon={true} {...this.props} like_count={this.state.cast.like_count} item={this.state.cast}  type="cast_crew_member" id={this.state.cast.cast_crew_member_id} />{"  "}
                            </li>
                        : null
                        }
                        {
                            this.props.pageData.appSettings["cast_crew_member_dislike"] == "1" ?
                            <li>
                                <Dislike icon={true} {...this.props} dislike_count={this.state.cast.dislike_count} item={this.state.cast}  type="cast_crew_member" id={this.state.cast.cast_crew_member_id} />{"  "}
                            </li>
                        : null
                        }
                            {
                                this.props.pageData.appSettings["cast_crew_member_favourite"] == "1" ?
                            <li>
                                <Favourite icon={true} {...this.props} favourite_count={this.state.cast.favourite_count} item={this.state.cast}  type="cast_crew_member" id={this.state.cast.cast_crew_member_id} />{"  "}
                            </li>
                            : null
                            }    
                        <SocialShare {...this.props} hideTitle={true} buttonHeightWidth="30" url={`/cast-and-crew/${this.state.cast.cast_crew_member_id}`} title={CensorWord("fn",this.props,Translate(this.props,this.state.cast.name))} imageSuffix={this.props.pageData.imageSuffix} media={this.state.cast.image} />
                        
                        </ul>
                        </div>
                        
                    </div>
            </div>
        )
    }
}

export default  CastItem ;