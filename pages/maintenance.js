import React from 'react';
import Layout from '../hoc/Layout/Layout';

import * as actions from '../store/actions/general';

import axios from "../axios-site"


import Maintenance from "../containers/Error/Maintenance"

import { withTranslation } from 'react-i18next';

const Index = (props) => (
  <Layout {...props} maintenance={true} >
      <Maintenance {...props} />
  </Layout>
)

const Extended = withTranslation('common', { wait: typeof window !== 'undefined' })(Index);



Extended.getInitialProps = async function(context) {
    const isServer = !!context.req
    if(isServer){
        const req = context.req
        req.i18n.toJSON = () => null
        
        
        return {pageData:context.res.query,initialI18nStore:context.res.initialI18nStore,i18n: req.i18n,initialLanguage: req.i18n.language}
    }
}

export default Extended