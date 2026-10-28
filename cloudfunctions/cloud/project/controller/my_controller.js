/**
 * my 控制器：我的预约/记录/信息
 */
const BaseController = require('./base_controller.js');
const ReservationRecordModel = require('../model/reservation_record_model.js');
const CheckinRecordModel = require('../model/checkin_record_model.js');
const UserModel = require('../model/user_model.js');
const config = require('../../config/config.js');
const timeUtil = require('../../framework/utils/time_util.js');
const appCode = require('../../framework/core/app_code.js');

class MyController extends BaseController {
  /** 我的预约列表（含取消可用标记） */
  async reservations() {
    const list = await ReservationRecordModel.getAll(
      { student_openid: this._openId },
      '*',
      { create_time: 'desc' },
      100
    );
    const now = timeUtil.now();
    return list.map((r) => {
      let cancelable = false;
      if (r.status === 'pending') {
        const si = timeUtil.parseSlotKey(r.slot_key);
        if (si) {
          const startTs = timeUtil.dateMinuteToTimestamp(r.date, si.start_min);
          cancelable = now < startTs - 30 * 60 * 1000;
        }
      }
      return Object.assign({}, r, { cancelable: cancelable });
    });
  }

  /** 近7天预约+签到记录 */
  async records() {
    const from = timeUtil.addDays(timeUtil.today(), -7);
    const records = await ReservationRecordModel.getAll(
      { student_openid: this._openId, date: ['>=', from] },
      '*',
      { create_time: 'desc' },
      100
    );
    const checkins = await CheckinRecordModel.getAll(
      { student_openid: this._openId, date: ['>=', from] },
      '*',
      { checkin_time: 'desc' },
      100
    );
    return { records: records, checkins: checkins };
  }

  /** 我的信息 */
  async profile() {
    const user = await UserModel.getOne(this._openId);
    if (!user) this.AppError('用户不存在', appCode.NO_LOGIN);
    return {
      name: user.name,
      student_no: user.student_no,
      phone: user.phone,
      college: user.college,
      role: user.role,
      role_name: config.ROLE_LEVEL[user.role] || '',
      info_completed: user.info_completed,
      black_until: user.black_until,
    };
  }
}

module.exports = MyController;
