const crypto = require('crypto');
const bcrypt = use("bcryptjs");
const authConfig = use("config/auth");
const orderConfig = use("config/order");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const ENCRYPTION_KEY = orderConfig.ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

class Encryption{
  static async hash(plainText){
    if (typeof plainText !== 'string') throw Error('Password must be a string');
    return await bcrypt.hash(plainText + authConfig.SECRET_KEY, saltRounds);
  }

  static async compareHash(plainText, encryptedText) {
    return await bcrypt.compare(plainText + authConfig.SECRET_KEY, encryptedText)
  }

  static async encryptAES(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
   
    encrypted = Buffer.concat([encrypted, cipher.final()]);
   
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }
   
  static async decryptAES(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
   
    decrypted = Buffer.concat([decrypted, decipher.final()]);
   
    return decrypted.toString();
  }
}

module.exports = Encryption