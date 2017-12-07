require('node-import');
imports('lib/cryptographic_primitives');
var nacl = require('tweetnacl');

// get correct user file (allows commandline to overwite)
userName = process.argv[3] || "user"

// has user EdDSA siging key
const USER = require('../config/'+userName);


function hex2bytes(hexString) {
  return new Uint8Array(Array.prototype.slice.call(Buffer.from(hexString, 'hex'), 0));
}

function bytes2hex(byteArray) {
  return Buffer.from(byteArray).toString('hex');
}

// export functions to signedState plugin
module.exports = {
  signState: function(link, stateHash) {
    // convert operands to byte arrays
    var stateHashBytes = hex2bytes(stateHash);
    var secretkeyBytes = hex2bytes(USER.signingKey.secretKey);

    // sign and encode as hex string
    var sigBytes = nacl.sign.detached(stateHashBytes, secretkeyBytes);
    var sigString = bytes2hex(sigBytes);

    // add signatures array to meta
    link.meta.signatures = [{
      PublicKey: USER.signingKey.publicKey,
      Signature: sigString,
      Type: "EdDSA"
    }]

    return sigString;
  },

  verifySignature: function(segment, stateSignature, stateHash) {
    // convert operands to bytes
    var stateHashBytes = hex2bytes(stateHash);

    segment.link.meta.signatures.forEach(function(signature) {
      // convert operands to bytes
      var stateSignatureBytes = hex2bytes(signature.Signature);
      var publicKeyBytes = hex2bytes(signature.PublicKey);

      // reject if unexpected type
      if (signature.Type != "EdDSA") {
        console.log("Invalid signature type:", signature.Type);
        return false
      }
      else {
        var verified = nacl.sign.detached.verify(stateHashBytes, stateSignatureBytes, publicKeyBytes);
        // rejecton on failure
        if (!verified) {
          return false;
        }
      }
    });

    // accept if all signatures are valid
    return true;
  }

};
