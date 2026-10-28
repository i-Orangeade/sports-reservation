/**
 * blacklist 控制器
 */
const BaseController = require('./base_controller.js');
const BlacklistService = require('../service/blacklist_service.js');

class BlacklistController extends BaseController {
  async list() {
    return await new BlacklistService().list();
  }

  async add() {
    const input = this.validateData({
      student_openid: 'must|string|name=学生openid',
      duration_days: 'must|int|name=拉黑天数',
      reason: 'string|default=',
    });
    return await new BlacklistService().add(this._user, input);
  }

  async release() {
    const input = this.validateData({
      blacklist_id: 'must|string|name=黑名单ID',
      reason: 'string|default=',
    });
    return await new BlacklistService().release(this._user, input);
  }
}

module.exports = BlacklistController;
