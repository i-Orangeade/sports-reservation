/**
 * 业务控制器基类：参数校验等
 */
const Controller = require('../../framework/client/controller.js');
const AppError = require('../../framework/core/app_error.js');
const appCode = require('../../framework/core/app_code.js');
const timeUtil = require('../../framework/utils/time_util.js');
const util = require('../../framework/utils/util.js');

class BaseController extends Controller {
  constructor(route, openId, user, role, event) {
    super(route, openId, user, role, event);
    this._timestamp = timeUtil.now();
  }

  /** 获取单个参数 */
  getParameter(name, defVal = '') {
    return util.isDefined(this._request[name]) ? this._request[name] : defVal;
  }

  /** 抛出业务异常 */
  AppError(msg, code = appCode.LOGIC, data = null) {
    throw new AppError(msg, code, data);
  }

  /**
   * 轻量参数校验。
   * 规则用 | 分隔，支持：must / int / string / array / object / bool / date / mobile / min:n / max:n / name=xxx / default=xxx
   */
  validateData(rules = {}) {
    const input = this._request || {};
    const out = {};

    for (const key in rules) {
      const parts = String(rules[key]).split('|');
      let val = input[key];
      let desc = key;
      let type = 'string';
      let defVal;

      for (const p of parts) {
        if (p.indexOf('name=') === 0) desc = p.slice(5);
        else if (p.indexOf('default=') === 0) defVal = p.slice(8);
        else if (['int', 'string', 'array', 'object', 'bool', 'date', 'mobile'].indexOf(p) >= 0) type = p;
      }

      const must = parts.indexOf('must') >= 0;

      // 空值处理
      if (val === undefined || val === null || val === '') {
        if (must) throw new AppError('「' + desc + '」不能为空', appCode.DATA);
        val = coerceDefault(defVal, type);
      }

      if (val === undefined || val === null || val === '') {
        out[key] = val;
        continue;
      }

      // 类型转换
      switch (type) {
        case 'int':
          val = Number(val);
          if (isNaN(val)) throw new AppError('「' + desc + '」必须为数字', appCode.DATA);
          break;
        case 'string':
          val = String(val).trim();
          break;
        case 'bool':
          val = val === true || val === 'true' || val === 1 || val === '1';
          break;
        case 'array':
          if (!Array.isArray(val)) throw new AppError('「' + desc + '」必须为数组', appCode.DATA);
          break;
        case 'object':
          if (typeof val !== 'object' || Array.isArray(val)) throw new AppError('「' + desc + '」必须为对象', appCode.DATA);
          break;
        case 'date':
          val = String(val);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) throw new AppError('「' + desc + '」日期格式错误', appCode.DATA);
          break;
        case 'mobile':
          val = String(val);
          if (!/^1\d{10}$/.test(val)) throw new AppError('「' + desc + '」手机号格式错误', appCode.DATA);
          break;
      }

      // 长度/范围
      for (const p of parts) {
        if (p.indexOf('min:') === 0) {
          const n = Number(p.slice(4));
          if (type === 'int' ? val < n : String(val).length < n) {
            throw new AppError('「' + desc + '」不能小于 ' + n, appCode.DATA);
          }
        } else if (p.indexOf('max:') === 0) {
          const n = Number(p.slice(4));
          if (type === 'int' ? val > n : String(val).length > n) {
            throw new AppError('「' + desc + '」不能大于 ' + n, appCode.DATA);
          }
        }
      }

      out[key] = val;
    }
    return out;
  }
}

module.exports = BaseController;

/** 默认值按类型转换 */
function coerceDefault(defVal, type) {
  if (defVal === undefined) return defVal;
  switch (type) {
    case 'int':
      return Number(defVal);
    case 'bool':
      return defVal === true || defVal === 'true' || defVal === 1 || defVal === '1';
    case 'array':
    case 'object': {
      try {
        return JSON.parse(defVal);
      } catch (e) {
        return type === 'array' ? [] : {};
      }
    }
    default:
      return defVal;
  }
}
