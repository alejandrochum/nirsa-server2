const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth, idToken } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
var serviceAccount = require("./serviceAccountKey.json");

var CronJob = require('cron').CronJob;

const db = getFirestore();

var users = [];
var admins = [];
var prices = [];
var companies = [];
var requests = [];
var holidays = [];

listenForCompanies();
listenForAdmins();
listenForUsers();
listenForPrices();
listenForRequests();
listenForHolidays();

function listenForHolidays() {
    const query = db.collection('holidays');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                holidays.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = holidays.findIndex(x => x.date === change.doc.data().date);
                holidays.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = holidays.findIndex(x => x.date === change.doc.data().date);
                holidays.splice(index, 1);
                console.log('removed: ', change.doc.data(), 'index', index)
            }
        })
    })
}

function listenForCompanies() {
    const query = db.collection('companies');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                companies.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = companies.findIndex(x => x.name === change.doc.data().name);
                companies.splice(index, 1);
                console.log(change.doc.data())
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

function listenForUsers() {
    const query = db.collection('colaboradores').orderBy('lastname');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                users.push(change.doc.data());
                console.log('addded', change.doc.data())
            }
            if (change.type === 'modified') {
                const index = users.findIndex(x => x.id === change.doc.id);
                users.splice(index, 1, change.doc.data());
                console.log('edited', change.doc.data())
            }
            if (change.type === 'removed') {
                const index = users.findIndex(x => x.id === change.doc.id);
                users.splice(index, 1);
                console.log('removed', change.doc.data())
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

function listenForRequests() {
    const query = db.collection('requests');
    const observer = query.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                requests.push(change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'modified') {
                const index = requests.findIndex(x => x.id === change.doc.id);
                requests.splice(index, 1, change.doc.data());
                console.log(change.doc.data())
            }
            if (change.type === 'removed') {
                const index = requests.findIndex(x => x.id === change.doc.id);
                requests.splice(index, 1);
                console.log(change.doc.data())
            }
        })
    })
}

exports.companies = companies;
exports.admins = admins;
exports.users = users;
exports.prices = prices;
exports.requests = requests;
exports.holidays = holidays;