/**
 * time_slots 场次模板表
 */
const BaseModel = require('./base_model.js');

class TimeSlotModel extends BaseModel {}

TimeSlotModel.CL = 'time_slots';

TimeSlotModel.DB_STRUCTURE = {
  _id: 'string',
  slot_key: 'string',
  start_time: 'string',
  end_time: 'string',
  start_min: 'number',
  end_min: 'number',
  day_type: 'string',
  sort: 'number',
};

module.exports = TimeSlotModel;
