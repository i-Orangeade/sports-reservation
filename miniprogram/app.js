const config = require('./config/config.js');

App({
  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用云能力，请升级微信后重试',
        showCancel: false,
      });
      return;
    }
    wx.cloud.init({
      env: config.CLOUD_ID,
      traceUser: true,
    });
  },
  globalData: {
    userInfo: null,
    role: 0,
  },
});
