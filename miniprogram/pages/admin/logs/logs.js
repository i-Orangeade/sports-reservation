const request = require('../../../utils/request.js');
const util = require('../../../utils/util.js');

const MODULES = [
  { key: '', name: '全部' },
  { key: 'blacklist', name: '拉黑' },
  { key: 'hr', name: '人事' },
  { key: 'venue_close', name: '闭馆' },
  { key: 'notice', name: '公告' },
  { key: 'config', name: '配置' },
  { key: 'checkin', name: '签到' },
];

const ACTION_TEXT = {
  add_blacklist: '拉黑',
  release_blacklist: '解除拉黑',
  auto_blacklist: '自动拉黑',
  assign_admin: '任免/分配管理员',
  remove_admin: '移除管理员',
  edit_student: '修改学生',
  close_venue: '闭馆',
  open_venue: '恢复开放',
  edit_notice: '修改公告',
  delete_notice: '删除公告',
  set_config: '修改配置',
  activity_pic: '更换活动图',
  checkin: '签到',
};

Page({
  data: {
    modules: MODULES,
    activeModule: '',
    list: [],
    page: 1,
    hasMore: true,
  },

  onShow() {
    this.setData({ list: [], page: 1 });
    this.load();
  },

  async load() {
    try {
      const data = await request.call('log/list', { module: this.data.activeModule, page: this.data.page, size: 20 }, { silent: true });
      const list = (data.list || []).map((l) =>
        Object.assign({}, l, {
          timeText: util.timestamp2Time(l.create_time, 'Y-M-D h:m:s'),
          actionText: ACTION_TEXT[l.action] || l.action,
        })
      );
      this.setData({
        list: this.data.page === 1 ? list : this.data.list.concat(list),
        hasMore: this.data.page < data.count,
      });
    } catch (e) {
      this.setData({ list: [] });
    }
  },

  onTapModule(e) {
    this.setData({ activeModule: e.currentTarget.dataset.key, list: [], page: 1 });
    this.load();
  },

  onReachBottom() {
    if (!this.data.hasMore) return;
    this.setData({ page: this.data.page + 1 });
    this.load();
  },
});
