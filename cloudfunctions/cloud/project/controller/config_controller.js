/**
 * config 控制器
 */
const BaseController = require('./base_controller.js');
const ConfigService = require('../service/config_service.js');

class ConfigController extends BaseController {
  async get() {
    return await new ConfigService().get();
  }

  async set() {
    const input = this.validateData({
      key: 'must|string|name=配置键',
      value: 'must|object|name=配置值',
    });
    return await new ConfigService().set(this._user, input);
  }

  async activityPic() {
    const input = this.validateData({ fileID: 'must|string|name=文件ID' });
    return await new ConfigService().activityPic(this._user, input.fileID);
  }
}

module.exports = ConfigController;
