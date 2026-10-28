const request = require('../../../utils/request.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    list: [],
    showForm: false,
    editId: '',
    form: { title: '', content: '' },
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const list = await request.call('admin/notice_list', {}, { silent: true });
      this.setData({
        list: list.map((n) =>
          Object.assign({}, n, { timeText: util.timestamp2Time(n.publish_time, 'Y-M-D h:m') })
        ),
      });
    } catch (e) {
      this.setData({ list: [] });
    }
  },

  add() {
    this.setData({ showForm: true, editId: '', form: { title: '', content: '' } });
  },

  edit(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.list.find((n) => n._id === id);
    if (!item) return;
    this.setData({ showForm: true, editId: id, form: { title: item.title, content: item.content } });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: e.detail.value });
  },

  cancel() {
    this.setData({ showForm: false, editId: '' });
  },

  async save() {
    const { title, content } = this.data.form;
    if (!title || !content) {
      wx.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }
    try {
      if (this.data.editId) {
        await request.call('admin/notice_edit', { id: this.data.editId, title: title, content: content });
      } else {
        await request.call('admin/notice_add', { title: title, content: content });
      }
      wx.showToast({ title: '已保存', icon: 'success' });
      this.setData({ showForm: false, editId: '' });
      this.load();
    } catch (e) {}
  },

  async del(e) {
    const id = e.currentTarget.dataset.id;
    const res = await new Promise((resolve) => {
      wx.showModal({ title: '删除公告', content: '确定删除该公告吗？', success: (r) => resolve(r.confirm) });
    });
    if (!res) return;
    try {
      await request.call('admin/notice_delete', { id: id });
      wx.showToast({ title: '已删除', icon: 'success' });
      this.load();
    } catch (err) {}
  },
});
