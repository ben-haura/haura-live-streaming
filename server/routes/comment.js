const express = require('express');
const router = express.Router();
const controller = require("../controllers/comments")

router.use(process.env.subFolder+':lng?/comment/:id?',controller.comment);
router.use(process.env.subFolder+':lng?/reply/:id?',controller.reply);
module.exports = router;