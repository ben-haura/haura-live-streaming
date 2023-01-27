import React from 'react';
import Layout from '../hoc/Layout/Layout';

import * as actions from '../store/actions/general';

import axios from "../axios-site"

import dynamic from 'next/dynamic'
import Router from 'next/router';
import ForgotForm from "../containers/Forgot/Index"



import { withTranslation } from 'react-i18next';

import PageNotFound from "../containers/Error/PageNotFound"
import PermissionError from "../containers/Error/PermissionError"
import Login from "../containers/Login/Index"
import Maintanance from "../containers/Error/Maintenance"

const Forgot = (props) => (
  <Layout {...props} redirectLogin={true}>
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
      <ForgotForm {...props} />
    }
  </Layout>
)

const Extended = withTranslation('common', { wait: typeof window !== 'undefined' })(Forgot);

Extended.getInitialProps = async function(context) {
    const isServer = !!context.req
    if(isServer){
      if(context.res.query.loggedInUserDetails){
        context.res.redirect('/');
      }else{
        const req = context.req
        req.i18n.toJSON = () => null
        
        
            return {pageData:context.res.query,initialI18nStore:context.res.initialI18nStore,i18n: req.i18n,initialLanguage: req.i18n.language}
      }
    }else{
      const pageData = await axios.get("/forgot?data=1");
      if(pageData.data.data.loggedInUserDetails){
        Router.push('/')
      }else{
        

      return {pageData:pageData.data.data,user_login:pageData.data.user_login,pagenotfound:pageData.data.pagenotfound,permission_error:pageData.data.permission_error,maintanance:pageData.data.maintanance}
      }
   }
}

export default Extended