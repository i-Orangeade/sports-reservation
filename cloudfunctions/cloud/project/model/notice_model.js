/**
 * notices 公告表
 */
const BaseModel = require('./base_model.js');

class NoticeModel extends BaseModel {}

NoticeModel.CL = 'notices';

NoticeModel.DB_STRUCTURE = {
  _id: 'string',
  title: 'string',
  content: 'string',
  status: 'string',
  author_openid: 'string',
  author_name: 'string',
  publish_time: 'number',
  update_time: 'number',
};

NoticeModel.STATUS = { PUBLISHED: 'published', DELETED: 'deleted' };

module.exports = NoticeModel;
