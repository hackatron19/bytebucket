var express = require('express');
var router = express.Router();
var firebase = require('firebase');

var QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('add-article',{title : "Add Article"});
});

router.post('/', function(req, res, next) {
  //console.log(req.body);
  let article = req.body.article;
  //console.log("init art",article);
  let delta = article.description;
  var deltaOps = delta.ops;
  var converter = new QuillDeltaToHtmlConverter(deltaOps, {});

  var html = converter.convert();

  article.description = html;
  firebase.database().ref("/articles").push(article).then(function(data){
    res.send(data);
  });
  
});

module.exports = router;
