/**
 * configs 基础配置表（_id = key）
 */
const BaseModel = require('./base_model.js');

class ConfigModel extends BaseModel {}

ConfigModel.CL = 'configs';

ConfigModel.DB_STRUCTURE = {
  _id: 'string',
  key: 'string',
  value: 'object',
  update_time: 'number',
};

module.exports = ConfigModel;
