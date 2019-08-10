const express = require('express')
const path = require('path')
const pty = require('node-pty')

// Configuration
const port = 3000
const shell = 'zsh'

const app = express()
const terminal = pty.spawn(shell, [], {
	name: 'xterm-color',
	cols: 80,
	rows: 24,
	cwd: process.env.HOME,
	env: process.env
})

app.get('/', function (_, res) {
	res.sendFile(path.join(__dirname, '/index.html'))
})

require('express-ws')(app)
app.ws('/terminal', function (ws, _) {
	// Server -> Client
	terminal.on('data', function (data) {
		try {
			ws.send(data)
		} catch (error) {
			// WS is not open.
		}
	})
	// Client -> Server
	ws.on('message', function (message) {
		terminal.write(message)
	})
})

app.listen(port, function () {
	console.log(`Terminal started listening on port ${port}...`)
})
