const express = require('express');
const router = express.Router();
const controller = require("../controllers/messages")

router.use(process.env.subFolder+':lng?/messages/:id?',(req,res,next) => {
    next();
},controller.index);



module.exports = router; 