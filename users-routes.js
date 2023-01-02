const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
const { DateTime } = require('luxon');
const express = require('express');
const { json } = require('body-parser');
const router = express.Router();
const db = getFirestore();

module.exports = function (app) {

    const listeners = require('./listeners.js');

    let users = listeners.users;
    let prices = listeners.prices;
    let requests = listeners.requests;
    let holidays = listeners.holidays;

    let period = () => {
        var today = DateTime.now().setZone("America/Guayaquil");
        var period = {
            start: '',
            end: ''
        };

        if (today.day <= 20) {
            period.start = today.minus({ months: 1 }).year + "-" + today.minus({ months: 1 }).toFormat('LL') + "-20";
            period.end = today.year + "-" + today.toFormat('LL') + "-21";

        } else {
            period.start = today.year + "-" + today.toFormat('LL') + "-20";
            period.end = today.plus({ months: 1 }).year + "-" + today.plus({ months: 1 }).toFormat('LL') + "-21";
        }
        return period;
    }

    // Validate User
    app.use('/users', router);
    router.use(function (req, res, next) {
        getAuth().verifyIdToken(req.body.token).then((decodedToken) => {
            res.locals.uid = decodedToken.uid;
            next();
        }).catch((error) => {
            res.send(error)
        })
    });

    router.post('/info', (req, res) => {
        let uid = res.locals.uid;
        users.forEach(user => {
            if (user.id === uid) {
                res.send(user);
            }
        })
    })

    // PRICES

    router.post('/prices', (req, res) => {
        res.send({
            prices: prices,
            status: 'success'
        })
    })

    // MEALS

    router.post('/mainmeals', async (req, res) => {
        let meals = [];
        let periodStart = new Date(period().start);
        let periodEnd = new Date(period().end);
        const mealsRef = db.collection('meals');
        const snapshot = await mealsRef.where('user', '==', res.locals.uid).where('date', '>', Timestamp.fromDate(periodStart)).where('date', '<', Timestamp.fromDate(periodEnd)).orderBy('date').get();

        snapshot.forEach(doc => {
            meals.push(doc.data());
        })
        res.send({
            status: 'success',
            data: meals
        })
    })

    router.post('/meals', async (req, res) => {
        let meals = [];
        let periodStart = DateTime.local().setZone("America/Guayaquil").startOf('day');
        let periodEnd = periodStart.plus({ days: 14 });
        const mealsRef = db.collection('meals');
        const snapshot = await mealsRef.where('user', '==', res.locals.uid).where('date', '>=', Timestamp.fromDate(periodStart.toJSDate())).where('date', '<', Timestamp.fromDate(periodEnd.toJSDate())).orderBy('date').get();

        snapshot.forEach(doc => {
            meals.push(doc.data());
        })
        res.send({
            status: 'success',
            data: meals
        })
    })

    router.post('/reactivatemeal', async (req, res) => {
        console.log(req.body.id);
        const mealsRef = db.collection('meals').doc(req.body.id);
        mealsRef.update({ cancelled: false }).then(() => { res.send('success') }).catch(error => { res.send(error) });
    });

    router.post('/editmeal', (req, res) => {
        const mealsRef = db.collection('meals').doc(req.body.id);
        mealsRef.update({ type: req.body.type }).then(() => { res.send('success') }).catch(error => { res.send(error) });
    });

    router.post('/cancelmeal', (req, res) => {
        const mealRef = db.collection('meals').doc(req.body.id);
        mealRef.update({ cancelled: true }).then(() => { res.send('success') }).catch(error => { res.send(error) });
    })

    // SOLICITUDES
    router.post('/requests', async (req, res) => {
        let meals = [];
        const mealsRef = db.collection('requests');
        const snapshot = await mealsRef.where('user', '==', res.locals.uid).get();
        snapshot.forEach(doc => {
            meals.push(doc.data());
        })
        res.send({
            status: 'success',
            data: meals
        })
    })

    router.post('/holidays', (req, res) => {
        res.send({
            status: 'success',
            data: holidays
        });
    })

    // REPORTES
    router.post('/userreport', async (req, res) => {
        let uid = res.locals.uid;
        let sdate = new Date(req.body.startdate);
        let edate = new Date(req.body.enddate);
        console.log(sdate, edate);

        const mealsRef = db.collection('meals');
        let snapshot = await mealsRef.where('user', '==', uid).where('date', '>=', sdate).where('date', '<=', edate).get();

        res.send(snapshot.docs.map(doc => doc.data()));
    })

}