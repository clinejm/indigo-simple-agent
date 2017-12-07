var ClientAgent = require('stratumn-agent-client');

var evaluatorKeys = [
  { //Ankur
    e: "10001",
    n: '66648706041030b2d58f8560a10e129e1ff5f11e67d481afe58748ecf2c31b68419155a5a2fcc17669b8b941b729f0fb8fa7dbc76c76a9b2d43c93c78526da03'
  },
  { // jason
   e: "10001",
   n: 'f57b01fa285fb1a649d720a6ed749668b9985e4d0036a3a197632fbb2259e09eb4f660a4032510d5a021235373fc5240e361d8519e718b8a6b3cc9e62d10ff43'
  },
  { //Richard
   e: "10001",
   n: '64ff48b4c795f83510bb5e84097ba81352c80436fb61752af0f497762175fcd8cd94972c633874e392b9c34dcb2982f0ed1b2c32a40570f97b75a2689bd19c7d'
  }
];


var requestorKey =
  {
    e: "10001",
    n: "87c5372e65d5437f25199c2996ce59c7cd3912a4936b1b1ab16284a320b6ee7ce9cc9d51ae2173d14e7cf5c81f1263df4739f98ccc3443f28f80c689ce635429"
  };



var temp = [];
evaluatorKeys.forEach(function(evaluator){
  temp.push(evaluator.e + "." + evaluator.n);
});
var evaluatorString = temp.join(",");



var  requestorP = ClientAgent.getAgent('http://localhost:3001');
var  jasonP = ClientAgent.getAgent('http://localhost:3002');
var  ankurP = ClientAgent.getAgent('http://localhost:3003');
var  richardP = ClientAgent.getAgent('http://localhost:3004');




// var test = {
//
//   steps: [
//
//     {
//       agent: 'ankur',
//       method: "evaluate",
//       args: "20"
//     }
//
//   ]
//
//
// };


var agentAction = (agent, action, actionArgs)=> {
  return (segment) => {
    console.log("Action", action, "segment hash", segment.meta.linkHash);
    return agent.getSegment(segment.meta.linkHash).then((segment) => {
      return segment[action](actionArgs);
    });
  }
}


console.log(requestorP, jasonP, ankurP,richardP);

Promise.all([requestorP, jasonP, ankurP,richardP]).then((agents)=>{

  var req = agents[0]; //ES6 destructure??
  var jason = agents[1];
  var ankur = agents[2];
  var richard = agents[3];

  var mapId = "";
  var initSegId;
  req.createMap('Test ' + Date.now(), evaluatorString)
    .then((initSegment) =>{
      console.log("map id", initSegment.link.meta.mapId);
      return initSegment;
    })
    .then(agentAction(ankur,"evaluate", 20))
    .then(agentAction(jason,"evaluate", 20))
    .then(agentAction(richard,"evaluate", 20))
    .then(agentAction(ankur,"unblind"))
    .then(agentAction(jason,"unblind"))
    .then(agentAction(richard,"unblind"))
    .then(agentAction(req,"finalize"))
    .then((segment)=>{
      console.log("Final outcome", segment.meta.linkHash, segment.link.state.average);
    })
    .catch(function(error) {console.log("Error????", error)});


}).catch(function(error) {console.log("Error????", error)});
