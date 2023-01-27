const commonFunction = require("../functions/commonFunctions")
const messagesModel = require("../models/messages")


exports.index = async(req,res) => {
    await commonFunction.getGeneralInfo(req, res, "messages_browse")
    let messageID = req.params.id
    req.query.id = messageID

    const limit = 21
    //get messages
    await messagesModel.getMessages({resource_id:req.user.user_id,limit:limit},req).then(result => {
        req.query.pagging = false
        let items = result
        if (result.length > limit - 1) {
            items = result.splice(0, limit - 1);
            req.query.pagging = true
        }
        req.query.messages = items
    })

    if(!messageID){
        if(req.query.messages && req.query.messages.length > 0)
        messageID = req.query.messages[0].message_id
         req.query.id = messageID
    }

    //get current message id
    if(messageID){
        await messagesModel.getMessages({resource_id:req.user.user_id,limit:1,id:messageID},req).then(result => {
            req.query.openMessage = result[0]
        })
        if(!req.query.openMessage){
            if (req.query.data) {
                
                res.send({data: req.query,pagenotfound:1});
                return
            }
            res.query = req.query
            req.query = {}
            req.app.render(req, res, '/page-not-found', req.query);
            return
        }
        // //get chat messages
        // await messagesModel.getChatMessages({limit:5,id:messageID},req).then(result => {
        //     if(result)
        //         req.query.chatMessages = result
        // })
    }

    

    
    if (req.query.data) {
        
        res.send({ data: req.query })
        return
    }
    res.query = req.query
    req.query = {}
    req.app.render(req, res,  '/messanger', req.query);
}