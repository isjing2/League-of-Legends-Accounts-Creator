/* eslint-disable no-await-in-loop */
const axios = require('axios');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const solveRecaptchaV2 = async ({ dbcUsername, dbcPassword, googleKey, url }) => {
  const requestUrl = `http://api.dbcapi.me/2captcha/in.php?key=${dbcUsername}:${dbcPassword}&method=userrecaptcha&googlekey=${googleKey}&pageurl=${url}&soft_id=2622`;
  const response = await axios.post(requestUrl).catch((err) => err.response);

  const captchaIDres = response.data || 'error';
  const captchaID = captchaIDres.split('|')[1]; // remove 'OK|'

  await sleep(5000);

  const requestTokenUrl = `http://api.dbcapi.me/2captcha/res.php?key=${dbcUsername}:${dbcPassword}&action=get&id=${captchaID}&soft_id=2622`;
  const res2 = await axios.get(requestTokenUrl).catch((err) => err.response);
  let token = res2.data || 'error';
  let attempt = 1;
  while (token === 'OK|CAPCHA_NOT_READY' && attempt <= 60) {
    await sleep(5000);
    attempt += 1;
    const res3 = await axios.get(requestTokenUrl).catch((err) => err.response);
    token = res3.data || 'error';
  }

  const [, result] = token.split('|'); // remove 'OK|'
  return result || token;
};

module.exports = solveRecaptchaV2;
