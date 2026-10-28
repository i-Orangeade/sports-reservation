const request = require('../../../utils/request.js');

const VENUE_TYPES = [
  { key: 'badminton', name: '羽毛球场' },
  { key: 'pingpong', name: '乒乓球场' },
  { key: 'gym', name: '健身房' },
];

Page({
  data: {
    types: VENUE_TYPES,
    activeType: 'badminton',
    list: [],
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const venues = await request.call('venue/list', {}, { silent: true });
      const group = venues.find((v) => v.venue_type === this.data.activeType);
      this.setData({ list: group ? group.courts : [] });
    } catch (e) {
      this.setData({ list: [] });
    }
  },

  onTapType(e) {
    this.setData({ activeType: e.currentTarget.dataset.key });
    this.load();
  },

  async toggle(e) {
    const key = e.currentTarget.dataset.key;
    const closed = e.currentTarget.dataset.closed;
    const res = await new Promise((resolve) => {
      wx.showModal({
        title: closed ? '恢复开放' : '临时闭馆',
        content: closed ? '确定恢复该场地开放吗？' : '确定将该场地临时闭馆吗？',
        success: (r) => resolve(r.confirm),
      });
    });
    if (!res) return;
    try {
      await request.call('venue/close', { venue_key: key, closed: !closed, closed_until: 0 });
      wx.showToast({ title: '操作成功', icon: 'success' });
      this.load();
    } catch (err) {}
  },
});
