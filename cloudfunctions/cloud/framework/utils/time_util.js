/**
 * 时间工具：统一按东八区（北京时间）计算，不依赖服务器系统时区。
 * 日期一律 "YYYY-MM-DD"；时间点一律毫秒时间戳。
 */
const CN_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 当前毫秒时间戳 */
function now() {
  return Date.now();
}

function pad2(n) {
  return (n < 10 ? '0' : '') + n;
}

/** 毫秒时间戳 -> 北京日期字符串 "YYYY-MM-DD" */
function formatDate(ms) {
  const d = new Date(ms + CN_OFFSET_MS);
  return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
}

function parseDate(dateStr) {
  const p = String(dateStr).split('-').map(Number);
  return { y: p[0], m: p[1], d: p[2] };
}

/** 日期字符串加减天数 */
function addDays(dateStr, n) {
  const p = parseDate(dateStr);
  const utc = Date.UTC(p.y, p.m - 1, p.d) + n * DAY_MS;
  const d = new Date(utc);
  return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
}

function today() {
  return formatDate(now());
}

function tomorrow() {
  return addDays(today(), 1);
}

function yesterday() {
  return addDays(today(), -1);
}

/** 星期几：0=周日 ... 6=周六 */
function dayOfWeek(dateStr) {
  const p = parseDate(dateStr);
  return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
}

function isWeekend(dateStr) {
  const d = dayOfWeek(dateStr);
  return d === 0 || d === 6;
}

/** 当前北京时间的「当天分钟数」0~1439 */
function nowMinutes() {
  const d = new Date(now() + CN_OFFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** "HH:mm" -> 分钟数 */
function timeToMin(hhmm) {
  const p = String(hhmm).split(':').map(Number);
  return p[0] * 60 + p[1];
}

/** 分钟数 -> "HH:mm" */
function minToTime(min) {
  return pad2(Math.floor(min / 60)) + ':' + pad2(min % 60);
}

/**
 * 解析 slot_key "1820_1930" -> { start_min, end_min, start_time, end_time }
 */
function parseSlotKey(slotKey) {
  const m = /^(\d{2})(\d{2})_(\d{2})(\d{2})$/.exec(String(slotKey));
  if (!m) return null;
  const sh = Number(m[1]);
  const sm = Number(m[2]);
  const eh = Number(m[3]);
  const em = Number(m[4]);
  return {
    start_min: sh * 60 + sm,
    end_min: eh * 60 + em,
    start_time: pad2(sh) + ':' + pad2(sm),
    end_time: pad2(eh) + ':' + pad2(em),
  };
}

/** 北京某日 00:00 对应的毫秒时间戳 */
function dateStartTimestamp(dateStr) {
  const p = parseDate(dateStr);
  return Date.UTC(p.y, p.m - 1, p.d) - CN_OFFSET_MS;
}

/** 北京某日某分钟对应的毫秒时间戳 */
function dateMinuteToTimestamp(dateStr, minute) {
  return dateStartTimestamp(dateStr) + minute * 60 * 1000;
}

/** 毫秒时间戳 -> 格式化字符串（默认 Y-M-D h:m:s，北京时间） */
function timestamp2Time(ms, fmt = 'Y-M-D h:m:s') {
  const d = new Date(ms + CN_OFFSET_MS);
  const map = {
    Y: d.getUTCFullYear(),
    M: pad2(d.getUTCMonth() + 1),
    D: pad2(d.getUTCDate()),
    h: pad2(d.getUTCHours()),
    m: pad2(d.getUTCMinutes()),
    s: pad2(d.getUTCSeconds()),
  };
  return String(fmt).replace(/[YMDhms]/g, (c) => map[c]);
}

module.exports = {
  CN_OFFSET_MS,
  DAY_MS,
  now,
  formatDate,
  addDays,
  today,
  tomorrow,
  yesterday,
  dayOfWeek,
  isWeekend,
  nowMinutes,
  timeToMin,
  minToTime,
  parseSlotKey,
  dateStartTimestamp,
  dateMinuteToTimestamp,
  timestamp2Time,
};
