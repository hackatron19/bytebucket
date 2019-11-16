var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const nodemailer = require('nodemailer');

/* GET users listing. */
router.get('/', function (req, res, next) {

  //console.log(req.query);

  firebase.database().ref('/appointments/doctor/' + req.query.uid).once('value', function (snap) {
    var result = snap.val();

    var APP = [];

    for (key in result) {
      var res2 = result[key];
      for (key2 in res2) {
        APP.push(res2[key2]);
      }
    }

    res.render('appointment', { title: "Appointments", appointments: APP });

  });


});

router.post('/accept', function (req, res) {

  var pfuid = req.body.appointment.pfuid;
  var dfuid = req.body.appointment.dfuid;
  var apid = req.body.appointment.apid;
  var date = req.body.appointment.date;

  firebase.database().ref('/appointments/doctor/'+dfuid+ '/' + date).orderByChild('status').equalTo('accepted').once('value', function (snap) {
    var dayapcount = snap.numChildren();
    console.log("ac count",dayapcount);
    var sno = dayapcount + 1;
    
    var updates = {};
    updates['/appointments/patients/' + pfuid + '/' + apid + '/priority'] = sno;
    updates['/appointments/patients/' + pfuid + '/' + apid + '/status'] = "accepted";
    updates['/appointments/doctor/' + dfuid + '/' + date + '/' + apid + '/priority'] = sno;
    updates['/appointments/doctor/' + dfuid + '/' + date + '/' + apid + '/status'] = "accepted";

    firebase.database().ref().update(updates).then(function () {

      firebase.database().ref('/Patients/' + pfuid).once('value', function (snap) {
        var mail = snap.val().email;
        //sendMail(mail, "accepted");
      });


    });
    res.send("ok");



  });

});

router.post('/reject', function (req, res) {

  var pfuid = req.body.appointment.pfuid;
  var dfuid = req.body.appointment.dfuid;
  var apid = req.body.appointment.apid;
  var date = req.body.appointment.date;

  var updates = {};
  updates['/appointments/patients/' + pfuid + '/' + apid + '/status'] = "rejected";
  updates['/appointments/doctor/' + dfuid + '/' + date + '/' + apid + '/status'] = "rejected";

  firebase.database().ref().update(updates).then(function () {
    firebase.database().ref('/Patients/' + pfuid).once('value', function (snap) {
      var mail = snap.val().email;
      sendMail(mail, "rejected");
    });

  });
  res.send("ok");

});


function sendMail(mail, status) {
  // Create a SMTP transporter object
  let transporter = nodemailer.createTransport(
    {
      service: 'Gmail',
      auth: {
        user: "bytebucket1111@gmail.com",
        pass: "bytebucketNITJSR"
      }
    },
    {
      // sender info
      from: 'Medico <no-reply@medico.com>'
    }
  );

  // Message object
  let message = {
    to: mail,
    subject: 'Appointment ' + status + '!',
    text: 'Hello to myself!',
    html: `<p><b>Hey there</b></p>
        <p>Your appointment has been `+ status + `<br/></p>`

  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log('Error occurred');
      console.log(error.message);
      return process.exit(1);
    }

    console.log('Message sent successfully!');

    transporter.close();
  });


}

module.exports = router;
