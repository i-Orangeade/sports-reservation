/**
 * users 用户表
 */
const BaseModel = require('./base_model.js');

class UserModel extends BaseModel {}

UserModel.CL = 'users';

// 字段结构（文档用途）
UserModel.DB_STRUCTURE = {
  _id: 'string',
  openid: 'string',
  role: 'number',
  name: 'string',
  student_no: 'string',
  phone: 'string',
  college: 'string',
  info_completed: 'bool',
  status: 'number',
  black_until: 'number',
  create_time: 'number',
  update_time: 'number',
};

UserModel.STATUS = { DISABLED: 0, NORMAL: 1 };

module.exports = UserModel;
