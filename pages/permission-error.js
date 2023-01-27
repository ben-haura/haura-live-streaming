import React from 'react';
import Layout from '../hoc/Layout/Layout';
import axios from "../axios-site"
import PermissionError from "../containers/Error/PermissionError"

import { withTranslation } from 'react-i18next';

const Index = (props) => (
  <Layout {...props} >     
     <PermissionError {...props} />        
  </Layout>
)

const Extended = withTranslation('common', { wait: typeof window !== 'undefined' })(Index);



Extended.getInitialProps = async function(context) {
    const isServer = !!context.req
    if(isServer){
        const req = context.req
        req.i18n.toJSON = () => null
        
        
        return {pageData:context.res.query,initialI18nStore:context.res.initialI18nStore,i18n: req.i18n,initialLanguage: req.i18n.language}
    }else{
      const pageData = await axios.get("?data=1");
        return {pageData:pageData.data.data}
   }
}

export default Extended