import React from 'react';
import Layout from '../hoc/Layout/Layout';
import axios from "../axios-site"
import HomeContainer from "../containers/Home/Index"
import { withTranslation } from 'react-i18next';
import Login from "../containers/Login/Index"
import Maintanance from "../containers/Error/Maintenance"

const Home = (props) => (
  <Layout {...props} >
    {
     props.user_login ?
          <Login {...props} />
        : props.maintanance ?
          <Maintanance {...props} />
        :
          <HomeContainer {...props} />
    }
  </Layout>
)
 
const Extended = withTranslation('common', { wait: typeof window !== 'undefined' })(Home);

Extended.getInitialProps = async function(context) {
    const isServer = !!context.req
    if(isServer){
      const req = context.req
      req.i18n.toJSON = () => null
      return {pageData:context.res.query,initialI18nStore:context.res.initialI18nStore,i18n: req.i18n,initialLanguage: req.i18n.language}
    }else{
      const pageData = await axios.get("/?data=1");
      return {pageData:pageData.data.data,user_login:pageData.data.user_login,pagenotfound:pageData.data.pagenotfound,permission_error:pageData.data.permission_error,maintanance:pageData.data.maintanance}
   }
}

export default Extended