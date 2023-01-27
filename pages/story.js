import React from 'react';
import Layout from '../hoc/Layout/Layout';
import Router from "next/router"
import axios from "../axios-site"
import StoryView from "../containers/Stories/Carousel/Index"

import { withTranslation } from 'react-i18next';

import PageNotFound from "../containers/Error/PageNotFound"
import PermissionError from "../containers/Error/PermissionError"
import Login from "../containers/Login/Index"
import Maintanance from "../containers/Error/Maintenance"

const closePopup = (type) => {
    if(typeof type == "undefined")
        type = false;
    if(type == "close")
        type = false;
 
    if(!type){
        Router.push("/",'/')
        $("body").removeClass("stories-open");
    }
    
}
const updateStories = () => {

}
const Story = (props) => (
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
            <StoryView {...props} fromStoryViewPage={true} closePopupFirst={closePopup} updateStories={updateStories} />
    }
  </Layout>
)

const Extended = withTranslation('common', { wait: typeof window !== 'undefined' })(Story);

Extended.getInitialProps = async function(context) {
    const isServer = !!context.req
    if(isServer){
        const req = context.req
        req.i18n.toJSON = () => null
        return {pageData:context.res.query,
            openStory:context.res.query.openStory,
            selectedStory:context.res.query.selectedStory,
            pagging:context.res.query.stories.pagging,
            items:context.res.query.stories.results,pagging:context.res.query.stories.pagging,
            initialI18nStore:context.res.initialI18nStore,i18n: req.i18n,initialLanguage: req.i18n.language}
    }else{
      const pageData = await axios.get("/story/"+context.query.id+"?data=1&user_id="+(context.query.user_id ? context.query.user_id : ""));
      if(context.query.user_id){
        pageData.data.data["member_user_id"] = context.query.user_id
      }
      if(context.query.username){
        pageData.data.data["member_username"] = context.query.username
      }

      return {pageData:pageData.data.data,
        openStory:pageData.data.data.openStory,
        selectedStory:pageData.data.data.selectedStory,
        pagging:pageData.data.data.stories.pagging,
        items:pageData.data.data.stories.results,pagging:pageData.data.data.stories.pagging,
        user_login:pageData.data.user_login,pagenotfound:pageData.data.pagenotfound,permission_error:pageData.data.permission_error,maintanance:pageData.data.maintanance}
   }
}

export default Extended