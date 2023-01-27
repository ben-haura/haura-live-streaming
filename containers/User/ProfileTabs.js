import React from "react"
import Translate from "../../components/Translate/Index"
import ShortNumber from "short-number"


const Index = (props) => {
    let member = props.member
    let state = props.state
    return (
        <ul className={`nav nav-tabs${props.newDesign ? " sidebar-scroll-new" : ""}`} id="myTab" role="tablist">
        {
                state.showHomeButtom == 1 ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "home" ? " active" : ""}`} onClick={
                            () => props.pushTab("home")
                        } data-bs-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">{Translate(props, "All Posts")}</a>
                    </li>
                :
                    null
            }
            
            {
                state.planCreate ?
                    <React.Fragment>
                        <li className="nav-item">
                            <a className={`nav-link${state.tabType == "plans" ? " active" : ""}`} onClick={
                                () => props.pushTab("plans")
                            } data-bs-toggle="tab" href="#planCreate" role="tab" aria-controls="plans" aria-selected="true">{Translate(props, "Plans")}</a>
                        </li>
                        {
                            member.subscribers ? 
                        <li className="nav-item">
                            <a className={`nav-link${state.tabType == "subscribers" ? " active" : ""}`} onClick={
                                () => props.pushTab("subscribers")
                            } data-bs-toggle="tab" href="#subscribers" role="tab" aria-controls="subscribers" aria-selected="true">{Translate(props, "Subscribers")}</a>
                        </li>
                        : null
                        }
                    </React.Fragment>
            : null
            }
            {
                state.liveVideos && state.liveVideos.results && state.liveVideos.results.length > 0 ? 
                <li className="nav-item">
                    <a className={`nav-link${state.tabType == "live" ? " active" : ""}`} onClick={
                        () => props.pushTab("live")
                    } data-bs-toggle="tab" href="#live" role="tab" aria-controls="live" aria-selected="false">{Translate(props, "Live")}</a>
                </li>
                : null
            }
            {
                props.pageData.videos ? 
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "videos" ? " active" : ""}`} onClick={
                            () => props.pushTab("videos")
                        } data-bs-toggle="tab" href="#videos" role="tab" aria-controls="videos" aria-selected="false">{Translate(props, "Videos")}</a>
                    </li>
                : null
            }
            {
                props.pageData.reels ? 
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "reels" ? " active" : ""}`} onClick={
                            () => props.pushTab("reels")
                        } data-bs-toggle="tab" href="#reels" role="tab" aria-controls="reels" aria-selected="false">{Translate(props, "Reels")}</a>
                    </li>
                : null
            }
            {
                state.movies ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "movies" ? " active" : ""}`} onClick={
                            () => props.pushTab("movies")
                        } data-bs-toggle="tab" href="#movies" role="tab" aria-controls="movies" aria-selected="true">{Translate(props, "Movies")}</a>
                    </li>
                    : null
            }
            {
                state.series ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "series" ? " active" : ""}`} onClick={
                            () => props.pushTab("series")
                        } data-bs-toggle="tab" href="#series" role="tab" aria-controls="series" aria-selected="true">{Translate(props, "Series")}</a>
                    </li>
                    : null
            }
            {
                state.channels ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "channels" ? " active" : ""}`} onClick={
                            () => props.pushTab("channels")
                        } data-bs-toggle="tab" href="#channels" role="tab" aria-controls="channels" aria-selected="true">{Translate(props, "Channels")}</a>
                    </li>
                    : null
            }
            {
                state.audios ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "audio" ? " active" : ""}`} onClick={
                            () => props.pushTab("audio")
                        } data-bs-toggle="tab" href="#audios" role="tab" aria-controls="audios" aria-selected="true">{Translate(props, "Audio")}</a>
                    </li>
                    : null
            }
            {
                state.blogs ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "blogs" ? " active" : ""}`} onClick={
                            () => props.pushTab("blogs")
                        } data-bs-toggle="tab" href="#blogs" role="tab" aria-controls="blogs" aria-selected="true">{Translate(props, "Blogs")}</a>
                    </li>
                    : null
            }
            
            {
                state.paidVideos && state.paidVideos.results && state.paidVideos.results.length > 0 ? 
                <li className="nav-item">
                    <a className={`nav-link${state.tabType == "paid" ? " active" : ""}`} onClick={
                        () => props.pushTab("paid")
                    } data-bs-toggle="tab" href="#paid" role="tab" aria-controls="paid" aria-selected="false">{Translate(props, "Paid Videos")}</a>
                </li>
                : null
            }
            {
                state.playlists ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "playlists" ? " active" : ""}`} onClick={
                            () => props.pushTab("playlists")
                        } data-bs-toggle="tab" href="#playlists" role="tab" aria-controls="playlists" aria-selected="true">{Translate(props, "Playlists")}</a>
                    </li>
                    : null
            }
                        
            {
                props.pageData.appSettings[`${"member_comment"}`] == 1 ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "comments" ? " active" : ""}`} onClick={
                            () => props.pushTab("comments")
                        } data-bs-toggle="tab" href="#comments" role="tab" aria-controls="comments" aria-selected="true">{`${Translate(props,"Comments")}`}</a>
                    </li>
                    : null
            }
            {
                state.showHomeButtom != 1 ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "about" ? " active" : ""}`} onClick={
                            () => props.pushTab("about")
                        } data-bs-toggle="tab" href="#about" role="tab" aria-controls="about" aria-selected="true">{Translate(props, "About")}</a>
                    </li>
            : null
            }
        </ul>
    )
}
export default Index;