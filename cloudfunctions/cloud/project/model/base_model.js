/**
 * 业务模型基类
 */
const Model = require('../../framework/database/model.js');

class BaseModel extends Model {}

BaseModel.CL = 'no-collection';

module.exports = BaseModel;
