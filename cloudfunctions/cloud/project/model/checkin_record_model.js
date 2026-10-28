/**
 * checkin_records 签到记录表（含附属人员）
 * _id = res_id（一条预约只签一次，幂等）
 */
const BaseModel = require('./base_model.js');

class CheckinRecordModel extends BaseModel {}

CheckinRecordModel.CL = 'checkin_records';

CheckinRecordModel.DB_STRUCTURE = {
  _id: 'string',
  res_id: 'string',
  student_openid: 'string',
  student_name: 'string',
  student_no: 'string',
  date: 'string',
  slot_key: 'string',
  venue_key: 'string',
  venue_type: 'string',
  venue_type_name: 'string',
  court_no: 'number',
  companions: 'array',
  admin_openid: 'string',
  admin_name: 'string',
  checkin_time: 'number',
};

module.exports = CheckinRecordModel;
