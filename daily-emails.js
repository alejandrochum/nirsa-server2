const { getFirestore, Timestamp, FieldValue, collection, onSnapshot } = require('firebase-admin/firestore');
const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend");
const express = require('express');
const { json } = require('body-parser');
const { DateTime } = require('luxon');

const mailersend = new MailerSend({
    api_key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYTZiNTY0MzNmZWUxYjRjY2FkMGVkNGM1YTliYWRjOGJlYTBkN2NjNjM0NmZlMWQ0MDg4NjYxZTE3YmM0Njk1Mjg4MDE3YWZhMDgyYmM2OTkiLCJpYXQiOjE2NjE4NTI0MTkuMDg0ODQ5LCJuYmYiOjE2NjE4NTI0MTkuMDg0ODUyLCJleHAiOjQ4MTc1MjYwMTkuMDgxMzQsInN1YiI6IjM2NDYzIiwic2NvcGVzIjpbImVtYWlsX2Z1bGwiLCJkb21haW5zX2Z1bGwiLCJhY3Rpdml0eV9mdWxsIiwiYW5hbHl0aWNzX2Z1bGwiLCJ0b2tlbnNfZnVsbCIsIndlYmhvb2tzX2Z1bGwiLCJ0ZW1wbGF0ZXNfZnVsbCIsInN1cHByZXNzaW9uc19mdWxsIiwic21zX2Z1bGwiLCJlbWFpbF92ZXJpZmljYXRpb25fZnVsbCJdfQ.CtGb0UjSjpsPN5KHQrCMlVthhsigIisEKAoFDF1sqRh2LMKs64lfFpuc4uAYCg3xcm47JlRH1bPvs4OiM2DyVgnnSLBllheg8z6vyB8A2gc8Pao0_6tUD3_JG4LYq9BKZfBqs1hGjzk1u58gj9C47w1TTW7fSh20ML9rotd9RZziGTqo7-PUDYMsUOcgwdlNmqJhDjDv5oWpG2V9xdIx7aaijYd7DXgkuR0NEKk0aCq5yqA-y9npdsO3bZuciI5MCh3ooEsf8T2PCY_Hk7lFzWCvUr_rBIFN0R81MHUZCohrpP_8V3gYshk3CIXu9xTK1-5-YvY722nJwnXLuF9bsZCyHaAhxDtEv-eACAE-zMDbW-n_J2rfT0MDQvb202fikXnaNCtlvwsIb7zg_hIvzO7hceniSc-tJgX4Y2Hm9jNysFnXDwU0LHMQ6QAZfhB9_kIEkRLitgQtpO_QkFpDS9kUjhpW-XSbigLPhq44ErNEHkTrF6bQXBbrke60sVkieAfsFsNqKP7g8KoZR1wEIHqiV5q8erUarpYP1MZ7DAlJlXFs8dgB9vbvbmGRjkWyAVMqYcxeMsiLNxAG-rE5XpMRKDmPJHOfg7wmh7QMXKzaeX3tWjuGsjjoUkTl-M7ht9bTnoPgbNl3ScBnd-1qqKxD5aBDmEhXhllEkKxzT1k'
});

module.exports = function (app) {

    const listeners = require('./listeners.js');

    let users = listeners.users;
    let meals = listeners.meals;

    async function sleep(millis) {
        return new Promise(resolve => setTimeout(resolve, millis));
    }

    app.get('/emails', async (req, res) => {
        let today = DateTime.local().setZone("America/Guayaquil").startOf('day').toJSDate();
        let todayMeals = [];
        let mealsRef = db.collection('meals');
        let snapshot = await mealsRef.where('date', '==', Timestamp.fromDate(today)).get();
        snapshot.forEach(doc => {
            todayMeals.push(doc.data());
        })
        // let today = new Date().toLocaleDateString('es-EC', {timeZone: 'America/Guayaquil'});
        // let todayMeals = meals.filter(meal => meal.date.toDate().toLocaleDateString('es-EC', {timeZone: 'America/Guayaquil'}) === today);
        let dietMeals = todayMeals.filter(meal => meal.type == 'Dieta');
        let regularMeals = todayMeals.filter(meal => meal.type == 'Regular');

        sendEmails(dietMeals, regularMeals);
    })

    async function sendEmails (dietMeals, regularMeals) {
        for (let index = 0; index < dietMeals.length; index++) {
            const user = dietMeals[index];

            const recipients = [
                new Recipient(user.email, user.name + ' ' + user.lastname)
            ];

            const emailParams = new EmailParams()
                .setFrom("info@delinirsa.com")
                .setFromName("Deli Nirsa")
                .setRecipients(recipients)
                .setReplyTo("info@delinirsa.com")
                .setReplyToName("Deli Nirsa")
                .setSubject("¡Hoy tienes registrado un almuerzo! Deli NIRSA")
                .setHtml(`
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <title>NIRSA</title>
                    <style type="text/css">
                        /* ----- Custom Font Import ----- */
                        @import url(https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic&subset=latin,latin-ext);
            
                        /* ----- Text Styles ----- */
                        table{
                            font-family: 'Lato', Arial, sans-serif;
                            -webkit-font-smoothing: antialiased;
                            -moz-font-smoothing: antialiased;
                            font-smoothing: antialiased;
                        }
            
                        
                    </style>
            
                
                </head>
            
                <body style="padding: 0; margin: 0;" bgcolor="#eeeeee">
                    <span style="color:transparent !important; overflow:hidden !important; display:none !important; line-height:0px !important; height:0 !important; opacity:0 !important; visibility:hidden !important; width:0 !important; mso-hide:all;"></span>
            
                    <!-- / Full width container -->
                    <table class="full-width-container" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" bgcolor="#eeeeee" style="width: 100%; height: 100%; padding: 30px 0 30px 0;">
                        <tr>
                            <td align="center" valign="top">
                                <!-- / 700px container -->
                                <table class="container" border="0" cellpadding="0" cellspacing="0" width="700" bgcolor="#ffffff" style="width: 700px;">
                                    <tr>
                                        <td align="center" valign="top">
                                            
                                            
                                            <!-- / Projects list -->
                                            <table class="container projects-list" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding-top: 0px;">
                                                <tr>
                                                    <td>
                                                        <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td align="left">
                                                                    <a href="#"><img src="https://admin.delinirsa.com/mails/img/header01.png" width="100%" height="auto" border="0" style="display: block;"></a>
                                                                </td>
            
                                                                
                                                            </tr>
            
                                                            
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!-- /// Projects list -->
                                            
            
                                            
                                            
                                            
            
                                            <!-- / Title -->
                                            <table class="container title-block" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" valign="top">
                                                        <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" style="width: 620px;">
                                                            <tr>
                                                                <td style="padding: 35px 0 15px 0; font-size: 26px;" align="center">¡Hola `+ user.name + `!</td>
                                                                
                                                            </tr>
                                                            
                                                            
            
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!-- /// Title -->
                                            
                                        
            
                                            
            
                                            
            
                                        
                                            
            
                                            <!-- / CTA Block -->
                                            <table class="container cta-block" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" valign="top">
                                                        
                                                        
                                                        
                                                        <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" style="width: 620px;">
                                                           
                                                            
            
                                                            <tr>
                                                                <td class="cta-block__content" style="padding: 20px 0 27px 0; font-size: 16px; line-height: 27px; color: #969696; text-align: center;">
                                                                    
            Hoy tienes solicitado:<br>
            <span style="color: #55A985; "><div class="boton-pro" style="padding: 3%; font-size: 28px; border-radius: 100px; color: #55A985; background-color: #fff; width: 46%; margin-left: 25%;">Almuerzo `+ user.type + `</div></span>                                                              
                                                                </td>
                                                            </tr>
                                                            
                                                            <tr>
                                                                <td class="cta-block__content" style="padding: 0px 0 27px 0; font-size: 16px; line-height: 27px; color: #000; text-align: center;">
                                                                    
            Puedes cancelar tu pedido hasta las 10h00<br>
            ingresando a DELI NIRSA<br>
            
                                                                    
                                                                    
                                                                
                                                                </td>
                                                            </tr>
                                                            
                                                          
                                                            <tr>
                                                                <td class="cta-block__content" style="padding: 0px 0 50px 0; font-size: 22px; line-height: 17px; text-align: center;">
                                                                
                                                                <span style="color: #000;"><a href="https://delinirsa.com" style="text-decoration: none;"><div class="boton-pro" style="padding: 3%; border-radius: 100px; color: #fff; background-color: #55A581;  width: 46%; margin-left: 25%; text-decoration: none;">www.delinirsa.com</div></a> </span><br>
                                                                
                                                                </td>
                                                            </tr>
                                                            
                                                        </table>
                                                        
                                                    </td>
                                                </tr>
                                            </table>
                                            <!-- /// CTA Block -->
            
                                            
                                            
                                        
                                            
                                            
                                            
                                        
                                            
                                        
                                            
                                        
                                        <!-- / Footer 
                                            <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="background-color: #001a33;">
                                                <tr>
                                                    <td align="center">
                                                        <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" align="center" style="border-top: 1px solid #eeeeee; width: 620px;">
                                                            <tr>
                                                                <td style="text-align: center; padding: 50px 0 1px 0;">
                                                                    <a href="www.linkparaingresoalsistema.com" style="font-size: 18px; letter-spacing: 2px; text-decoration: none; color: #d5d5d5;">www.linkparaingresoalsistema.com<br><br><br></a>
                                                                </td>
                                                            </tr>
            
                                                            <tr>
                                                                <td align="middle">
                                                                    <table width="60" height="2" border="0" cellpadding="0" cellspacing="0" style="width: 60px; height: 2px;">
                                                                        
                                                                    </table>
                                                                </td>
                                                            </tr>
            
                                                            
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            -->
                                            
                                            
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>`)

            mailersend.send(emailParams).then((response) => {
                console.log(response.status, user.email, user.type);
            });
            await sleep(1200);
        }

        console.log('Diet Daily Sent')

        for (let index = 0; index < regularMeals.length; index++) {
            const user = regularMeals[index];

            const recipients = [
                new Recipient(user.email, user.name + ' ' + user.lastname)
            ];

            const emailParams = new EmailParams()
                .setFrom("info@delinirsa.com")
                .setFromName("Deli Nirsa")
                .setRecipients(recipients)
                .setReplyTo("info@delinirsa.com")
                .setReplyToName("Deli Nirsa")
                .setSubject("Anuncio Diario Deli Nirsa")
                .setHtml(`
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <title>NIRSA</title>
                    <style type="text/css">
                        /* ----- Custom Font Import ----- */
                        @import url(https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic&subset=latin,latin-ext);
            
                        /* ----- Text Styles ----- */
                        table{
                            font-family: 'Lato', Arial, sans-serif;
                            -webkit-font-smoothing: antialiased;
                            -moz-font-smoothing: antialiased;
                            font-smoothing: antialiased;
                        }
            
                        
                    </style>
            
                
                </head>
            
                <body style="padding: 0; margin: 0;" bgcolor="#eeeeee">
                    <span style="color:transparent !important; overflow:hidden !important; display:none !important; line-height:0px !important; height:0 !important; opacity:0 !important; visibility:hidden !important; width:0 !important; mso-hide:all;"></span>
            
                    <!-- / Full width container -->
                    <table class="full-width-container" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" bgcolor="#eeeeee" style="width: 100%; height: 100%; padding: 30px 0 30px 0;">
                        <tr>
                            <td align="center" valign="top">
                                <!-- / 700px container -->
                                <table class="container" border="0" cellpadding="0" cellspacing="0" width="700" bgcolor="#ffffff" style="width: 700px;">
                                    <tr>
                                        <td align="center" valign="top">
                                            
                                            
                                            <!-- / Projects list -->
                                            <table class="container projects-list" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding-top: 0px;">
                                                <tr>
                                                    <td>
                                                        <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td align="left">
                                                                    <a href="#"><img src="https://admin.delinirsa.com/mails/img/header01.png" width="100%" height="auto" border="0" style="display: block;"></a>
                                                                </td>
            
                                                                
                                                            </tr>
            
                                                            
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!-- /// Projects list -->
                                            
            
                                            
                                            
                                            
            
                                            <!-- / Title -->
                                            <table class="container title-block" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" valign="top">
                                                        <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" style="width: 620px;">
                                                            <tr>
                                                                <td style="padding: 35px 0 15px 0; font-size: 26px;" align="center">¡Hola `+ user.name + `!</td>
                                                                
                                                            </tr>
                                                            
                                                            
            
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!-- /// Title -->
                                            
                                        
            
                                            
            
                                            
            
                                        
                                            
            
                                            <!-- / CTA Block -->
                                            <table class="container cta-block" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" valign="top">
                                                        
                                                        
                                                        
                                                        <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" style="width: 620px;">
                                                           
                                                            
            
                                                            <tr>
                                                                <td class="cta-block__content" style="padding: 20px 0 27px 0; font-size: 16px; line-height: 27px; color: #969696; text-align: center;">
                                                                    
            Hoy tienes solicitado:<br>
            <span style="color: #55A985; "><div class="boton-pro" style="padding: 3%; font-size: 28px; border-radius: 100px; color: #55A985; background-color: #fff; width: 46%; margin-left: 25%;">Almuerzo `+ user.type + `</div></span>                                                              
                                                                </td>
                                                            </tr>
                                                            
                                                            <tr>
                                                                <td class="cta-block__content" style="padding: 0px 0 27px 0; font-size: 16px; line-height: 27px; color: #000; text-align: center;">
                                                                    
            Puedes cancelar tu pedido hasta las 10h00<br>
            ingresando a DELI NIRSA<br>
            
                                                                    
                                                                    
                                                                
                                                                </td>
                                                            </tr>
                                                            
                                                          
                                                            <tr>
                                                                <td class="cta-block__content" style="padding: 0px 0 50px 0; font-size: 22px; line-height: 17px; text-align: center;">
                                                                
                                                                <span style="color: #000;"><a href="https://delinirsa.com" style="text-decoration: none;"><div class="boton-pro" style="padding: 3%; border-radius: 100px; color: #fff; background-color: #55A581;  width: 46%; margin-left: 25%; text-decoration: none;">www.delinirsa.com</div></a> </span><br>
                                                                
                                                                </td>
                                                            </tr>
                                                            
                                                        </table>
                                                        
                                                    </td>
                                                </tr>
                                            </table>
                                            <!-- /// CTA Block -->
            
                                            
                                            
                                        
                                            
                                            
                                            
                                        
                                            
                                        
                                            
                                        
                                        <!-- / Footer 
                                            <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="background-color: #001a33;">
                                                <tr>
                                                    <td align="center">
                                                        <table class="container" border="0" cellpadding="0" cellspacing="0" width="620" align="center" style="border-top: 1px solid #eeeeee; width: 620px;">
                                                            <tr>
                                                                <td style="text-align: center; padding: 50px 0 1px 0;">
                                                                    <a href="www.linkparaingresoalsistema.com" style="font-size: 18px; letter-spacing: 2px; text-decoration: none; color: #d5d5d5;">www.linkparaingresoalsistema.com<br><br><br></a>
                                                                </td>
                                                            </tr>
            
                                                            <tr>
                                                                <td align="middle">
                                                                    <table width="60" height="2" border="0" cellpadding="0" cellspacing="0" style="width: 60px; height: 2px;">
                                                                        
                                                                    </table>
                                                                </td>
                                                            </tr>
            
                                                            
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            -->
                                            
                                            
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>`)

            mailersend.send(emailParams).then((response) => {
                console.log(response.status, user.email, user.type);
            });
            await sleep(1200);
        }
    }
}