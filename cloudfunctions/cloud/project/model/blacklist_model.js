/**
 * blacklist 黑名单表
 */
const BaseModel = require('./base_model.js');

class BlacklistModel extends BaseModel {}

BlacklistModel.CL = 'blacklist';

BlacklistModel.DB_STRUCTURE = {
  _id: 'string',
  student_openid: 'string',
  student_name: 'string',
  channel: 'string',
  reason: 'string',
  duration_days: 'number',
  start_time: 'number',
  end_time: 'number',
  status: 'string',
  operator_openid: 'string',
  operator_name: 'string',
  release_by_openid: 'string',
  release_by_name: 'string',
  release_time: 'number',
  release_reason: 'string',
  create_time: 'number',
};

BlacklistModel.CHANNEL = { AUTO: 'auto', MANUAL: 'manual' };
BlacklistModel.STATUS = { ACTIVE: 'active', RELEASED: 'released' };

module.exports = BlacklistModel;
