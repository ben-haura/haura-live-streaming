const  commonFunction = require("../functions/commonFunctions")

module.exports = async (req, res, next) => {
    req.query.pagecustomParameters = req.params;
    if(!req.user && req.levelPermissions && req.levelPermissions["member.site_public_access"] == 1){
        
        await commonFunction.getGeneralInfo(req, res, "login");
        if (req.query.data) {
            
            res.send({data: req.query,user_login:1});
            return
        }
        res.query = req.query
        req.query = {}
        req.app.render(req, res, '/login', req.query);
        return
    }
    next();
}