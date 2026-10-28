const request = require('../../../utils/request.js');
const util = require('../../../utils/util.js');

const VENUE_TYPES = [
  { key: '', name: '全部场馆' },
  { key: 'badminton', name: '羽毛球场' },
  { key: 'pingpong', name: '乒乓球场' },
  { key: 'gym', name: '健身房' },
];

Page({
  data: {
    types: VENUE_TYPES,
    activeType: '',
    activeSlot: '',
    list: [],
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const list = await request.call(
        'admin/checkin_records',
        { venue_type: this.data.activeType, slot_key: this.data.activeSlot },
        { silent: true }
      );
      this.setData({
        list: list.map((c) =>
          Object.assign({}, c, {
            checkinText: util.timestamp2Time(c.checkin_time, 'h:m:s'),
            companionsText: (c.companions || []).map((x) => x.name).join('、'),
          })
        ),
      });
    } catch (e) {
      this.setData({ list: [] });
    }
  },

  onTapType(e) {
    this.setData({ activeType: e.currentTarget.dataset.key });
    this.load();
  },

  onTapSlot(e) {
    this.setData({ activeSlot: e.currentTarget.dataset.key });
    this.load();
  },
});
