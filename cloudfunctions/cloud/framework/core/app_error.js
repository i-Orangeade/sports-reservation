/**
 * 应用自定义异常
 */
const appCode = require('./app_code.js');

class AppError extends Error {
  constructor(message, code = appCode.LOGIC, data = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.data = data;
  }
}

module.exports = AppError;
