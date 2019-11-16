var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    
  res.render('diagnosed',{title:"Past appointments"});
});

module.exports = router;
