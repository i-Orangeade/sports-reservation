/**
 * notice 业务逻辑：公告查看/管理
 */
const BaseService = require('./base_service.js');
const NoticeModel = require('../model/notice_model.js');
const OperationLogModel = require('../model/operation_log_model.js');
const timeUtil = require('../../framework/utils/time_util.js');
const appCode = require('../../framework/core/app_code.js');

class NoticeService extends BaseService {
  /** 最新一条已发布公告 */
  async latest() {
    return await NoticeModel.getOne({ status: 'published' }, '*', { publish_time: 'desc' });
  }

  /** 公告列表（已发布） */
  async list(page = 1, size = 20) {
    return await NoticeModel.getList({ status: 'published' }, '*', { publish_time: 'desc' }, page, size);
  }

  /** 公告详情 */
  async detail(id) {
    const n = await NoticeModel.getOne(id);
    if (!n || n.status === 'deleted') this.AppError('公告不存在或已删除', appCode.LOGIC);
    return n;
  }

  /** 管理端公告列表（含已删除） */
  async adminList() {
    return await NoticeModel.getAll({}, '*', { publish_time: 'desc' });
  }

  /** 发布公告 */
  async add(operator, { title, content }) {
    const now = timeUtil.now();
    await NoticeModel.insert({
      title: title,
      content: content,
      status: 'published',
      author_openid: operator._id,
      author_name: operator.name || '',
      publish_time: now,
      update_time: now,
    });
    return { added: true };
  }

  /** 修改公告 */
  async edit(operator, id, { title, content }) {
    const n = await NoticeModel.getOne(id);
    if (!n) this.AppError('公告不存在', appCode.LOGIC);
    const now = timeUtil.now();
    await NoticeModel.edit(id, { title: title, content: content, update_time: now });
    await OperationLogModel.insert({
      module: 'notice',
      action: 'edit_notice',
      operator_openid: operator._id,
      operator_name: operator.name || '',
      operator_role: operator.role,
      target_desc: id,
      detail: { title: title },
      create_time: now,
    });
    return { edited: true };
  }

  /** 删除公告（逻辑删除） */
  async remove(operator, id) {
    const n = await NoticeModel.getOne(id);
    if (!n) this.AppError('公告不存在', appCode.LOGIC);
    const now = timeUtil.now();
    await NoticeModel.edit(id, { status: 'deleted', update_time: now });
    await OperationLogModel.insert({
      module: 'notice',
      action: 'delete_notice',
      operator_openid: operator._id,
      operator_name: operator.name || '',
      operator_role: operator.role,
      target_desc: id,
      detail: { title: n.title || '' },
      create_time: now,
    });
    return { removed: true };
  }
}

module.exports = NoticeService;
