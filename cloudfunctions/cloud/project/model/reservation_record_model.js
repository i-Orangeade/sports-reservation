/**
 * reservation_records 预约流水表（全状态，历史/查询依据）
 * _id 自动生成（每次预约唯一一条），用 res_id 字段关联占用表 reservations
 */
const BaseModel = require('./base_model.js');

class ReservationRecordModel extends BaseModel {}

ReservationRecordModel.CL = 'reservation_records';

ReservationRecordModel.DB_STRUCTURE = {
  _id: 'string',
  res_id: 'string',
  student_openid: 'string',
  student_name: 'string',
  date: 'string',
  slot_key: 'string',
  venue_key: 'string',
  venue_type: 'string',
  venue_type_name: 'string',
  court_no: 'number',
  status: 'string',
  cancel_time: 'number',
  cancel_reason: 'string',
  notified: 'number',
  create_time: 'number',
  update_time: 'number',
};

ReservationRecordModel.STATUS = {
  PENDING: 'pending',
  CHECKED_IN: 'checked_in',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

module.exports = ReservationRecordModel;
