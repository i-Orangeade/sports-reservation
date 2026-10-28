/**
 * 通用工具函数
 */

/**
 * 判断变量是否已定义（非 undefined）
 */
function isDefined(val) {
  return val !== undefined;
}

/**
 * 判断对象是否为空
 */
function isObjectNull(obj) {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
}

/**
 * 数字补零
 */
function pad2(n) {
  return (n < 10 ? '0' : '') + n;
}

/**
 * 休眠
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  isDefined,
  isObjectNull,
  pad2,
  sleep,
};
