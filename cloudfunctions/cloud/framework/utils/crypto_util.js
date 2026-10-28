/**
 * 加密/随机串工具
 */
const crypto = require('crypto');

/**
 * 生成随机 token（十六进制字符串）
 * @param {number} len 随机字节数（返回长度为 2*len）
 */
function randomToken(len = 16) {
  return crypto.randomBytes(len).toString('hex');
}

function md5(str) {
  return crypto.createHash('md5').update(String(str)).digest('hex');
}

module.exports = {
  randomToken,
  md5,
};
