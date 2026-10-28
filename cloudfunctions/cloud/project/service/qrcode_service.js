/**
 * qrcode 业务逻辑：动态二维码 token 生成 / 有效预约查询
 */
const BaseService = require('./base_service.js');
const QrcodeTokenModel = require('../model/qrcode_token_model.js');
const ReservationModel = require('../model/reservation_model.js');
const cryptoUtil = require('../../framework/utils/crypto_util.js');
const config = require('../../config/config.js');
const timeUtil = require('../../framework/utils/time_util.js');
const appCode = require('../../framework/core/app_code.js');

class QrcodeService extends BaseService {
  /** 生成 token（20s 覆盖式） */
  async generate(openId, user) {
    if (user && user.black_until && user.black_until > timeUtil.now()) {
      const days = Math.ceil((user.black_until - timeUtil.now()) / 86400000);
      this.AppError('您已被限制预约，' + days + ' 天内不可预约场馆', appCode.BLACKLIST, { black_days: days });
    }
    const token = cryptoUtil.randomToken(16);
    const expireTime = timeUtil.now() + config.QR_TOKEN_EXPIRE;
    const now = timeUtil.now();
    await QrcodeTokenModel.insertOrUpdate(openId, {
      student_openid: openId,
      token: token,
      expire_time: expireTime,
      create_time: now,
    });
    return { token: token, expire_time: expireTime, refresh_in: 20 };
  }

  /** 当前有效预约信息 */
  async validBooking(openId) {
    const booking = await this.findValidBooking(openId);
    return { has_valid: !!booking, booking: booking || null };
  }

  /** 查找有效预约：日期今天 + pending + 开始前15min~结束 */
  async findValidBooking(openId) {
    const today = timeUtil.today();
    const now = timeUtil.now();
    const list = await ReservationModel.getAll(
      { student_openid: openId, date: today, status: 'pending' },
      '*',
      { create_time: 'asc' }
    );
    for (const r of list) {
      const si = timeUtil.parseSlotKey(r.slot_key);
      const startTs = timeUtil.dateMinuteToTimestamp(r.date, si.start_min);
      const endTs = timeUtil.dateMinuteToTimestamp(r.date, si.end_min);
      const winStart = startTs - config.CHECKIN_BEFORE_MIN * 60 * 1000;
      if (now >= winStart && now <= endTs) {
        return this._formatBooking(r, si);
      }
    }
    return null;
  }

  _formatBooking(r, si) {
    return {
      res_id: r._id,
      date: r.date,
      slot_key: r.slot_key,
      venue_key: r.venue_key,
      venue_type: r.venue_type,
      venue_type_name: config.VENUE_TYPES[r.venue_type] ? config.VENUE_TYPES[r.venue_type].name : '',
      court_no: r.court_no,
      start_time: si.start_time,
      end_time: si.end_time,
      status: r.status,
    };
  }
}

module.exports = QrcodeService;
