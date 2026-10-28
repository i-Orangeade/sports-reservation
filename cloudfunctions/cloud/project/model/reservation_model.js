/**
 * reservations 预约占用表（★并发核心）
 * _id = `${date}_${slot_key}_${venue_key}` 组合主键保证场地不超约
 */
const BaseModel = require('./base_model.js');

class ReservationModel extends BaseModel {}

ReservationModel.CL = 'reservations';

ReservationModel.DB_STRUCTURE = {
  _id: 'string',
  student_openid: 'string',
  student_name: 'string',
  student_no: 'string',
  date: 'string',
  slot_key: 'string',
  venue_key: 'string',
  venue_type: 'string',
  court_no: 'number',
  status: 'string',
  checkin_time: 'number',
  create_time: 'number',
};

ReservationModel.STATUS = { PENDING: 'pending', CHECKED_IN: 'checked_in' };

module.exports = ReservationModel;
