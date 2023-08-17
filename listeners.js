const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
var serviceAccount = require("./serviceAccountKey.json");

var CronJob = require('cron').CronJob;

const db = getFirestore();


var admins = [];
var prices = [];
var holidays = [];
var users = [];

listenForAdmins();
listenForPrices();
listenForHolidays();
listenForUsers();

function listenForUsers() {
    const query = db.collection('colaboradores');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                users.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = users.findIndex(x => x.id === change.doc.id);
                users.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = users.findIndex(x => x.uid === change.doc.id.toString());
                users.splice(index, 1);
                console.log('deleted:', change.doc.data())
            }
        })
    })
}

function listenForAdmins() {
    const query = db.collection('admins');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                admins.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = admins.findIndex(x => x.id === change.doc.id);
                admins.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = admins.findIndex(x => x.uid === change.doc.id.toString());
                admins.splice(index, 1);
                console.log('deleted:', change.doc.data())
            }
        })
    })
}


function listenForPrices() {
    const query = db.collection('prices');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                prices.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = prices.findIndex(x => x.type === change.doc.id);
                prices.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = prices.findIndex(x => x.id === change.doc.id);
                prices.splice(index, 1);
                console.log(change.doc.data())
            }
        })
    })
}


function listenForHolidays() {
    const query = db.collection('holidays');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                holidays.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = holidays.findIndex(x => x.type === change.doc.id);
                holidays.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = holidays.findIndex(x => x.id === change.doc.id);
                holidays.splice(index, 1);
                console.log(change.doc.data())
            }
        })
    })
}

exports.admins = admins;
exports.prices = prices;
exports.holidays = holidays;
exports.users = users;
