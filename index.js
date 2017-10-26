'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const TOKEN = "lm4thewin"
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

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})