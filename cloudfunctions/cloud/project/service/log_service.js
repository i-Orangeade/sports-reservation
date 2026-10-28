/**
 * log 业务逻辑：系统日志查询
 */
const BaseService = require('./base_service.js');
const OperationLogModel = require('../model/operation_log_model.js');

class LogService extends BaseService {
  async list({ module, page = 1, size = 20 }) {
    const where = {};
    if (module) where.module = module;
    return await OperationLogModel.getList(where, '*', { create_time: 'desc' }, page, size);
  }
}

module.exports = LogService;
