const request = require('../../utils/request.js');

Page({
  data: {
    name: '',
    student_no: '',
    phone: '',
    college: '',
  },

  onLoad() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      const p = await request.call('my/profile', {}, { silent: true });
      this.setData({
        name: p.name || '',
        student_no: p.student_no || '',
        phone: p.phone || '',
        college: p.college || '',
      });
    } catch (e) {
      // 未注册用户可能无 profile，忽略
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  async save() {
    const { name, student_no, phone, college } = this.data;
    if (!name || !student_no || !phone || !college) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' });
      return;
    }
    try {
      await request.call('passport/save_profile', {
        name: name,
        student_no: student_no,
        phone: phone,
        college: college,
      });
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    } catch (e) {
      // 错误已 toast
    }
  },
});
