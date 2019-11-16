var express = require('express');
var router = express.Router();
var firebase = require('firebase');

/* GET users listing. */
router.get('/', function(req, res, next) {

  //console.log(req.query);

  firebase.database().ref('/appointments/doctor/'+req.query.uid).once('value',function(snap){
    var result = snap.val();

    var APP = [];

    for (key in result) {
      var res2 = result[key];
      for (key2 in res2){
        APP.push(res2[key2]);
      }
    }

    res.render('appointment',{title:"Appointments",appointments:APP});

  });

  
});

router.post('/accept',function(req,res){
  
  var pfuid = req.body.appointment.pfuid;
  var dfuid = req.body.appointment.dfuid;
  var apid = req.body.appointment.apid;
  var date = req.body.appointment.date;

  var updates = {};
  updates['/appointments/patients/'+pfuid+'/'+apid+'/status'] = "accepted";
  updates['/appointments/doctor/'+dfuid+'/'+date+'/'+apid+'/status'] = "accepted";

  firebase.database().ref().update(updates);
  res.send("ok");

});

router.post('/reject',function(req,res){

  var pfuid = req.body.appointment.pfuid;
  var dfuid = req.body.appointment.dfuid;
  var apid = req.body.appointment.apid;
  var date = req.body.appointment.date;

  var updates = {};
  updates['/appointments/patients/'+pfuid+'/'+apid+'/status'] = "rejected";
  updates['/appointments/doctor/'+dfuid+'/'+date+'/'+apid+'/status'] = "rejected";

  firebase.database().ref().update(updates);
  res.send("ok");

});

module.exports = router;
