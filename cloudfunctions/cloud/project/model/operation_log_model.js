/**
 * operation_logs 操作日志表
 */
const BaseModel = require('./base_model.js');

class OperationLogModel extends BaseModel {}

OperationLogModel.CL = 'operation_logs';

OperationLogModel.DB_STRUCTURE = {
  _id: 'string',
  module: 'string',
  action: 'string',
  operator_openid: 'string',
  operator_name: 'string',
  operator_role: 'number',
  target_openid: 'string',
  target_desc: 'string',
  detail: 'object',
  create_time: 'number',
};

OperationLogModel.MODULE = {
  BLACKLIST: 'blacklist',
  HR: 'hr',
  VENUE_CLOSE: 'venue_close',
  NOTICE: 'notice',
  CONFIG: 'config',
  CHECKIN: 'checkin',
};

module.exports = OperationLogModel;
