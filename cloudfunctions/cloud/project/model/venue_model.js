/**
 * venues 场地表
 */
const BaseModel = require('./base_model.js');

class VenueModel extends BaseModel {}

VenueModel.CL = 'venues';

VenueModel.DB_STRUCTURE = {
  _id: 'string',
  venue_key: 'string',
  venue_type: 'string',
  venue_type_name: 'string',
  court_no: 'number',
  closed: 'bool',
  closed_until: 'number',
  update_time: 'number',
};

module.exports = VenueModel;
