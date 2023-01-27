const  commonFunction = require("../functions/commonFunctions")

module.exports = async (req, res, next) => {
    //if(req.user)
    req.query.pagecustomParameters = req.params;
    await commonFunction.getGeneralInfo(req, res, "", true);
    next();
}