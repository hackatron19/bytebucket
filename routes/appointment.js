var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const nodemailer = require('nodemailer');

/* GET users listing. */
router.get('/', function (req, res) {

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

    var td = mm*100+dd;

    for (key in result) {
      var res2 = result[key];
      for (key2 in res2) {
        var pdr = res2[key2].date.split('-');
        var pn = parseInt(pdr[1])*100+parseInt(pdr[0]);

        if (res2[key2].date == today)
          APP1.push(res2[key2]);
        else if(pn>td)
          APP2.push(res2[key2]);
      }
    }
    APP1.sort(function(a,b){
      return a.priority-b.priority;
    })

    res.render('appointment', { title: "Appointments", appointments: APP1, app2: APP2 });

  });


});

router.post('/accept', function (req, res) {

  var pfuid = req.body.appointment.pfuid;
  var dfuid = req.body.appointment.dfuid;
  var apid = req.body.appointment.apid;
  var date = req.body.appointment.date;

  firebase.database().ref('/appointments/doctor/' + dfuid + '/' + date).orderByChild('status').equalTo('accepted').once('value', function (snap) {
    var dayapcount = snap.numChildren();
    console.log("ac count", dayapcount);
    var sno = dayapcount + 1;

    var updates = {};
    updates['/appointments/patients/' + pfuid + '/' + apid + '/priority'] = sno;
    updates['/appointments/patients/' + pfuid + '/' + apid + '/status'] = "accepted";
    updates['/appointments/doctor/' + dfuid + '/' + date + '/' + apid + '/priority'] = sno;
    updates['/appointments/doctor/' + dfuid + '/' + date + '/' + apid + '/status'] = "accepted";

    firebase.database().ref().update(updates).then(function () {

      firebase.database().ref('/Patients/' + pfuid).once('value', function (snap) {
        var mail = snap.val().email;
        sendMail(mail, "accepted");
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

router.post('/reschedule', function (req, res) {
  var appointment = req.body.appointment;
  var apid = appointment.apid;
  var dfuid = appointment.dfuid;
  var pfuid = appointment.pfuid;
  var date = appointment.date;
  console.log(appointment);

  firebase.database().ref('/appointments/doctor/' + dfuid + '/' + date).orderByChild('status').equalTo('accepted').once('value', function (snap) {
    var list = snap.val();

    var list_arr = [];
    for(key in list){
      list_arr.push(list[key]);
    }
    list_arr.sort(function(a,b){
      return a.priority-b.priority;
    });

    for(var i=0;i<list_arr.length;i++){
      if(list_arr[i].appointmentId == apid){
        for(j=i+1;j<list_arr.length;j++){
          list_arr[j].priority--;
        }
        break;
      }
    }

    list_arr[i].priority = list_arr[--j].priority+1;

    console.log("List",list_arr);

    for(var i=0;i<list_arr.length;i++){
      firebase.database().ref('/appointments/doctor/' + dfuid + '/' + date + "/" + list_arr[i].appointmentId).update({ 'priority': list_arr[i].priority});
      firebase.database().ref('/appointments/patients/' + list_arr[i].pfuid + '/' + list_arr[i].appointmentId).update({ 'priority': list_arr[i].priority });

    }

  

    // var match_key, flag = 0;
    // var last;
    
    // for (key in list) {
    //   last = list[key].priority;
    //   if (flag == 1) {
    //     firebase.database().ref('/appointments/doctor/' + dfuid + '/' + date + "/" + key).update({ 'priority': list[key].priority - 1 });
    //     firebase.database().ref('/appointments/patients/' + list[key].pfuid + '/' + key).update({ 'priority': list[key].priority - 1 });
    //   }

    //   if (key == apid) {
    //     match_key = key;
    //     flag = 1;
    //   }

    // }
    // firebase.database().ref('/appointments/doctor/' + dfuid + '/' + date + "/" + match_key).update({ 'priority': last  });
    // firebase.database().ref('/appointments/patients/' + list[match_key].pfuid + '/' + match_key).update({ 'priority': last  });

  });
  res.send({'msg':'ok'});
});

module.exports = router;
