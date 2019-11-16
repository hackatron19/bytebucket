var express = require('express');
var router = express.Router();
var firebase = require('firebase');

/* GET users listing. */
router.get('/', function (req, res, next) {

  //console.log(req.query);

  firebase.database().ref('/appointments/doctor/' + req.query.uid).once('value', function (snap) {
    var result = snap.val();

    var APP1 = [];
    var APP2 = [];

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    var today = dd + '-' + mm + '-' + yyyy;

    for (key in result) {
      var res2 = result[key];
      for (key2 in res2) {
        if(res2[key2].date == today)
          APP1.push(res2[key2]);
        else
          APP2.push(res2[key2]);
      }
    }

    res.render('appointment', { title: "Appointments", appointments: APP1, app2 : APP2 });

  });


});

router.post('/accept', function (req, res) {

  var pfuid = req.body.appointment.pfuid;
  var dfuid = req.body.appointment.dfuid;
  var apid = req.body.appointment.apid;
  var date = req.body.appointment.date;

  var updates = {};
  updates['/appointments/patients/' + pfuid + '/' + apid + '/status'] = "accepted";
  updates['/appointments/doctor/' + dfuid + '/' + date + '/' + apid + '/status'] = "accepted";

  firebase.database().ref().update(updates);
  res.send("ok");

});

router.post('/reject', function (req, res) {

  var pfuid = req.body.appointment.pfuid;
  var dfuid = req.body.appointment.dfuid;
  var apid = req.body.appointment.apid;
  var date = req.body.appointment.date;

  var updates = {};
  updates['/appointments/patients/' + pfuid + '/' + apid + '/status'] = "rejected";
  updates['/appointments/doctor/' + dfuid + '/' + date + '/' + apid + '/status'] = "rejected";

  firebase.database().ref().update(updates);
  res.send("ok");

});

router.post('/reschedule', function (req, res) {
  var appointment = req.body.appointment;
  console.log(appointment);

  firebase.database().ref('/app')
  res.send("ok");
});

module.exports = router;
