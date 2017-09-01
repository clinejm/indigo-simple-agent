### Introduction

TODO: paragraph that explains the ZKP of Average and why you would want to do such a thing.


### Getting Started

```
npm install
npm install -g nodemon
```

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
``

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

## Run multiple front-ends

First, modify agent-ui/config/environment.js with this change

```
-      AGENT_PORT: 3000,
+      AGENT_PORT: process.env.AGENT_PORT || 3000
```

then run from agent-ui directory:

```
AGENT_PORT=3001 ember serve --port 4201 --live-reload=false
AGENT_PORT=3002 ember serve --port 4202 --live-reload=false
AGENT_PORT=3003 ember serve --port 4203 --live-reload=false
AGENT_PORT=3004 ember serve --port 4204 --live-reload=false
```


## To Remove Old Maps:

```
# stop strat
rm -r tendermint # remove tendermint folder
strat run tm:init # remake tendermin
rm -r segments/* # remove contents of segments directory
strat up
```
