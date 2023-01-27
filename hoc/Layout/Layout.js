import React, { Component } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
// import parse from 'html-react-parser';
import Translate from '../../components/Translate/Index';
import Script from 'next/script'

class Layout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            width: props.appViewWidth ? props.appViewWidth : 993,
            IEBrowser: props.pageData.IEBrowser
        }
        
    }
    componentDidMount() {
        if(this.props.pageData.loggedInUserDetails)
            this.props.socket.emit('chatJoin', {id:this.props.pageData.loggedInUserDetails.user_id})
    }
  
    
    render() {

        let videoDuration = ""
        let videoURL = ""
        const imageSuffix = this.props.pageData.imageSuffix
        if (this.props.videoView && this.props.pageData.video && this.props.pageData.video.completed == 1) {
            if (this.props.pageData.video.duration) {
                videoDuration = "PT"
                let duration = this.props.pageData.video.duration.split(":");
                videoDuration = videoDuration + duration[0] + "H"
                videoDuration = videoDuration + duration[1] + "M"
                videoDuration = videoDuration + duration[2] + "S"
            }

            if (this.props.pageData.video.type == 3) {
                let splitName = this.props.pageData.video.video_location.split('/')
                let fullName = splitName[splitName.length - 1]
                let videoName = fullName.split('_')[0]
                let path = "/upload/videos/video/"
                videoURL = imageSuffix + path + videoName + "_240p.mp4"
            } else if (this.props.pageData.video.type == 10 && this.props.pageData.video.is_livestreaming == 0 && this.props.pageData.liveStreamingURL) {
                videoURL = this.props.pageData.liveStreamingURL + "/" + this.props.pageData.video.code
            } else if (this.props.pageData.video.type == 9) {
                videoURL = this.props.pageData.video.code
            }
        }

        const generalInfo = this.props.pageData.pageInfo ? this.props.pageData.pageInfo : {}


        let isURL = false
        if (generalInfo.image) {
            const splitVal = generalInfo.image.split('/')
            if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                isURL = true
            }
        }
        let customTags = null
        if(generalInfo.custom_tags){
            try{
                customTags = generalInfo.custom_tags.map((item,key) => {
                    let metaTagInfo = {}
                    item.forEach(metaInfo => {
                        metaTagInfo[metaInfo[0]] = metaInfo[1];
                    })
                    return <meta {...metaTagInfo} key={key} />
                })
            }catch(err){
                //silence
            }
        }
        
        
        let CDN_URL_FOR_STATIC_RESOURCES = this.props.pageData.CDN_URL_FOR_STATIC_RESOURCES ? this.props.pageData.CDN_URL_FOR_STATIC_RESOURCES : ""
        
        CDN_URL_FOR_STATIC_RESOURCES = CDN_URL_FOR_STATIC_RESOURCES + this.props.pageData.subFolder
        let file_cache = "21983923"
        if(this.props.pageData.appSettings['file_cache']){
            file_cache = this.props.pageData.appSettings["file_cache"]
        }

        let player_type = ""
        if(this.props && this.props.pageData && this.props.pageData.appSettings.player_type){
			player_type = this.props.pageData.appSettings['player_type'] 
		}
        return (
            <React.Fragment>
                {generalInfo ?
                    <Head>
                        {generalInfo.title ?
                            <title>{Translate(this.props, generalInfo.title)}</title>
                            : null}
                        {generalInfo.description ?
                            <meta name="description" content={Translate(this.props, generalInfo.description)} />
                            : null}
                        {generalInfo.keywords ?
                            <meta name="keywords" content={generalInfo.keywords} />
                            : null}
                        {generalInfo.title ?
                            <meta property="og:title" content={Translate(this.props, generalInfo.title)} />
                            : null}
                        {generalInfo.description ?
                            <meta property="og:description" content={Translate(this.props, generalInfo.description)} />
                            : null}
                        {generalInfo.image ?
                            <meta property="og:image" content={(!isURL ? imageSuffix : "") + generalInfo.image} />
                            : null}
                        {generalInfo.image && generalInfo.imageWidth ?
                            <meta property="og:image:width" content={generalInfo.imageWidth} />
                            : null}
                        {generalInfo.image && generalInfo.imageHeight ?
                            <meta property="og:image:height" content={generalInfo.imageHeight} />
                            : null}
                        {generalInfo.title ?
                            <meta property="twitter:title" content={Translate(this.props, generalInfo.title)} />
                            : null}
                        {generalInfo.description ?
                            <meta property="twitter:description" content={Translate(this.props, generalInfo.description)} />
                            : null}
                        {generalInfo.image ?
                            <meta property="twitter:image" content={(!isURL ? imageSuffix : "") + generalInfo.image} />
                            : null}
                        {generalInfo.image ?
                            <meta name="twitter:card" content="summary" />
                            : null}
                        {
                            this.props.pageData.appSettings["pwa_app_name"] ?
                                <React.Fragment>
                                    <link rel='manifest' href={`${this.props.pageData.subFolder}manifest.json`} />
                                    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                                    <meta name="apple-mobile-web-app-title" content={this.props.pageData.appSettings["pwa_app_name"]} />
                                    <meta name="msapplication-TileColor" content={this.props.pageData.appSettings["pwa_app_bg_color"]} />
                                    <meta name="theme-color" content={this.props.pageData.appSettings["pwa_app_theme_color"]} />
                                    <meta name="msapplication-TileImage" content={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} />
                                    <meta name="mobile-web-app-capable" content="yes" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_192"]} rel="icon" sizes="192x192" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="180x180" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_152"]} rel="apple-touch-icon" sizes="152x152" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_144"]} rel="apple-touch-icon" sizes="144x144" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon-precomposed" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_128"]} rel="apple-touch-icon-precomposed" sizes="128x128" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_128"]} rel="icon" sizes="128x128" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="120x120" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="114x114" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="76x76" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_72"]} rel="apple-touch-icon" sizes="72x72" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="57x57" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} rel="icon" sizes="32x32" />
                                    <link href={imageSuffix + this.props.pageData.appSettings["pwa_icon_sizes_512"]} rel="icon" sizes="16x16" />
                                </React.Fragment>
                                : null
                        }
                        {
                            customTags ?
                                customTags
                            : null
                        }
                    </Head>
                    : null
                }
                
                {
                    player_type == "element" ? 
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/mediaelement.min.js?v=${file_cache}`} strategy="beforeInteractive" />
                    : null
                }
                {
                    player_type == "element" ? 
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/speed/speed.min.js?v=${file_cache}`} strategy="beforeInteractive" />
                    : null
                }
                {
                    player_type == "element" ? 
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/speed/speed-i18n.js?v=${file_cache}`} strategy="beforeInteractive" />
                    : null
                }
                {
                    player_type == "element" ? 
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/jump-forward/jump-forward.min.js?v=${file_cache}`} strategy="beforeInteractive" />						
                    : null
                }
                {
                    player_type == "element" ? 
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/ads/ads.js?v=${file_cache}`} strategy="beforeInteractive" />
                    : null
                }
                {
                    player_type == "element" ? 
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/ads/ads-i18n.js?v=${file_cache}`} strategy="beforeInteractive" />
                    : null
                }
                {
                    player_type == "element" ? 
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/ads-vast-vpaid/ads-vast-vpaid.js?v=${file_cache}`} strategy="beforeInteractive" />
                    : null
                }
                {
                    player_type == "element" ? 
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/quality/quality.min.js?v=${file_cache}`} strategy="beforeInteractive" />
                    : null
                }
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jquery-3.4.1.min.js?v=${file_cache}`} strategy="beforeInteractive" />
                <Script src={`https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js`} strategy="beforeInteractive" />
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/custom/header.js?v=${file_cache}`} strategy="beforeInteractive" />	
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jQuery-1.9.1.js?v=${file_cache}`} strategy="beforeInteractive" />
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jquery.magnific-popup.js?v=${file_cache}`} strategy="beforeInteractive" />					
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jquery1.5.1.min.js?v=${file_cache}`} type="text/javascript" strategy="beforeInteractive"></Script>
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jquery-ui.min.js?v=${file_cache}`} strategy="beforeInteractive"></Script>

                { 
                    this.props && this.props.pageData && this.props.pageData.appSettings &&  this.props.pageData.appSettings['google_analytics_code'] ? 
                        <Script strategy="afterInteractive" dangerouslySetInnerHTML={{__html: `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
                        ga('create', "${this.props.pageData.appSettings['google_analytics_code']}", 'auto');
                        ga('send', 'pageview');`}} />
                    : null
                }
                
                {
                    this.props.videoView && this.props.pageData.video && this.props.pageData.video.type == 3 ?
                        // <Head>
                            <React.Fragment>
                                <Script src="//imasdk.googleapis.com/js/sdkloader/ima3.js" strategy="afterInteractive" />
                                <Script src="//cdn.iframe.ly/embed.js"  strategy="afterInteractive" />
                            </React.Fragment>
                        // </Head>
                        : null
                } 

                {
                    this.props.pageData.appSettings['advertisement_type'] == 2 ?
                        <React.Fragment>
                            <Script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"  strategy="afterInteractive" />
                        </React.Fragment>
                        : null
                }

                {
                    videoURL != "" ?
                            <Script type="application/ld+json" dangerouslySetInnerHTML={{
                                __html:
                                    `{
                                "@context": "http://schema.org",
                                "@type": "VideoObject",
                                "name": "${this.props.pageData.video.title}",
                                "description": "${this.props.pageData.video.description}",
                                "thumbnailUrl":"${(!isURL ? imageSuffix : "") + generalInfo.image}",
                                "uploadDate": "${this.props.pageData.video.creation_date}",
                                "duration": "${videoDuration}",
                                "contentUrl": "${videoURL}"
                            }`
                            }} />
                        : null
                }
                {this.props.children}
            </React.Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        themeType: state.search.themeType
    };
};


export default connect(mapStateToProps, null)(Layout);

