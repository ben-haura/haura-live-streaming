import React from "react"
import { connect } from 'react-redux';
import dynamic from 'next/dynamic'
import Router from 'next/router';

const PWAPrompt = dynamic(() => import("react-ios-pwa-prompt"), {
    ssr: false
  });

const Content = dynamic(() => import("./Content"), {
    ssr: false 
});

const LoginPopup = dynamic(() => import("../Login/Popup"), {
    ssr: false 
  });

const SignupPopup = dynamic(() => import("../Signup/Popup"), {
    ssr: false
});

const ToastMessage = dynamic(() => import("../ToastMessage/Index"), {
    ssr: false
});

const ToastContainer = dynamic(() => import("../ToastMessage/Container"), {
    ssr: false
});

const Playlist = dynamic(() => import("../Video/Playlist"), {
    ssr: false
});

const RatingStats = dynamic(() => import("../Rating/Stats"), {
    ssr: false
});

const SocialShare = dynamic(() => import("../SocialShare/Footer"), {
    ssr: false
});
const Report = dynamic(() => import("../Report/Index"), {
    ssr: false
});
import axios from "../../axios-orders"

const FullPageSearch = dynamic(() => import("../Footer/FullPageSearch"), {
    ssr: false
  });
class Footer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            adult:props.pageData.adultAllowed ? true : false,
             previousUrl:typeof window != "undefined" ? Router.asPath : ""
        }
        this.allowAdultContent = this.allowAdultContent.bind(this)
    }
    allowAdultContent = (e) => {
        this.setState({adult:!this.state.adult},() => {
            const formData = new FormData()
            formData.append('adult', this.state.adult ? 1 : 0)            
            let url = '/members/adult'
            axios.post(url, formData)
                .then(response => {
                 Router.push( this.state.previousUrl ? this.state.previousUrl : Router.pathname)
                })
        })
        
    }
    
    render() {

        return (
            <React.Fragment>
                {
                    this.props.pageData.appSettings["fixed_header"] != 1 ? 
                        <Content  {...this.props} allowAdultContent={this.allowAdultContent} adultChecked={this.state.adult} />
                    : 
                        null
                }
                {
                    this.props.searchClicked && this.props.pageData.appSettings['fixed_header'] == 1 ? 
                        <FullPageSearch {...this.props} />
                    : null
                }
                {
                    !this.props.pageData.loggedInUserDetails ?
                        <React.Fragment>
                            {
                                !this.props.loginButtonHide ?
                                    !this.props.redirectLogin ?
                                    <LoginPopup {...this.props} router={Router} />
                                : null
                                : null
                            }
                             {
                                !this.props.signButtonHide && this.props.pageData.appSettings['member_registeration'] == 1 ?
                                    !this.props.redirectLogin ?
                                        <SignupPopup  {...this.props} router={Router} />
                                    : null
                                : null
                             }
                        </React.Fragment>
                        : null
                }

                {
                    this.props.playlistClicked && this.props.playlistVideoId != 0 ?
                        <Playlist {...this.props} />
                        : null
                }
                
                <ToastContainer {...this.props} />
                {
                    <ToastMessage {...this.props} />
                }
                {
                    this.props.ratingClicked ?
                        <RatingStats  {...this.props} />
                        : null
                }
                {
                    this.props.openReport ? 
                    <Report {...this.props} />
                    : null
                }
                {
                    this.props.isSharePopup ?
                        <React.Fragment>
                            <SocialShare {...this.props} shareData={this.props.sharePopupData} countItems="all" checkcode={true} />
                        </React.Fragment>
                        : null
                }
                {
                    this.props.pageData.appSettings["pwa_app_name"] && !this.props.pageData.fromAPP ? 
                        <PWAPrompt copyTitle={this.props.t("Add to Home Screen")} 
                        copyBody={this.props.t("Add it to your home screen to use it in fullscreen and while offline.")} 
                        copyShareButtonLabel={this.props.t("1) Press the 'Share' button")} copyAddHomeButtonLabel={this.props.t("2) Press 'Add to Home Screen'")}
                        copyClosePrompt={this.props.t("Cancel")} timesToShow={50} permanentlyHideOnDismiss={true} />
                    : null
                }
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        playlistClicked: state.playlist.playlistClicked,
        ratingClicked: state.rating.ratingClicked,
        playlistVideoId: state.playlist.video_id,
        message: state.toast.message,
        isSharePopup: state.sharepopup.status,
        sharePopupData: state.sharepopup.data,
        openReport:state.report.status,
        searchClicked:state.search.searchClicked
    };
};

export default connect(mapStateToProps, null)(Footer);
