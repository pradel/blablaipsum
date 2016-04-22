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

function randomIpsum(str, minLength, maxLength)
{
  minLength = minLength || 1;
  maxLength = maxLength || 140;
  var randomPos = getRandomInt( 0 , str.length );
  var randomLength = getRandomInt( minLength , maxLength );
  return str.substr(randomPos, randomLength);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  var random = getRandomInt(0, 5);
  var text = randomIpsum(lorem[languages[random]], 10, maxLength);
  sendTextMessage(userId, text);
  res.sendStatus(200);
});

app.listen(process.env.PORT || port, function() {
  console.log('app listening on port %s', process.env.PORT || port);
});
