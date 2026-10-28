const request = require('../../utils/request.js');

Page({
  data: {
    role: 0,
    roleName: '',
  },

  onShow() {
    this.init();
  },

  async init() {
    try {
      const login = await request.call('passport/login', {}, { silent: true });
      this.setData({ role: login.role, roleName: login.role_name });
    } catch (e) {
      // ignore
    }
  },

  nav(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url: url });
  },
});
