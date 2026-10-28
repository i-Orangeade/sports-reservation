/**
 * 公告弹窗组件
 */
Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    notice: {
      type: Object,
      value: null,
    },
  },
  methods: {
    onClose() {
      this.triggerEvent('close');
    },
    onDetail() {
      const id = this.data.notice && this.data.notice._id;
      if (id) {
        wx.navigateTo({ url: '/pages/notice/notice?id=' + id });
      }
      this.triggerEvent('close');
    },
  },
});
