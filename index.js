'use strict';

// require('dotenv').config();
// const APIAI_TOKEN = '4e88d337261e4601b12f0c96538c43f1';
const {WebhookClient} = require('dialogflow-fulfillment');


const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log('a user connected');
});

const apiai = require('apiai')(APIAI_TOKEN);

// Web UI
app.get('/', (req, res) => {
  res.sendFile('index.html');


});

io.on('connection', function(socket) {
  socket.on('chat message', (text) => {
    console.log('Message: ' + text);

    // Get a reply from API.ai

    let apiaiReq = apiai.textRequest(text, {
      sessionId: '<UNIQE SESSION ID'
    });

    apiaiReq.on('response', (response) => {
      // let aiText = response.result.fulfillment.speech;
      // console.log('Bot reply: ' + aiText);
      // socket.emit('bot reply', aiText);

      // let order = response.result.parameters;
      // console.log(order);
      const agent = new WebhookClient({ req, response });
      console.log('Dialogflow Request headers: ' + JSON.stringify(requesreq.headers));
      console.log('Dialogflow Request body: ' + JSON.stringify(requesreq.body));
     
      function welcome(agent) {
        agent.add(`Welcome to my agent!`);
      }
     
      function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }
    
    function createBooking(agent) {
        let guests = agent.parameters.guests;
        let time = new Date(agent.parameters.time);
        let date = new Date(agent.parameters.date);
        let bookingDate = new Date(date);
        bookingDate.setHours(time.getHours());
        bookingDate.setMinutes(time.getMinutes());
        let now = new Date();
            
        if (guests < 1){
            agent.add('You need to reserve a table for at least one person. Please try again!');
        } else if (bookingDate < now){
            agent.add(`You can't make a reservation in the past. Please try again!`);
        } else if (bookingDate.getFullYear() > now.getFullYear()) {
            agent.add(`You can't make a reservation for ${bookingDate.getFullYear()} yet. Please choose a date in ${now.getFullYear()}.`);
        } else {
            let timezone = parseInt(agent.parameters.time.toString().slice(19,22));
            bookingDate.setHours(bookingDate.getHours() + timezone);
            agent.add(`You have successfully booked a table for ${guests} guests on ${bookingDate.toString().slice(0,21)}`);
            agent.add('See you at the restaurant!');
            agent.add('Have a wonderful day!');
        }
     }
     let intentMap = new Map();
     intentMap.set('Default Welcome Intent', welcome);
     intentMap.set('Default Fallback Intent', fallback);
     intentMap.set('restaurant.booking.create', createBooking);
     // intentMap.set('your intent name here', yourFunctionHandler);
     // intentMap.set('your intent name here', googleAssistantHandler);
     agent.handleRequest(intentMap);

      

  

    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();

  });
});
   