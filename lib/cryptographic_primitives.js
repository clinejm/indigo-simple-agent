function alert(x){ 
  (typeof query == 'undefined') ? console.log('undefined') : console.log(x);
  return;
}

navigator = {};
window = {};

imports('vendor/prng4');
imports('vendor/rng');
imports('vendor/jsbn');
imports('vendor/jsbn2');
imports('vendor/rsa');
imports('vendor/rsa2');
imports('vendor/rsa3');

// pk is a RSAKey() with public parameters set
// plaintext is what we want to encrypt
function encrypt(plaintext, n, e) {
  if (plaintext.length == 0) {
    throw new Error('Cannot encrypt empty plaintext!');
  }

  var rsa = new RSAKey();
  rsa.setPublic(n, e);
  return rsa.encrypt(plaintext);
}

function decrypt(ciphertext, n, e, d) {
  if (ciphertext.length == 0) {
    throw new Error('Cannot decrypt empty plaintext!');
  }

  var rsa = new RSAKey();
  rsa.setPrivate(n, e, d);
  return rsa.decrypt(ciphertext);
}

function sign(plaintext, n, e, d) {
  if (plaintext.length == 0) {
    throw new Error('Cannot sign empty plaintext!');
  }

  var rsa = new RSAKey();
  rsa.setPrivate(n, e, d);
  return rsa.sign(plaintext);
}

function verify(plaintext, signature, n, e) {
  if ((plaintext.length == 0) || (signature.length == 0)) {
    throw new Error('Cannot verify empty plaintext or signature!');
  }

  var rsa = new RSAKey();
  rsa.setPublic(n, e);
  return rsa.verify(plaintext, signature);
}

function generate_random_integer(num_bytes=4) {
  r_buff = Buffer.alloc(num_bytes)
  rng_get_bytes(r_buff)
  return parseInt(r_buff.toString('hex'), 16)
}
