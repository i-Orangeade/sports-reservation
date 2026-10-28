/**
 * qrcode_tokens 动态二维码 token 表（防截图）
 * _id = student_openid（一个学生一条，覆盖式刷新）
 */
const BaseModel = require('./base_model.js');

class QrcodeTokenModel extends BaseModel {}

QrcodeTokenModel.CL = 'qrcode_tokens';

QrcodeTokenModel.DB_STRUCTURE = {
  _id: 'string',
  student_openid: 'string',
  token: 'string',
  expire_time: 'number',
  create_time: 'number',
};

module.exports = QrcodeTokenModel;
