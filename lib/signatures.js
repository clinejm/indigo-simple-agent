require('node-import');
imports('lib/cryptographic_primitives');

// get correct user file (allows commandline to overwite)
userName = process.argv[3] || "user"
const USER = require('../config/'+userName);

// export functions to signedState plugin
// not using link or segment. not sure if i should?
module.exports = {
  signState: function(link, stateHash) {
    return sign(stateHash, USER.rsa_key.n, USER.rsa_key.e, USER.rsa_key.d);
  },
  verifySignature: function(segment, stateSignature, stateHash) {
    return verify(stateHash, stateSignature, USER.rsa_key.n, USER.rsa_key.e);
  }
};