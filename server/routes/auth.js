const express = require('express');
const router = express.Router();
const controller = require("../controllers/auth")

router.use(process.env.subFolder+':lng?/logout', async (req, res, next) => {
    if(!req.user){
        res.redirect(process.env.PUBLIC_URL+process.env.subFolder)
        return
    }
   // req.logOut()
     
    //remove app udid
    if(req.session.fromAPP){
        const devicedModel = require('../models/devices')
         devicedModel.createDevice(req, {owner_id:req.session.user,device_udid:req.session.device_udid,type:"delete"}).then(async result => {

        });
    }

    if (req.query.data) {
        const commonFunction = require("../functions/commonFunctions")
        await commonFunction.getGeneralInfo(req, res, 'logout_page')
        req.session.user = null;
        
        res.send({ data: req.query,success:true })
        return;
    }else{
        req.session.user = null;
        req.session.logout = true
        res.redirect( process.env.PUBLIC_URL+process.env.subFolder)
    }
})
router.get(process.env.subFolder+':lng?/login',controller.login);
router.get(process.env.subFolder+':lng?/signup',controller.signup);
router.get(process.env.subFolder+':lng?/signup/invite/:code',controller.invitesignup);
router.get(process.env.subFolder+':lng?/forgot',controller.forgotPassword);
router.get(process.env.subFolder+':lng?/reset/:code',controller.verifyCode);
router.get(process.env.subFolder+':lng?/verify-account/:code?',controller.verifyAccount)
module.exports = router;