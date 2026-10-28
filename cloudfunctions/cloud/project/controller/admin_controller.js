/**
 * admin 控制器：扫码签到 / 签到记录
 */
const BaseController = require('./base_controller.js');
const CheckinService = require('../service/checkin_service.js');

class AdminController extends BaseController {
  /** 扫码校验二维码 token */
  async scan() {
    const input = this.validateData({
      token: 'must|string|name=二维码token',
      slot_key: 'string|default=',
    });
    return await new CheckinService().scan(input.token, input.slot_key);
  }

  /** 确认签到（含附属人员） */
  async checkin() {
    const input = this.validateData({
      res_id: 'must|string|name=预约ID',
      slot_key: 'string|default=',
      companions: 'array|default=[]',
    });
    return await new CheckinService().checkin(this._user, input);
  }

  /** 当日签到记录 */
  async checkinRecords() {
    const input = this.validateData({
      venue_type: 'string|default=',
      slot_key: 'string|default=',
    });
    return await new CheckinService().checkinRecords(input);
  }
}

module.exports = AdminController;
