const request = require('../../utils/request.js');
const util = require('../../utils/util.js');

Page({
  data: {
    list: [],
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const list = await request.call('my/reservations', {}, { silent: true });
      this.setData({
        list: list.map((r) => Object.assign({}, r, { statusText: util.statusText(r.status) })),
      });
    } catch (e) {
      this.setData({ list: [] });
    }
  },

  async cancel(e) {
    const id = e.currentTarget.dataset.id;
    const res = await new Promise((resolve) => {
      wx.showModal({
        title: '取消预约',
        content: '确定取消该预约吗？场地将立即释放。',
        success: (r) => resolve(r.confirm),
      });
    });
    if (!res) return;
    try {
      await request.call('reservation/cancel', { res_id: id });
      wx.showToast({ title: '已取消', icon: 'success' });
      this.load();
    } catch (err) {
      // 错误已 toast
      this.load();
    }
  },
});
