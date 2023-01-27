import React from "react";
import TwitterLogin from './Twitter';
import FacebookLogin from '@greatsumini/react-facebook-login';
import Google from './Google';
import AppleSignin from 'react-apple-signin-auth';

import config from "../../config"
import { connect } from "react-redux"
import Router from 'next/router';
import general from '../../store/actions/general';
import axios from "../../axios-site"
import Translate from "../../components/Translate/Index";

class SocialLogin extends React.Component {
    constructor(props) {
        super(props)
        this.googleResponse = this.googleResponse.bind(this)
        this.twitterResponse = this.twitterResponse.bind(this)
        this.facebookResponse = this.facebookResponse.bind(this)
    }
    shouldComponentUpdate(){
        return false;
    }
    twitterResponse = (response) => {
        response.json().then(user => {
            if (user) {
                if (user.error) {
                    this.props.openToast(Translate(this.props,user.error), "error");
                } else {
                    const { BroadcastChannel } = require('broadcast-channel');
                    const userChannel = new BroadcastChannel('user');
                    userChannel.postMessage({
                        payload: {
                            type: "LOGIN"
                        }
                    });
                    const currentPath = Router.pathname;
                    $('.loginRgtrBoxPopup').find('button').eq(0).trigger('click')
                    // if (currentPath == "/" || currentPath == "/login")
                    //     Router.push('/')
                    // else {
                    //     Router.push(this.state.previousUrl ? this.state.previousUrl : currentPath)
                    // }
                }
            }
        });
    };
    facebookResponse = (response) => {
        if(!response.accessToken){
            return;
        }
        const querystring = new FormData();
        let url = 'auth/facebook';
        querystring.append("access_token", response.accessToken);
        axios.post(url, querystring)
            .then(response => {
                if (response.data.error) {
                    this.props.openToast(Translate(this.props,response.data.error), "error");
                } else {
                    const { BroadcastChannel } = require('broadcast-channel');

                    const currentPath = Router.pathname;
                    $('.loginRgtrBoxPopup').find('button').eq(0).trigger('click')
                    const userChannel = new BroadcastChannel('user');
                    userChannel.postMessage({
                        payload: {
                            type: "LOGIN"
                        }
                    });
                    // if (currentPath == "/" || currentPath == "/login")
                    //     Router.push('/')
                    // else {
                    //     Router.push(this.state.previousUrl ? this.state.previousUrl : currentPath)
                    // }
                }
            }).catch(err => {
                this.props.openToast(Translate(this.props,err.message), "error");
            });
    }

    googleResponse = (response) => {
        const querystring = new FormData()
        let url = ""
        if(response.access_token){
             url = 'auth/google'
             querystring.append("access_token", response.access_token);
        }else{
            querystring.append("token", response.credential);
            url = 'auth/one-touch-google'
        }
        
        axios.post(url, querystring)
            .then(response => {
                if (response.data.error) {
                    this.props.openToast(Translate(this.props,response.data.error), "error");
                } else {
                    const { BroadcastChannel } = require('broadcast-channel');

                    const currentPath = Router.pathname;
                    $('.loginRgtrBoxPopup').find('button').eq(0).trigger('click')
                    const userChannel = new BroadcastChannel('user');
                    userChannel.postMessage({
                        payload: {
                            type: "LOGIN"
                        }
                    });
                    // if (currentPath == "/" || currentPath == "/login")
                    //     Router.push('/')
                    // else {
                    //     Router.push(this.state.previousUrl ? this.state.previousUrl : currentPath)
                    // }
                }
            }).catch(err => {
                this.props.openToast(Translate(this.props,err.message), "error");
            });
    };
    appleResponse = (response) => {
        const querystring = new FormData()
        let url = 'auth/apple'
        querystring.append("access_token", response.authorization.id_token);
        querystring.append("code", response.authorization.code);
        axios.post(url, querystring)
            .then(response => {
                if (response.data.error) {
                    this.props.openToast(Translate(this.props,response.data.error), "error");
                } else {
                    const { BroadcastChannel } = require('broadcast-channel');

                    const currentPath = Router.pathname;
                    $('.loginRgtrBoxPopup').find('button').eq(0).trigger('click')
                    const userChannel = new BroadcastChannel('user');
                    userChannel.postMessage({
                        payload: {
                            type: "LOGIN"
                        }
                    });
                    // if (currentPath == "/" || currentPath == "/login")
                    //     Router.push('/')
                    // else {
                    //     Router.push(this.state.previousUrl ? this.state.previousUrl : currentPath)
                    // }
                }
            }).catch(err => {
                this.props.openToast(Translate(this.props,err.message), "error");
            });
    };
    onFailure = (error) => {
        //console.log(error)
    };
    appleLoginRender = (data) => {
        return (
            <a id="apple_login" onClick={data.onClick} className="circle apple" href="#"><i className="fab fa-apple"></i></a>
        );
    }
     
    render() {
       
        if( this.props.pageData.appSettings['social_login_twitter'] != 1 && this.props.pageData.appSettings['social_login_fb'] != 1  && this.props.pageData.appSettings['social_login_google'] != 1 
        && this.props.pageData.appSettings['social_login_apple'] != 1 
        )
            return null
        const redirectUri = this.props.pageData.siteURL;

        

        return (
            <React.Fragment>
                <div className="socialLogin">
                    {
                        this.props.pageData.appSettings['social_login_twitter'] == 1 ? 
                            !this.props.pageData.fromAPP ?
                                <TwitterLogin loginUrl={config.app_server + "/auth/twitter"}
                                    onFailure={this.onFailure}
                                    onSuccess={this.twitterResponse}
                                    showIcon={false}
                                    //tag="li"
                                    className="menu_twitter"
                                    requestTokenUrl={config.app_server + "/auth/twitter/reverse"} >
                                    <a id="twitter_login" className="circle twitter" href="#">
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                </TwitterLogin>
                            :
                            <a id="twitter_login" className="circle twitter" href={`${redirectUri}/login/twitter`}>
                                <i className="fab fa-twitter"></i>
                            </a>
                    : null
                    }
                    {
                        this.props.pageData.appSettings['social_login_fb'] == 1? 
                        !this.props.pageData.fromAPP ?
                            <FacebookLogin
                                appId={this.props.pageData.appSettings["fid"]}
                                autoLoad={false}
                                fields="name,email,picture,gender"
                                disableMobileRedirect={false}
                                redirectUri={redirectUri}
                                onSuccess={(response) => {
                                    this.facebookResponse(response);
                                }}
                                onFail={(error) => {
                                    this.onFailure(error)
                                  }}
                                // callback={this.facebookResponse}
                                render={renderProps => (
                                    <a id="facebook_login" onClick={renderProps.onClick} className="circle facebook" href="#">
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                )} />
                            :
                            <a id="facebook_login" className="circle facebook" href={`${redirectUri}/login/facebook`}>
                                <i className="fab fa-facebook-f"></i>
                            </a>
                        : null
                    }
                        {
                            this.props.pageData.appSettings['social_login_google'] == 1 ? 
                            !this.props.pageData.fromAPP ?
                            <Google {...this.props} googleResponse={this.googleResponse} onFailure={this.onFailure} />
                            :
                            <a id="google_login" disabled={false} className="circle google" href={`${redirectUri}/login/google`}>
                                <i className="fab fa-google"></i>
                            </a>
                        : null
                    }
                    {
                        this.props.pageData.appSettings['social_login_apple'] == 1 ? 
                        !this.props.pageData.fromAPP ?
                            <AppleSignin
                                /** Auth options passed to AppleID.auth.init() */
                                authOptions={{
                                /** Client ID - eg: 'com.example.com' */
                                clientId: this.props.pageData.appSettings["aid"],
                                /** Requested scopes, seperated by spaces - eg: 'email name' */
                                scope: 'email name',
                                /** Apple's redirectURI - must be one of the URIs you added to the serviceID - the undocumented trick in apple docs is that you should call auth from a page that is listed as a redirectURI, localhost fails */
                                redirectURI: `${config.app_server}/auth/apple`,
                                /** State string that is returned with the apple response */
                                state: 'state',
                                /** Nonce */
                                nonce: 'nonce',
                                /** Uses popup auth instead of redirection */
                                    usePopup: true
                                }} // REQUIRED
                                /** General props */
                                uiType="dark"
                                /** className */
                                className="apple-auth-btn"
                                /** Removes default style tag */
                                noDefaultStyle={false}
                                /** Allows to change the button's children, eg: for changing the button text */
                                // buttonExtraChildren="Continue with Apple"
                                /** Extra controlling props */
                                /** Called upon signin success in case authOptions.usePopup = true -- which means auth is handled client side */
                                onSuccess={(response) => this.appleResponse(response)} // default = undefined
                                /** Called upon signin error */
                                onError={(error) => this.onFailure(error)} // default = undefined
                                /** Skips loading the apple script if true */
                                skipScript={false} // default = undefined
                                /** Apple image props */
                                iconProp={{ style: { marginTop: '10px' } }} // default = undefined
                                /** render function - called with all props - can be used to fully customize the UI by rendering your own component  */
                                render={(props) => this.appleLoginRender(props)}
                            />
                        :
                                <a id="apple_login" className="circle apple" href={`${redirectUri}/login/apple`}>
                                    <i className="fab fa-apple"></i>
                                </a>
                    : null
                    }


                </div>
                <div className="division">
                    <div className="line l"></div>
                    <span>or</span>
                    <div className="line r"></div>
                </div>
            </React.Fragment>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        openToast: (message, typeMessage) => dispatch(general.openToast(message, typeMessage)),
    };
};



export default connect(null, mapDispatchToProps, null)(SocialLogin);