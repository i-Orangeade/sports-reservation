/**
 * venue 控制器：场馆/场次/闭馆
 */
const BaseController = require('./base_controller.js');
const VenueService = require('../service/venue_service.js');

class VenueController extends BaseController {
  async list() {
    return await new VenueService().list();
  }

  async slotList() {
    return await new VenueService().slotList();
  }

  async close() {
    const input = this.validateData({
      venue_key: 'must|string|name=场地',
      closed: 'must|bool|name=是否闭馆',
      closed_until: 'int|default=0',
    });
    return await new VenueService().close(this._user, input);
  }

  async closeList() {
    return await new VenueService().closeList();
  }
}

module.exports = VenueController;
