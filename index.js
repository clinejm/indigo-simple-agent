// This file creates an Express server and mounts the agent on it.
const PORT = process.argv[2] || 3000;

var crypto = require('crypto');
var express = require('express');
var Agent = require('stratumn-agent');
var plugins = Agent.plugins;

// Load actions.
// Assumes your actions are in ./lib/actions.
var actions = require('./lib/actions');

// Create an HTTP store client to save segments.
// Assumes an HTTP store server is available on env.STRATUMN_STORE_URL or http://store:5000.
var storeHttpClient = Agent.storeHttpClient(process.env.STRATUMN_STORE_URL || 'http://localhost:5000');
// Do not use a fossilizer.
var fossilizerHttpClient = null;

var agentUrl = process.env.STRATUMN_AGENT_URL || ('http://localhost:'+PORT);

// Create an agent from the actions, the store client, and the fossilizer client.
var agent = Agent.create(actions, storeHttpClient, fossilizerHttpClient, {
  // the agent needs to know its root URL
  agentUrl: agentUrl,
  // plugins you want to use
  plugins: [plugins.agentUrl(agentUrl), plugins.actionArgs, plugins.stateHash]
});

// Creates an HTTP server for the agent with CORS enabled.
var agentHttpServer = Agent.httpServer(agent, { cors: {} });

// Create the Express server.
var app = express();

app.disable('x-powered-by');

// Mount agent on the root path of the server.
app.use('/', agentHttpServer);

// Start the server.
app.listen(PORT, function() {
  console.log('Listening on :' + this.address().port);
});
