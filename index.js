'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const TOKEN = 'lm4thewin'
const FBPAGETOKEN = "EAAKkgOg8ec4BAAt4h7p0lynlwlDxVlSVH6z6SgdgbhzRZBWABjVY2VgerB91qEZAAZBoXSZA1tjcDW1AfUZCLrBkLEdSlZBjSFJsSZBPsHzzThECBCInZBcj4y74Ur4tPeNO6Q8HE27gVLqZARsk8nqR6SJSjbHue2xIKgZA2rZCOHCsQZDZD"
//"EAAB1CdftuT0BAPF5iwrwAFHWSa7pHamq1L45wBAIlWXDqDY20NTaEm9f645mZCQbw0IlnZAQpKXtjVIt7vuiQAz6EUhT2xFtKfx9mOVHR7IyeiTPjFr7RvcoMD1TcnG1fdCiPhr2nsGd4dm7UvXYEAv09JzvaFiRCL2LbQ7gZDZD"

const GETSTARTEDPOSTBACK = "getstarted"
const QUICKREPLYSUFFIX = "quickreply"
const INEEDHELP = "I need help"
const IWANTTOHELP = "I want to help"

const minConfidence = 0.8

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
	console.log("received webhook req: " + req + ", body: "+req.body + ", entry[0]:" + req.body.entry[0] + ", messaging: "+req.body.entry[0].messaging)
    try{
		for (let i = 0; i < messaging_events.length; i++) {
			let event = req.body.entry[0].messaging[i]
			let sender = event.sender.id
			
			if (event.message && event.message.text) {
				handleMessage(sender, event.message)
			}else if (event.postback){
				handlePostback(sender, event.postback)
			}
		}
	}catch(e){
		console.log("webhook error: " + e)
	}
    res.sendStatus(200)
})

// do some initial bot setup
setGetStartedPostback();
setPersistenceMenu();

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

// Handles messages events
function handleMessage(sender_psid, received_message) {
	let message = received_message.text
	console.log("in handleMessage: "+message)
	var helpEntity = firstEntity(received_message.nlp, "helpIntent")
	var wantEntity = firstEntity(received_message.nlp, "wantIntent")
	var needDescEntity = firstEntity(received_message.nlp, "needDescription")
	var text = ""
	
	if(helpEntity && helpEntity.confidence > minConfidence){
		text = "What does your community need? Were you just hit by a disaster? Take some time to describe your situation and your needs in a single message"
		sendTextMessage(sender_psid, text)
	}else if(wantEntity && wantEntity.confidence > minConfidence){
		text = "What can you provide? Take some time to describe your organization's profile and what type of relief you can offer in a single message"
		sendTextMessage(sender_psid, text)
	}else if(needDescEntity && needDescEntity.confidence > minConfidence){
		text = "Sending your need out to NGOs around the world!\n"
		try{
			var quantities, types = extractNeedQuantity(needDescEntity)
			for (var c = 0;c < quantities.length && c < types.length && types.length == quantities.length;c++){
				text = text + "Need: " + quantities[c] + " " + types[c] + ", "
			}
			sendQuickReply(sender_psid, text, [
				createQuickReplyOption("Send"),
				createQuickReplyOption("Edit")
			])
		}catch(e){
			console.log("extractNeedQuantity error: " + e)
			sendTextMessage(sender_psid, "Sorry, I didn't quite understand that. Please try again")
		}
	}
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
	console.log("Received postback w payload:" + received_postback.payload+" from: " + sender_psid)

	let response;
	
	// Get the payload for the postback
	let payload = received_postback.payload;

	if(payload == GETSTARTEDPOSTBACK){
		let welcomeMessage = "Welcome to LifeMesh!"
		sendQuickReply(sender_psid, welcomeMessage, [
			createQuickReplyOption(INEEDHELP),
			createQuickReplyOption(IWANTTOHELP)
		])
	}
}

function extractNeedQuantity(needDescriptionEntity){
	var quantities = []
	var types = []

	if(needDescriptionEntity && needDescriptionEntity.confidence > minConfidence){
		for (var quantity in needDescriptionEntity.entities['needQuantity']){
			quantities.push(quantity.value)
			console.log("found new quantity: " + quantity.value)
		}
		for (var type in needDescriptionEntity.entities['needType']){
			types.push(type.value)
			console.log("found new type: " + type.value)
		}
	}
	
	return (quantities, types)
}

function firstEntity(nlp, name) {
	return nlp && nlp.entities && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

function sendTextMessage(sender_psid, text) {
	let messageData = { text:text }
	callSendAPI(sender_psid, messageData)
}
function sendQuickReply(sender_psid, text, quickreplies){
	let response = {
		"text": text,
		"quick_replies": quickreplies
	}
	callSendAPI(sender_psid, response)
}
function createQuickReplyOption(buttonTxt){
	return {
		"content_type":"text",
		"title":buttonTxt,
		"payload":constructQuickReplyOptionPayload(buttonTxt)
	}
}
function constructQuickReplyOptionPayload(quickreplytext){
	return quickreplytext + QUICKREPLYSUFFIX
}

function callSendAPI(sender_psid, response) {
	// Construct the message body
	let request_body = {
	  "recipient": {
		"id": sender_psid
	  },
	  "message": response
	}

	sendPostReq(request_body, sender_psid)
  }

function setPersistenceMenu(){}

function setGetStartedPostback(){
	// Construct the message body
	let request_body = {
		"getstarted": GETSTARTEDPOSTBACK
	}

	// Send the HTTP request to the Messenger Platform
	// Set GetStarted postback payload
	request({
		/*"uri": "https://graph.facebook.com/v2.6/me/messenger_profile",
		"qs": { "access_token": FBPAGETOKEN },
		"method": "POST",
		"json": request_body*/
		method: 'POST',
		uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
		qs: {
		  access_token: FBPAGETOKEN
		},
		json: {
		  setting_type: 'call_to_actions',
		  thread_state: 'new_thread',
		  call_to_actions: [{
					"payload": GETSTARTEDPOSTBACK
			}]
		}
	}, (err, res, body) => {
		if (!err) {
			console.log('GetStarted sent')
		} else {
			console.error("Unable to send message:" + err);
		}
	}); 
}

function sendPostReq(request_body, sender_psid){
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