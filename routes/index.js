var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var firebaseConfig = {
  apiKey: "AIzaSyC6doPoF4xbTMS_qN_QuMZ_MPs_uxv686U",
  authDomain: "medico-test.firebaseapp.com",
  databaseURL: "https://medico-test.firebaseio.com",
  projectId: "medico-test",
  storageBucket: "medico-test.appspot.com",
  messagingSenderId: "350182820310",
  appId: "1:350182820310:web:159a7e5f95316eabd23c77",
  measurementId: "G-F423GTK7P6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/* GET home page. */
router.get('/',function (req, res, next) {

  firebase.database().ref('/articles').once("value", function (snap) {
    var articles = snap.val();
    var data = [];
    for (key in articles) {
      data.push(articles[key]);
    }
    
    res.render('index', { title: "Dashboard", articles: data });

  });

});

module.exports = router;
