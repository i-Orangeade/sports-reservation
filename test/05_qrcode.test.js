/**
 * 二维码生成器纯函数测试（加载真实 miniprogram/utils/qrcode.js 的 createQrCode）
 */
const path = require('path');
const { test, assert, assertEqual } = require('./_lib.js');
const qrcode = require(path.resolve(__dirname, '../miniprogram/utils/qrcode.js'));

test('createQrCode 生成合法二维码矩阵', () => {
  const qr = qrcode.createQrCode('gymreserve-token-abc123', 'M');
  const count = qr.getModuleCount();
  assert(count > 0, 'moduleCount 应大于 0');
  assert(count % 4 === 1, 'moduleCount 应为 4n+17 形式');
  // 应包含黑白两种模块
  let dark = 0;
  let light = 0;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) dark++;
      else light++;
    }
  }
  assert(dark > 0, '应存在深色模块');
  assert(light > 0, '应存在浅色模块');
});

test('不同内容生成不同二维码', () => {
  const a = qrcode.createQrCode('token-A', 'M');
  const b = qrcode.createQrCode('token-B', 'M');
  const n = a.getModuleCount();
  let diff = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (a.isDark(r, c) !== b.isDark(r, c)) diff++;
    }
  }
  assert(diff > 0, '不同 token 应生成不同二维码');
});

test('超长内容抛出异常', () => {
  let threw = false;
  try {
    qrcode.createQrCode('x'.repeat(10000), 'M');
  } catch (e) {
    threw = true;
  }
  assert(threw, '超长内容应抛出异常');
});
