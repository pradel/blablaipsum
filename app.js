var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const lorem = require('./lorem');

var token = process.env.FACEBOOK_TOKEN;
var verifyToken = process.env.FACEBOOK_VERIFY;
var port = 3000;
var maxLength = 320;

function sendTextMessage(sender, text) {
  var messageData = {
    text: text
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  }, function(error, response) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === verifyToken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

var languages = [
  'latin',
  'chinese',
  'russian',
  'greek',
  'japanese',
];

app.post('/webhook', function (req, res) {
  var event = req.body.entry[0].messaging[0];
  var userId = event.sender.id;
  var rand = Math.floor(Math.random() * 5);
  var randLength = Math.floor((Math.random() * maxLength) + 10);
  var randPos = Math.floor(Math.random() * lorem[languages[rand]].length);
  if (randLength > lorem[languages[rand]].length - randPos) {
    randLength = lorem[languages[rand]].length - randPos;
  }
  var text = lorem[languages[rand]].substring(randPos, randLength);
  sendTextMessage(userId, text);
  res.sendStatus(200);
});

app.listen(process.env.PORT || port, function() {
  console.log('app listening on port %s', process.env.PORT || port);
});
