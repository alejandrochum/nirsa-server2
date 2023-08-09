const express = require('express');
const { DateTime } = require('luxon');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
var serviceAccount = require("./serviceAccountKey.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

var bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const cors = require('cors');
const { send } = require('process');
app.use(cors({
    origin: '*',
}));

app.use(express.static('public'));
app.use('/images', express.static('images'));


app.post('/todaymeals', async (req, res) => {
    let response = [];
    let today = DateTime.local().setZone("America/Guayaquil").startOf('day').toJSDate();
    console.log(Timestamp.fromDate(today));
    let mealsRef = db.collection('meals');
    let snapshot = await mealsRef.where('date', '==', Timestamp.fromDate(today)).get();
    snapshot.forEach(doc => {
        response.push(doc.data());
    })
    res.send(response);
});

app.post('/requests', async (req, res) => {
    let data = [];
    let today = DateTime.now().startOf('day').toFormat('yyyy/LL/dd');
    let mealsRef = db.collection('requests');
    let snapshot = await mealsRef.where('date', '==', today).get();
    snapshot.forEach(doc => {
        data.push(doc.data())
    })
    res.send({
        status: 'success',
        data: data
    })
});

app.post('/verifyEmail', (req, res) => {
    getAuth()
        .verifyIdToken(req.body.token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            getAuth().updateUser(uid, { emailVerified: true })
            console.log("Email verified");
            res.send("verified");
        })
        .catch((error) => {
            // Handle error
        });
})

app.post('/chefreport', (req, res) => {
    getAuth().verifyIdToken(req.body.token)
        .then((decodedToken) => {
            let sdate = new Date(req.body.startdate);
            let edate = new Date(req.body.enddate);

            const mealsRef = db.collection('meals');
            mealsRef.where('date', '>=', sdate).where('date', '<=', edate).get().then(snapshot => {
                res.send(snapshot.docs.map(doc => doc.data()));
            }).catch(error => { res.send(error) });
        }).catch((error) => {

        })
})

app.post('/qrscanned', async (req, res) => {
    let uid = req.body.qr;
    console.log(uid);
    let sdate = DateTime.local().setZone("America/Guayaquil").startOf('day').toJSDate();
    let edate = DateTime.local().setZone("America/Guayaquil").startOf('day').toJSDate();
    sdate.setHours(0, 0, 0, 0);
    edate.setHours(23, 0, 0, 0)

        if (uid.length < 10) {
        const mealsRef = db.collection('meals');
        const snapshot = await mealsRef.where('user', '==', uid).where('date', '>=', Timestamp.fromDate(sdate)).where('date', '<=', Timestamp.fromDate(edate)).get();
        if (!snapshot.empty) {
            let meals = [];
            snapshot.forEach(doc => {
                meals.push(doc.data());
                console.log(doc.data());
            })
            let meal = meals[0];
            if (!meal.used) {
                mealsRef.doc(meal.id).update({ used: true });
            }
            res.json({
                name: meal.name + " " + meal.lastname,
                meal: meal
            })
        } else {
            res.json({
                data: 'no meal'
            })
        }
    } else {
        const requestRef = db.collection('requests').doc(uid);
        const doc = await requestRef.get();
        if (doc.exists) {
            if (!doc.data().used)
                requestRef.update({ used: true });
            res.json({
                name: doc.data().name + " " + doc.data().lastname,
                meal: doc.data()
            })
        } else {
            res.json({
                data: 'no meal'
            })
        }
    }
})


require('./admin-routes.js')(app);
require('./users-routes')(app);
require('./daily-emails.js')(app);
require('./password-reset.js')(app);
require('./upload-image.js')(app);


var getUsers = () => {
    return users;
}
exports.getUsers = getUsers;

app.listen(4001, () => {
    console.log("Listening on 4001");
})