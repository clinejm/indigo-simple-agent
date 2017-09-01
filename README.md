### Introduction

Welcome to ZKP Average, our toy application demonstrating a zero knowledge process on Indigo. This protocol provides a way for a Seller (Alice) to gain honest valuations from N friends who have opinions about how much a specific item is worth.
The protocols assumes everyone gives their honest valuation, and provides a way for everyone to know the average of their valuations, without anyone learning anybody else's valuation
As we are primarily modifying the agent code, this repo is based on 'stratumn/agent-js'. However, we assume familiarity with [indigo framework](http://indigoframework.com), and can optionally be run with a front-end using `stratumn/agent-ui`.

### Getting Started

```
npm install
npm install -g nodemon
```

## Configure Store

Each agent needs to connect to the same store for this example to work.

If you have already completed the [todo list tutorial](https://indigoframework.com/documentation/v0.0.8-dev/tutorials/part1.html) then you should already have a store running. However you will need to expose the port in your [docker config](https://github.com/stratumn/todo-tutorials/blob/part1/docker-compose.dev.yml#L29) file.

`docker-compose.dev.yml`:

change:
```
store:
  env_file:
  - ./config/dev.env
  - ./config/dev.secret.env
```

to add the port:

```
store:
  env_file:
  - ./config/dev.env
  - ./config/dev.secret.env
  ports:
  - "5000:5000"
```

the agent will default to `http://localhost:5000` if this is not where you are running your store
you can provide an environment variable that had the http address of the store:
`STRATUMN_STORE_URL='http://localhost:5000'`


#### Start Agent

Now you can start the agent. `PORT` and  `CONFIG` are both optional.

```
nodemon index.js <PORT> <CONFIG>
```

`CONFIG` is the name of a config file in the config director that will be used

If you want to create your own user config the file needs to look like this:

`./config/<name>.js`

```
module.exports = {
  rsa_key: {
    e: "10001",
    n: "87c5372e65d5437f25199c2996ce59c7cd3912a4936b1b1ab16284a320b6ee7ce9cc9d51ae2173d14e7cf5c81f1263df4739f98ccc3443f28f80c689ce635429",
    d: '4fe7ef291c7fde80b72a12719bb308be01f784145e3adc31e29253f3da2e2fbf72c5340c58c760c651492440510f0e0696af4ac530a39f0c615da6b412ba321d'
  },
```

TODO: instructions to generate new keys

TOOD: we need provide more options for the location of the keys.


## Run Test with Multiple Agents

We have provided a shell script that will start 4 agents each with their
own keys.

```
test.sh
```

You can start the agents on your own, but make sure you have one agent running for each profile:

```
nodemon index.js 3001 user &
nodemon index.js 3002 jason &
nodemon index.js 3003 ankur &
nodemon index.js 3004 richard &
```
Note: nodemon is only needed if you are modifying the agent code.


## Run the test

Now that you have 4 agents running you can run the integration test script.

If you are using a different set of ports or user keys then you will need to modify the test file.

```
node integration/index.js
```

TODO: make the tests configurable.

if everything runs correctly you will see an output like this:
```
map created 4248ef05-11f5-42c8-a0d0-fc974122586e
segment created eeea64eccbaae337a9d2a80f3e2f1de782a6549e52c9a0a0d35159378cb7384f
Action evaluate segment hash eeea64eccbaae337a9d2a80f3e2f1de782a6549e52c9a0a0d35159378cb7384f
Action evaluate segment hash bdcbc8ed9560a9115ecb9c14961dea20675a3a8e6f64b57f598adc6aa1bf6e8e
Action evaluate segment hash 9b58cc0b862883e1ed640deb853feb8f295b73a1b966b3b9ced28d6c520b520c
Action unblind segment hash 033a3b21c001dbbcff363b892a283666e272fb1f3fcc579bd4f2d196d758f20a
Action unblind segment hash 7a98041b2fce996ec9f528bf66ec73b26fcc5b7d73b350d8c87515b63c947a17
Action unblind segment hash 547da5e732036b59f60ea110a1d1da5e7dbe9c956633b953fc057f12c8bb4d86
Action finalize segment hash b453767dfb1611d63cb5a9d83fda6911040818a292c347ffbaac3d798080172c
Final outcome 14d186e69135cc01f05332ca66132c57fe4d40ab15640c65196c3eaa8c42d4fd 20
```


### Verify outcome with agent-ui

If you still have your agent-ui running from the todo-tutorial then you can view the segments generated. http://localhost:4000/

Note: Although you will be able to view the segments you will not be able to participate in the process from this agent UI as it is configured to talk to the todo agent.



## Connnect Agent-UI to these agents

If you would like to add segments via agent UI you will need to setup and run your own copy.

clone the repo from https://github.com/stratumn/agent-ui and follow the setup instructions.

then modify agent-ui/config/environment.js with this change

```
-      AGENT_PORT: 3000,
+      AGENT_PORT: process.env.AGENT_PORT || 3000
```

then run as many agent-uis as you want:

```
AGENT_PORT=3001 ember serve --port 4201 --live-reload=false
AGENT_PORT=3002 ember serve --port 4202 --live-reload=false
AGENT_PORT=3003 ember serve --port 4203 --live-reload=false
AGENT_PORT=3004 ember serve --port 4204 --live-reload=false
```


## To Remove Old Maps:
If you need to cleanup your store this is a quick shortcut:

```
# stop strat
rm -r tendermint # remove tendermint folder
strat run tm:init # remake tendermin
rm -r segments/* # remove contents of segments directory
strat up
```
