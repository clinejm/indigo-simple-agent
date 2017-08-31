// adding our own cheap signing/verifying code

// sign text using decryption exponent
function RSASign(text) {
  var text_as_int = parseBigInt(text, 16);
  if(text_as_int == null) return null;
  var c = this.doPrivate(text_as_int);
  if(c == null) return null;
  var h = c.toString(16);
  if((h.length & 1) == 0) return h; else return "0" + h;
}

// check if decrypting signature using encryption exponent matches plaintext
function RSAVerify(text, ctext) {
  var ctext_as_int = parseBigInt(ctext, 16);
  var m = this.doPublic(ctext_as_int);
  if(m == null) return null;
  return (m.toString(16)==text);
}

RSAKey.prototype.sign = RSASign;
RSAKey.prototype.verify = RSAVerify;