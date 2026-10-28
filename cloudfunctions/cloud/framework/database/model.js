/**
 * 模型基类（framework 层）：封装数据库读写
 */
const dbUtil = require('./db_util.js');

class Model {
  static async insert(data) {
    return await dbUtil.insert(this.CL, data);
  }

  static async edit(where, data) {
    return await dbUtil.edit(this.CL, where, data);
  }

  static async del(where) {
    return await dbUtil.del(this.CL, where);
  }

  static async count(where) {
    return await dbUtil.count(this.CL, where);
  }

  static async getOne(where, fields = '*', orderBy = {}) {
    return await dbUtil.getOne(this.CL, where, fields, orderBy);
  }

  static async getAll(where, fields = '*', orderBy, size) {
    return await dbUtil.getAll(this.CL, where, fields, orderBy, size);
  }

  static async getList(where, fields = '*', orderBy = {}, page = 1, size = 20) {
    return await dbUtil.getList(this.CL, where, fields, orderBy, page, size);
  }

  /** 存在则更新，不存在则插入（where 会合并进 data；字符串/数字视作 _id） */
  static async insertOrUpdate(where, data) {
    const one = await this.getOne(where);
    if (one) {
      await this.edit(one._id, data);
      return one._id;
    }
    if (typeof where === 'string' || typeof where === 'number') {
      return await this.insert(Object.assign({ _id: where }, data));
    }
    return await this.insert(Object.assign({}, where, data));
  }
}

// 集合名（子类覆盖）
Model.CL = 'no-collection';

module.exports = Model;
