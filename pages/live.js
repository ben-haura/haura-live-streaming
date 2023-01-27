import React from 'react';
import Layout from '../hoc/Layout/Layout';
import * as actions from '../store/actions/general';
import axios from "../axios-site"
import BrowseVideos from "../containers/Video/Browse"

import { withTranslation } from 'react-i18next';

import PageNotFound from "../containers/Error/PageNotFound"
import PermissionError from "../containers/Error/PermissionError"
import Login from "../containers/Login/Index"
import Maintanance from "../containers/Error/Maintenance"

const Videos = (props) => (
  <Layout {...props} >
    {
      props.pagenotfound ? 
        <PageNotFound {...props} />
: props.user_login ?
        <Login {...props} />
        : props.permission_error ?
        
        <PermissionError {...props} />
        : props.maintanance ?
        <Maintanance {...props} />
        :
      <BrowseVideos {...props} />
    }
  </Layout>
)

const Extended = withTranslation('common', { wait: typeof window !== 'undefined' })(Videos);

Extended.getInitialProps = async function(context) {
    const isServer = !!context.req
    if(isServer){
        const req = context.req
        req.i18n.toJSON = () => null
        
        
        return {pageData:context.res.query,initialI18nStore:context.res.initialI18nStore,i18n: req.i18n,initialLanguage: req.i18n.language}
    }else{
      let params = ""
        if(context.query){
          params = "&"+$.param(context.query)
        }
        let liveStreaming = "&isLiveStreaming=1"
        let type = context.query.pageType ? context.query.pageType : ""
      const pageData = await axios.get("/live/"+type+"?data=1"+liveStreaming+params);
      

      return {pageData:pageData.data.data,user_login:pageData.data.user_login,pagenotfound:pageData.data.pagenotfound,permission_error:pageData.data.permission_error,maintanance:pageData.data.maintanance}
   }
}

export default Extended