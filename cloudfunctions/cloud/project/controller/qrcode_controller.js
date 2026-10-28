/**
 * qrcode 控制器
 */
const BaseController = require('./base_controller.js');
const QrcodeService = require('../service/qrcode_service.js');

class QrcodeController extends BaseController {
  async generate() {
    return await new QrcodeService().generate(this._openId, this._user);
  }

  async validBooking() {
    return await new QrcodeService().validBooking(this._openId);
  }
}

module.exports = QrcodeController;
