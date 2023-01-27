import React from 'react';
import Layout from '../hoc/Layout/Layout';
import axios from "../axios-site"
import ReelView from "../containers/Reels/Carousel/Reels"

import { withTranslation } from 'react-i18next';

import PageNotFound from "../containers/Error/PageNotFound"
import PermissionError from "../containers/Error/PermissionError"
import Login from "../containers/Login/Index"
import Maintanance from "../containers/Error/Maintenance"

const Reel = (props) => (
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
            <ReelView {...props} />
    }
  </Layout>
)

const Extended = withTranslation('common', { wait: typeof window !== 'undefined' })(Reel);

Extended.getInitialProps = async function(context) {
    const isServer = !!context.req
    if(isServer){
        const req = context.req
        req.i18n.toJSON = () => null
        return {pageData:context.res.query,initialI18nStore:context.res.initialI18nStore,i18n: req.i18n,initialLanguage: req.i18n.language}
    }else{
      const pageData = await axios.get("/reel/"+context.query.id+"?data=1&user_id="+(context.query.user_id ? context.query.user_id : ""));
      if(context.query.user_id){
        pageData.data.data["member_user_id"] = context.query.user_id
      }
      if(context.query.username){
        pageData.data.data["member_username"] = context.query.username
      }

      return {pageData:pageData.data.data,user_login:pageData.data.user_login,pagenotfound:pageData.data.pagenotfound,permission_error:pageData.data.permission_error,maintanance:pageData.data.maintanance}
   }
}

export default Extended