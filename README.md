## To Remove Old Maps:

```
# stop strat
rm -r tendermint # remove tendermint folder
strat run tm:init # remake tendermin
rm -r segments/* # remove contents of segments directory
strat up
```

## Run Multiple Agents

FIrst put config files in config dir

```
nodemon index.js 3001 user
nodemon index.js 3002 ankur
nodemon index.js 3003 jason
nodemon index.js 3004 richard
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