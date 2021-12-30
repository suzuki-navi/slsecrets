import CryptoJS from 'crypto-js';

export default {
  encrypt(data, cookies) {
    //cookies.get("data_key_encrypted");
    const self = this;
    function encrypt_sub(data, data_key) {
      const encrypted = CryptoJS.AES.encrypt(data, data_key).toString();
      const encrypted2 = self.base64ToUrl(encrypted);
      return encrypted2;
    }
    const data_key = this.getFirstDataKey(cookies);
    return encrypt_sub(data, data_key);
  },
  decrypt(encrypted, cookies) {
    const self = this;
    function decrypt_sub(encrypted, data_key) {
      const encrypted2 = self.base64FromUrl(encrypted);
      const decrypted = CryptoJS.AES.decrypt(encrypted2, data_key).toString(CryptoJS.enc.Utf8);
      return decrypted;
    }
    let firstFlag = true;
    for (const data_key of this.getDataKey(cookies)) {
      const data = decrypt_sub(encrypted, data_key);
      if (data.length > 0) {
        if (firstFlag)
          return [encrypted, data];
        const encrypted2 = self.encrypt(data, cookies);
        return [encrypted2, data];
      }
      firstFlag = false;
    }
    return [encrypted, ""];
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
  getFirstDataKey(cookies) {
    const data_keys = this.getDataKey(cookies);
    if (data_keys.length == 0) {
      return "";
    }
    return data_keys[0];
  },
  getDataKey(cookies) {
    const secret_key = cookies.get("secret");
    if (secret_key == undefined)
      return [];
    const data_key_encrypted = cookies.get("data_key_encrypted");
    if (data_key_encrypted == undefined)
      return [];
    const data_key_encoded = CryptoJS.AES.decrypt(data_key_encrypted, secret_key).toString(CryptoJS.enc.Utf8);
    const data_keys = JSON.parse(data_key_encoded);
    return data_keys;
  },
  calcSecretKey(master_key) {
    const salt = "slsecrets";
    const hash = CryptoJS.SHA256(salt + master_key);
    return CryptoJS.enc.Base64.stringify(hash);
  },
  rotateDataKey(old_master_password, new_master_password, cookies, errorHandler) {
    const old_secret_key = this.calcSecretKey(old_master_password);
    const old_secret_key_0 = cookies.get("secret");
    if (old_secret_key_0 != undefined && old_secret_key != old_secret_key_0) {
      errorHandler("Old password isn't valid");
      return;
    }
    const new_secret_key = this.calcSecretKey(new_master_password);

    const data_keys = this.getDataKey(cookies);
    data_keys.unshift(this.generatePassword());
    const new_data_key_encoded = JSON.stringify(data_keys);
    const new_data_key_encrypted = CryptoJS.AES.encrypt(new_data_key_encoded, new_secret_key).toString();
    cookies.set("data_key_encrypted", new_data_key_encrypted, {maxAge: 30 * 86400});
    cookies.set("secret", new_secret_key, {maxAge: 30 * 86400})
  },
  generatePassword() {
    const chs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz=-#%&";
    let p = "";
    for (let i = 0; i < 32; i++) {
      p += chs.charAt(Math.floor(Math.random() * chs.length));
    }
    return p;
  },
}
