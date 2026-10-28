const request = require('../../utils/request.js');
const util = require('../../utils/util.js');

Page({
  data: {
    records: [],
    checkins: [],
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const data = await request.call('my/records', {}, { silent: true });
      this.setData({
        records: (data.records || []).map((r) => Object.assign({}, r, { statusText: util.statusText(r.status) })),
        checkins: (data.checkins || []).map((c) =>
          Object.assign({}, c, {
            checkinTimeText: util.timestamp2Time(c.checkin_time, 'M-D h:m'),
            companionsText: (c.companions || []).map((x) => x.name).join('、'),
          })
        ),
      });
    } catch (e) {
      this.setData({ records: [], checkins: [] });
    }
  },
});
