/**
 * 云函数调用统一封装：wx.cloud.callFunction({name:'cloud', data:{route, ...params}})
 */
function call(route, data = {}, options = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'cloud',
      data: Object.assign({ route: route }, data),
      success: (res) => {
        const r = res.result || {};
        if (r.code === 200) {
          resolve(r.data);
        } else {
          if (!options.silent) {
            wx.hideLoading();
            wx.showToast({ title: r.msg || '请求失败', icon: 'none', duration: 2500 });
          }
          reject(r);
        }
      },
      fail: (err) => {
        if (!options.silent) {
          wx.hideLoading();
          wx.showToast({ title: '网络异常，请重试', icon: 'none' });
        }
        reject(err);
      },
    });
  });
}

module.exports = {
  call: call,
};
