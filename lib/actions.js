require('node-import');
imports('lib/cryptographic_primitives');

// get correct user file (allows commandline to overwite)
userName = process.argv[3] || "user"
const USER = require('../config/'+userName);

// ### helpful functions ###

// bumps the current evaluator
function updateStatus(state){
  var status = getNextStatus(state);
  state.status = status;
  return state.status;
}

// bumps the current evaluator
function getNextStatus(state){
  // when in the middle of a round, just return the next one
  if (state.status.index < (state.evaluators.length-1)) {
    return {
      round: state.status.round,
      index: state.status.index+1
    }
  }
  else {
    switch (state.status.round) {
    case "valuation":
      return {
        round: "unblinding",
        index: 1
      }
    case "unblinding":
      return {
        round: "finalize",
        index: 0
      }
    }
  }
}

// encrypt and store blinding factor for current index
// encrypted with our public key so only we can use it
function setBlindingFactor(state, r){
  var encrypted_r = encrypt(r.toString(), USER.rsa_key.n, USER.rsa_key.e);
  state.blinding_factors[state.status.index] = encrypted_r;
  return encrypted_r;
}

// retrieve and decyrpt blinding factor associated with current index
function getBlindingFactor(state){
  return decrypt(state.blinding_factors[state.status.index], USER.rsa_key.n, USER.rsa_key.e, USER.rsa_key.d);
}

function encryptTotal(state, total){
  var next_status = getNextStatus(state);
  var next = state.evaluators[next_status.index];
  return encrypt(total.toString(), next.n, next.e);
}

function decryptTotal(state){
  return decrypt(state.encrypted_total, USER.rsa_key.n, USER.rsa_key.e, USER.rsa_key.d);
}

function checkStatusIs(state, theState){
  return (state.status.round === theState);
}

function isMyTurn(state) {
  var current = state.evaluators[state.status.index];
  return (current.e != USER.rsa_key.e) || (current.n != USER.rsa_key.n)
}


module.exports = {
  events: {
    didSave: function(segment) {
      //console.log('Segment ' + segment.meta.linkHash + ' was saved!');
    }
  },

  /**
   * Creates a new valuation
   * @param {string} object_description - description of object, or url
   * @param {string} pk_str, keys separated by ',' ; format: "e.n"

   */
  init: function(object_description, pk_str) {
    // Validate parameters.
    if (!object_description) {
      return this.reject('description or url required');
    }
    // parse pk_str into array of objects with e and n
    var evaluators = pk_str.split(',');
    // add requester as first evaluator
    evaluators.unshift({
        e: USER.rsa_key.e,
        n: USER.rsa_key.n,
        description: "this is the requester"
    });
    // init blinding factors
    blindingFactors = [0];
    // assign each evaluator and blinding factor
    for(var i=1;i<evaluators.length;i++) {
      var tmp = evaluators[i].split('.');
      evaluators[i] = { e: tmp[0].trim(), n: tmp[1].trim() };
      blindingFactors.push(0);
    }

    // set the params of the request.
    this.state = {
      object_description: object_description,
      evaluators: evaluators,
      blinding_factors: blindingFactors,
      status:{
        round: "valuation", // "unblinding"
        index: 0
      }

    };

    //console.log("evaluators", this.state);

    // remember our blinding factor for unblinding phase
    var r = generate_random_integer();
    setBlindingFactor(this.state, r);

    // encrypt total for first evaluator
    this.state.encrypted_total = encryptTotal(this.state, r)

    // Set the `list` tag.
    this.meta.tags = ['request'];

    // Create the first segment.
    this.append();
  },

  /**
   * Adds an item to the TODO list.
   * @param {string} description - a description of the item
   */
  evaluate: function(value) {
    // Validate parameters.
    if (!value) {
      return this.reject('value required');
    }

    var state = this.state;
    updateStatus(state);

    // are we still in evaluation phase?
    if (!checkStatusIs(state, "valuation")) {
      return this.reject('NO!. Must:' + state.status.round);
    }

    if (isMyTurn(state)) {
      return this.reject('not your turn!');
    }

    // random integer r
    var r = generate_random_integer();
    setBlindingFactor(state, r);

    var current_total = decryptTotal(state);
    var new_total = parseInt(current_total) + r + parseInt(value);
    state.encrypted_total = encryptTotal(state, new_total);

    // Set the `item` tag.
    this.meta.tags = ['evaluate'];

    // Append the new segment.
    this.append();
  },

  unblind: function() {

    var state = this.state;
    updateStatus(state);

    // are we still in evaluation phase?
    if (!checkStatusIs(state, "unblinding")) {
      return this.reject('NO!. Must:' + state.status.round);
    }

    if (isMyTurn(state)) {
      return this.reject('not your turn!');
    }

    var r = getBlindingFactor(state);

    var current_total = decryptTotal(state);
    var new_total = parseInt(current_total) - parseInt(r);
    state.encrypted_total = encryptTotal(state, new_total);

    // add to the valuation chain.``
    state.r = r;
    state.total = new_total;

    // Set the `item` tag.
    this.meta.tags = ['unblind'];

    // Append the new segment.
    this.append();
  },

  finalize: function() {
    var state = this.state;
    updateStatus(state);

    // are we still in evaluation phase?
    if (!checkStatusIs(state, "finalize")) {
      return this.reject('NO!. Must:' + state.status.round);
    }

    if (isMyTurn(state)) {
      return this.reject('not your turn!');
    }

    var r = getBlindingFactor(state);

    var current_total = decryptTotal(state);
    var new_total = parseInt(current_total) - parseInt(r);

    state.total = new_total;
    state.average = new_total / (state.evaluators.length-1);

    delete state.encrypted_total;

    // Set the `item` tag.
    this.meta.tags = ['finalize'];

    // Append the new segment.
    this.append();
  }


};
