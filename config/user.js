// rsa key values in hex
module.exports = {
  rsa_key: {
    e: "10001",
    n: "87c5372e65d5437f25199c2996ce59c7cd3912a4936b1b1ab16284a320b6ee7ce9cc9d51ae2173d14e7cf5c81f1263df4739f98ccc3443f28f80c689ce635429",
    d: '4fe7ef291c7fde80b72a12719bb308be01f784145e3adc31e29253f3da2e2fbf72c5340c58c760c651492440510f0e0696af4ac530a39f0c615da6b412ba321d'
  },
  /*
  // to generate new signing keys:
  var nacl = require('tweetnacl');
  seed = nacl.randomBytes(32);
  signing_key_bytes = nacl.sign.keyPair.fromSeed(seed)
  var signingKey = {
    publicKey: Buffer.from(signing_key_bytes.publicKey).toString('hex'),
    secretKey: Buffer.from(signing_key_bytes.secretKey).toString('hex')
  }
  signingKey;
  */
  signingKey: {
    publicKey: 'd20543284c861f969218b4d1e97ac71a0e11525a1c5bc19b627a9ffcb0dbeb23',
    secretKey: '84e3ce5a45bd91fee3ad3ddbe390e78868218caca6bb787395b817c575779905d20543284c861f969218b4d1e97ac71a0e11525a1c5bc19b627a9ffcb0dbeb23'
  }
}