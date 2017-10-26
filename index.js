'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const TOKEN = "lm4thewin"
const FBPAGETOKEN = "EAAB1CdftuT0BACGieQUEl2B8UmRwNIZCqhqo607SKbgRAjYHQfrTdYee6QaotwKJ4V8RL7vi4DPGXOhu8ZBUZBMg97r4s6YL2A4oMtZBeFeRwRjZBypjzO4R8OCxybKR6NZBPxf0ZAEV1nJoqizxi2ZBJGQRF8RS05ufU43IcZCu2QAZDZD"

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

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})