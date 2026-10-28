/**
 * message 控制器
 */
const BaseController = require('./base_controller.js');
const MessageService = require('../service/message_service.js');

class MessageController extends BaseController {
  async subscribe() {
    return await new MessageService().subscribe(this._openId);
  }
}

module.exports = MessageController;
