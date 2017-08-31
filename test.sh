#!/bin/bash
# ------------------------------------------------------------------
# Jason    ZKP Average
#          Start up 4 agents each with their own keys
# ------------------------------------------------------------------



nodemon index.js 3001 user &
echo $!
nodemon index.js 3002 jason &
echo $!
nodemon index.js 3003 ankur &
echo $!
nodemon index.js 3004 richard &
echo $!
