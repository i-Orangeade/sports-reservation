/**
 * 控制器基类（framework 层）
 */
class Controller {
  constructor(route, openId, user, role, event) {
    this._route = route; // 路由
    this._openId = openId; // 用户 openid
    this._user = user; // 用户记录（可能为 null）
    this._role = role; // 当前有效角色
    this._event = event; // 完整入参
    this._request = event || {}; // 数据参数
  }
}

module.exports = Controller;
