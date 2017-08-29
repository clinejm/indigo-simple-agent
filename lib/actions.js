require('node-import');
const User = require('../config/user');

imports('lib/rsa');


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
  var encrypted_r = encrypt(r.toString(), User.rsa_key.n, User.rsa_key.e);
  this.state.blinding_factors[state.status.nextindex] = encrypted_r;
  return encrypted_r;
}

// retrieve and decyrpt blinding factor associated with current index
function getBlindingFactor(state){
  return decrypt(this.state.blinding_factors[state.status.index], User.rsa_key.n, User.rsa_key.e, User.rsa_key.d);
  return r;
}

function encryptTotal(state, total){
  var next_status = getNextStatus(state);
  var next = state.evaluators[next_status.index];
  var encrypted_total = encrypt(total.toString(), next.rsa_key.n, next.rsa_key.e);
  return encrypted_r;
}

function decryptTotal(state){
  return decrypt(state.encrypted_total, User.rsa_key.n, User.rsa_key.e, User.rsa_key.d);
}

function checkStatusIs(state, theState){
  return state.status.round === theState;
}


module.exports = {
  events: {
    didSave: function(segment) {
      console.log('Segment ' + segment.meta.linkHash + ' was saved!');
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
        e: User.rsa_key.e,
        n: User.rsa_key.n,
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

    // random integer r
    var r = get_blinding_integer();

    // set the params of the request.
    this.state = {
      object_description: object_description,
      r: r, // tmp, for us
      total: r, // tmp, for us
      encrypted_total: 0, // overwrite below
      evaluators: evaluators,
      blinding_factors: blindingFactors,
      status:{
        round: "valuation", // "unblinding"
        index: 0
      }

    };

    console.log("evaluators", this.state);

    // remember our blinding factor for unblinding phase
    setBlindingFactor(this.state, r);

    // encrypt total for first evaluator
    this.state.encrypted_total = encryptTotal(state, r)

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

    // are we still in evaluation phase?
    if (!checkStatusIs(this.state, "valuation")) {
      return this.reject('Not all values have been provided. Current status:' + this.state.status.round);
    }

    var nextindex = this.state.status.nextindex;

    // make sure it's my turn
    var next = getEvaluator(this.state, nextindex);
    //TODO this check doesn't really work, only works because its always me?
    if ((next.e != User.rsa_key.e) || (next.n != User.rsa_key.n)) {
      return this.reject('not your turn!');
    }

    console.log("next", next);

    updateStatus(state);

    // random integer r
    var r = get_blinding_integer();

    setBlindingFactor(state, r);

    var current_total = decryptTotal(state);
    var new_total = current_total + r + parseInt(value, 10);
    this.state.encrypted_total = encryptTotal(state, new_total);    

    // add to the valuation chain for our reference
    this.state.r = r;
    this.state.total = new_total;

    // Set the `item` tag.
    this.meta.tags = ['evaluate'];

    // Append the new segment.
    this.append();
  },

  unblind: function() {

    // are we still in unblind phase?
    if (!checkStatusIs(this.state, "unblinding")) {
      return this.reject('Its not time to unblind! Current status:', this.state.staus);
    }

    var unblindIndex = this.state.status.unblindIndex || 0;

    if(unblindIndex == 0) {
      this.state.status.unblindIndex = 0;
    }


    // make sure it's my turn
    //Should we be passing the keys??
    var next = getEvaluator(this.state, unblindIndex);
    //Shouldn't we be passing these in if we different people???
    if ((next.e != User.rsa_key.e) || (next.n != User.rsa_key.n)) {
      return this.reject('not your turn!');
    }

    var r = getBlindingFactor(this.state);

    console.log("RRRRRRRRR", r);

    // calculate new total from get current total
    current_total_str = decrypt(this.state.encrypted_total, User.rsa_key.n, User.rsa_key.e, User.rsa_key.d);
    current_total_int = parseInt(current_total_str, 10);
    new_total = current_total_int - parseInt(r);

    // add to the valuation chain.
    this.state.r = r;
    this.state.total = new_total;

    // encrypt total for next person
    var next = getEvaluator(this.state, unblindIndex+1);

    this.state.status.unblindIndex++;
    console.log(this.state.status.unblindIndex, this.state.evaluators.length);
    if(this.state.status.unblindIndex == this.state.evaluators.length){
      //all evals are provided, time to finalize?
      this.state.status.round ="finalize";
    } else {
      this.state.encrypted_total = encrypt(new_total.toString(), next.n, next.e);
    }

    // Set the `item` tag.
    this.meta.tags = ['unblind'];

    // Append the new segment.
    this.append();
  },

  finalize: function(r) {
    // Validate parameters.
    if (!r) {
      return this.reject('r required');
    }

    // is tt time??
    if (this.state.evaluators.round_one.length>0 || this.state.evaluators.round_two.length>0) {
      return this.reject('all valuations and unblinds must be given before finalization!');
    }

    // make sure it's my turn
    var next = this.state.evaluators.requested_by;
    if ((next.e != User.rsa_key.e) || (next.n != User.rsa_key.n)) {
      return this.reject('only requestor can finalize!');
    }

    // calculate new total from get current total
    current_total_str = decrypt(this.state.encrypted_total, User.rsa_key.n, User.rsa_key.e, User.rsa_key.d);
    current_total_int = parseInt(current_total_str, 10);
    new_total = current_total_int - parseInt(r);

    // add to the valuation chain.
    this.state.r = r;
    this.state.total = new_total;
    this.state.average = new_total / 4;

    delete this.state.encrypted_total;

    // Set the `item` tag.
    this.meta.tags = ['finalize'];

    // Append the new segment.
    this.append();
  }


};
