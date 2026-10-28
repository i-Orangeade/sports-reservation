const request = require('../../utils/request.js');
const qrUtil = require('../../utils/qrcode.js');

Page({
  data: {
    booking: null,
    hasValid: false,
    countdown: 20,
    size: 220,
  },

  onShow() {
    this.start();
  },

  onHide() {
    this.stop();
  },

  onUnload() {
    this.stop();
  },

  start() {
    this.refresh();
    this.stop();
    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
  },

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  tick() {
    let c = this.data.countdown - 1;
    if (c <= 0) {
      this.refresh();
    } else {
      this.setData({ countdown: c });
    }
  },

  async refresh() {
    try {
      const valid = await request.call('qrcode/valid_booking', {}, { silent: true });
      const gen = await request.call('qrcode/generate', {}, { silent: true });
      this.setData({
        booking: valid && valid.has_valid ? valid.booking : null,
        hasValid: !!(valid && valid.has_valid),
        countdown: 20,
      });
      qrUtil.drawQrCode('qrcode', gen.token, this.data.size, this);
    } catch (e) {
      this.setData({ countdown: 20 });
    }
  },
});
