/**
 * message 业务逻辑：订阅消息（P1，基础实现）
 */
const BaseService = require('./base_service.js');
const dbUtil = require('../../framework/database/db_util.js');
const config = require('../../config/config.js');

class MessageService extends BaseService {
  /** 记录订阅授权（前端 requestSubscribeMessage 成功后上报） */
  async subscribe(openId) {
    // P1：此处仅确认授权上报；实际发送按模板 ID 触发
    return { subscribed: true };
  }

  /** 发送订阅消息（P1，模板缺失时静默跳过） */
  async sendSubscribe(openId, tplKey, page, data) {
    const tplId = config.SUBSCRIBE_TPL && config.SUBSCRIBE_TPL[tplKey];
    if (!tplId) return false;
    try {
      const cloud = dbUtil.getCloud();
      await cloud.openapi.subscribeMessage.send({
        touser: openId,
        templateId: tplId,
        page: page || 'pages/index/index',
        data: data,
        miniprogramState: 'formal',
      });
      return true;
    } catch (e) {
      console.error('[gymreserve] sendSubscribe fail', e);
      return false;
    }
  }
}

module.exports = MessageService;
