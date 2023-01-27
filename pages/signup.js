import React from 'react';
import Layout from '../hoc/Layout/Layout';

import * as actions from '../store/actions/general';

import axios from "../axios-site"

import dynamic from 'next/dynamic'
import Router from 'next/router';
import SignForm from "../containers/Signup/Index"



import { withTranslation } from 'react-i18next';

import PageNotFound from "../containers/Error/PageNotFound"
import PermissionError from "../containers/Error/PermissionError"
import Login from "../containers/Login/Index"
import Maintanance from "../containers/Error/Maintenance"

const Signup = (props) => (
  <Layout {...props} signButtonHide={true} redirectLogin={true}>
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
      <SignForm {...props} />
    }
  </Layout>
)

const Extended = withTranslation('common', { wait: typeof window !== 'undefined' })(Signup);



Extended.getInitialProps = async function(context) {
    const isServer = !!context.req
    if(isServer){
      if(context.res.query.loggedInUserDetails || (context.res.query.member_registeration != 1 && !context.res.query.code)){
        context.res.redirect('/');
      }else{
        const req = context.req
        req.i18n.toJSON = () => null
        return {pageData:context.res.query,initialI18nStore:context.res.initialI18nStore,i18n: req.i18n,initialLanguage: req.i18n.language}
      }
    }else{
      const pageData = await axios.get("/signup?data=1");
      if(pageData.data.data.loggedInUserDetails || (pageData.data.data.member_registeration != 1 && !pageData.data.data.code)){
        Router.push('/?type=login','/')
      }else{
        return {pageData:pageData.data.data,user_login:pageData.data.user_login,pagenotfound:pageData.data.pagenotfound,permission_error:pageData.data.permission_error,maintanance:pageData.data.maintanance}
      }
   }
}

export default Extended