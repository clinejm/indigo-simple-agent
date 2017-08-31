require('node-import');
imports('lib/cryptographic_primitives');

// get correct user file (allows commandline to overwite)
userName = process.argv[3] || "user"
const USER = require('../config/'+userName);

// export functions to signedState plugin
module.exports = {
  signState: function(link, stateHash) {
    console.log("stateHash", stateHash);
    s =  sign(stateHash, USER.rsa_key.n, USER.rsa_key.e, USER.rsa_key.d);
    link.meta.signer= {n:USER.rsa_key.n, e: USER.rsa_key.e};
    console.log("signature", s)
    return s;
  },
  verifySignature: function(segment, stateSignature, stateHash) {
    console.log("stateSignature", stateSignature);
    return verify(stateHash, stateSignature, segment.link.meta.signer.n, segment.link.meta.signer.e);
  }
};
