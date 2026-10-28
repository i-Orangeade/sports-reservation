/**
 * 静态检查：
 *  1) 云函数全量 require 依赖链完整性
 *  2) route.js 与 controller action 一致性
 *  3) 小程序端 request 调用 route 名与 route.js 一致性
 */
const fs = require('fs');
const path = require('path');
const { test, assert } = require('./_lib.js');

const ROOT = path.resolve(__dirname, '..');
const CF_DIR = path.join(ROOT, 'cloudfunctions', 'cloud');
const MP_DIR = path.join(ROOT, 'miniprogram');

function listJs(dir) {
  const out = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      if (name === 'node_modules' || name === '.git') continue;
      const p = path.join(d, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith('.js')) out.push(p);
    }
  }
  walk(dir);
  return out;
}

// ---------- 1. require 链完整性 ----------
test('云函数全量 require 依赖链加载无缺失', () => {
  const files = listJs(CF_DIR);
  const errors = [];
  for (const f of files) {
    try {
      delete require.cache[require.resolve(f)];
      require(f);
    } catch (e) {
      errors.push(path.relative(CF_DIR, f) + ' -> ' + e.message);
    }
  }
  assert(errors.length === 0, '以下模块 require 失败：\n' + errors.join('\n'));
});

// ---------- 2. route.js 与 controller 一致性 ----------
test('route.js 每条路由的 controller/action 均存在且为函数', () => {
  const routes = require(path.join(CF_DIR, 'config', 'route.js'));
  const errors = [];
  for (const route in routes) {
    const def = routes[route];
    const ctrlPath = path.join(CF_DIR, 'project', 'controller', def.controller + '.js');
    if (!fs.existsSync(ctrlPath)) {
      errors.push(route + ' -> 控制器文件不存在 ' + def.controller + '.js');
      continue;
    }
    delete require.cache[require.resolve(ctrlPath)];
    const Ctrl = require(ctrlPath);
    if (typeof Ctrl !== 'function') {
      errors.push(route + ' -> ' + def.controller + ' 未导出构造函数');
      continue;
    }
    if (typeof Ctrl.prototype[def.action] !== 'function') {
      errors.push(route + ' -> ' + def.controller + ' 缺少 action 方法 ' + def.action);
    }
  }
  assert(errors.length === 0, '路由与控制器不一致：\n' + errors.join('\n'));
});

// ---------- 3. 小程序端 route 名与 route.js 一致性 ----------
test('小程序端 request 调用的 route 名全部存在于 route.js', () => {
  const routes = require(path.join(CF_DIR, 'config', 'route.js'));
  const routeKeys = Object.keys(routes);
  const files = listJs(MP_DIR);
  const used = new Set();
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const re = /(?:request\.)?call\(\s*['"]([a-z][a-z0-9_/]*)['"]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      used.add(m[1]);
    }
  }
  const missing = [];
  for (const r of used) {
    if (routeKeys.indexOf(r) < 0) missing.push(r);
  }
  assert(missing.length === 0, '以下前端 route 在 route.js 中不存在：' + missing.join(', '));
});

test('route.js 中存在但前端未使用的路由（P1/P2/后端专用，属正常）', () => {
  // 仅记录，不失败：config/get、config/set、config/activity_pic、message/subscribe、
  // venue/close_list、hr/admin_assign、job/expire、job/notify 等属后端/触发器/P1/P2。
  const routes = require(path.join(CF_DIR, 'config', 'route.js'));
  const files = listJs(MP_DIR);
  const used = new Set();
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const re = /(?:request\.)?call\(\s*['"]([a-z][a-z0-9_/]*)['"]/g;
    let m;
    while ((m = re.exec(src)) !== null) used.add(m[1]);
  }
  const unused = Object.keys(routes).filter((r) => !used.has(r) && r.indexOf('job/') !== 0);
  // 本用例只打印，不判失败（信息性）。
  console.log('    [info] 前端未直接调用的 route：' + (unused.join(', ') || '（无）'));
  assert(true, '');
});
