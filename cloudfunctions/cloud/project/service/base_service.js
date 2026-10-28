/**
 * 业务服务基类
 */
const AppError = require('../../framework/core/app_error.js');
const appCode = require('../../framework/core/app_code.js');
const timeUtil = require('../../framework/utils/time_util.js');

class BaseService {
  constructor() {
    this._timestamp = timeUtil.now();
  }

  /** 抛出业务异常 */
  AppError(msg, code = appCode.LOGIC, data = null) {
    throw new AppError(msg, code, data);
  }
}

module.exports = BaseService;
