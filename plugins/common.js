import CryptoJS from 'crypto-js';

export default {
  encrypt(data, cookies) {
    //cookies.get("data_key_encrypted");
    const data_key = "secret";
    const encrypted = CryptoJS.AES.encrypt(data, data_key);
    const encrypted_str = this.base64ToUrl(encrypted.toString());
    return encrypted_str;
  },
  decrypt(encrypted, cookies) {
    const data_key = "secret";
    const encrypted2 = this.base64FromUrl(encrypted);
    //const len = encrypted2.length;
    const decrypted = CryptoJS.AES.decrypt(encrypted2, data_key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  },
  base64ToUrl(str) {
    return this.replaceAll(this.replaceAll(this.replaceAll(str, "+", "-"), "/", "_"), "=", "");
  },
  base64FromUrl(str) {
    return this.replaceAll(this.replaceAll(str, "-", "+"), "_", "/");
  },
  replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
  },
}
