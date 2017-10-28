'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const TOKEN = 'lm4thewin'
const FBPAGETOKEN = "EAAB1CdftuT0BAPF5iwrwAFHWSa7pHamq1L45wBAIlWXDqDY20NTaEm9f645mZCQbw0IlnZAQpKXtjVIt7vuiQAz6EUhT2xFtKfx9mOVHR7IyeiTPjFr7RvcoMD1TcnG1fdCiPhr2nsGd4dm7UvXYEAv09JzvaFiRCL2LbQ7gZDZD"

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook', function (req, res) {
	if (req.query['hub.verify_token'] === 'lm4thewin' ){
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

app.post('/webhook', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		
	    if (event.message && event.message.text) {
			handleMessage(sender, event.message)
	    }else if (event.postback){
			handlePostback(sender, event.postback)
		}
    }
    res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

// Handles messages events
function handleMessage(sender_psid, received_message) {
	//let text = event.message.text
	//sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))

	let response;

	// Check if the message contains text
	if (received_message.text) {    
		// Create the payload for a basic text message
		response = {
			"text": 'You sent the message: "${received_message.text}"'
		}
	}else if (received_message.attachments) {
		// Gets the URL of the message attachment
		let attachment_url = received_message.attachments[0].payload.url;
		// do something w it
	} 
	
	// Sends the response message
	callSendAPI(sender_psid, response); 
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
	sendTextMessage(sender, "Received postback event: " + received_postback)

	let response;
	
	// Get the payload for the postback
	let payload = received_postback.payload;

	// do something with payload
}

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	callSendAPI(sender, messageData)
}

function callSendAPI(sender_psid, response) {
	// Construct the message body
	let request_body = {
	  "recipient": {
		"id": sender_psid
	  },
	  "message": response
	}

	sendPostReq(request_body)
  }

function setGetStartedPostback(getStartedPayloadText){
	// Construct the message body
	let request_body = {
		"getstarted": getStartedPayloadText
	}

	sendPostReq(request_body)
}

function sendPostReq(request_body){
	// Send the HTTP request to the Messenger Platform
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": FBPAGETOKEN },
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log('request/message sent by ' + sender_psid)
		} else {
			console.error("Unable to send message:" + err);
		}
	}); 
}

//helper layer