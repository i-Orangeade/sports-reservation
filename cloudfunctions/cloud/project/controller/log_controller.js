/**
 * log 控制器
 */
const BaseController = require('./base_controller.js');
const LogService = require('../service/log_service.js');

class LogController extends BaseController {
  async list() {
    const input = this.validateData({
      module: 'string|default=',
      page: 'int|default=1',
      size: 'int|default=20',
    });
    return await new LogService().list(input);
  }
}

module.exports = LogController;
