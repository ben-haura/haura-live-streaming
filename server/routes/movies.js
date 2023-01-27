const express = require('express');
const router = express.Router();
const controller = require("../controllers/movies")
const importMoviecontroller = require("../controllers/importMovies")
const multer = require("multer")
const middlewareEnable = require("../middleware/enable")

router.get(process.env.subFolder+':lng?/movies/import',multer().none(),importMoviecontroller.importMovies);

router.use(process.env.subFolder+':lng?/movies/successulPayment/:id',multer().none(),controller.successul)
router.use(process.env.subFolder+':lng?/movies/cancelPayment/:id',controller.cancel)

router.get(process.env.subFolder+':lng?/movies/purchase/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.purchase);

router.use(process.env.subFolder+':lng?/create-movie/:id?',(req,res,next) => {
    req.query.selectType = "movie"
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    
    middlewareEnable.isEnable(req,res,next,"movie",permission)
},controller.create);

router.use(process.env.subFolder+':lng?/cast-and-crew/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.castView);
router.use(process.env.subFolder+':lng?/cast-and-crew',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.castBrowse);

router.use(process.env.subFolder+':lng?/create-series/:id?',(req,res,next) => {
    req.query.selectType = "series"
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    middlewareEnable.isEnable(req,res,next,"movie",permission)
},controller.create);


router.use(process.env.subFolder+':lng?/watch/:id/trailer/:trailer_id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.trailerView);



router.use(process.env.subFolder+':lng?/watch/:id/play',(req,res,next) => {
    req.query.play = 1;
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.play);
router.use(process.env.subFolder+':lng?/watch/:id/season/:season_id/episode/:episode_id/trailer/:trailer_id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.episodeView);
router.use(process.env.subFolder+':lng?/watch/:id/season/:season_id/episode/:episode_id/',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.episodeView);
router.use(process.env.subFolder+':lng?/watch/:id/season/:season_id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.browseSeason);

router.use(process.env.subFolder+':lng?/movies-series/categories',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.categories);
router.use(process.env.subFolder+':lng?/movies-series/category/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.category);
router.get(process.env.subFolder+':lng?/movies',multer().none(),(req,res,next) => {
    req.contentType = "movies";
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.browse);
router.get(process.env.subFolder+':lng?/series',multer().none(),(req,res,next) => {
    req.contentType = "series";
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.browse);
module.exports = router; 