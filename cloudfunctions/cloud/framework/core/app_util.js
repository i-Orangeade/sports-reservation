/**
 * 统一返回结构封装 { code, msg, data }
 */
const appCode = require('./app_code.js');

function handlerBasic(code, msg = '', data = {}) {
  if (code === appCode.SUCC) {
    msg = msg || 'ok';
  }
  return {
    code: code,
    msg: msg,
    data: data || {},
  };
}

function handlerSucc(msg = '') {
  return handlerBasic(appCode.SUCC, msg);
}

function handlerData(data, msg = '') {
  return handlerBasic(appCode.SUCC, msg, data);
}

function handlerAppErr(msg = '', code = appCode.LOGIC, data = {}) {
  return handlerBasic(code, msg, data || {});
}

function handlerSvrErr(msg = '服务器繁忙，请稍后再试') {
  return handlerBasic(appCode.SVR, msg);
}

module.exports = {
  handlerBasic,
  handlerData,
  handlerSucc,
  handlerSvrErr,
  handlerAppErr,
};
