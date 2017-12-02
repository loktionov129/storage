const now = new Date();
const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

const utc2now = (utc) => new Date((utc.getTime() - (new Date).getTimezoneOffset() * 60000));

console.warn({
  now,
  utc,
  utc2now: utc2now(utc)
});

/*
now:     Wed Oct 25 2017 21:55:40 GMT+0700 (+07) {}
utc:     Wed Oct 25 2017 14:55:40 GMT+0700 (+07) {}
utc2now: Wed Oct 25 2017 21:55:40 GMT+0700 (+07) {}
*/

const dateToYMD = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  
  return `${y}-${(m <= 9 ? '0' + m : m)}-${(d <= 9 ? '0' + d : d)}`;
};

const dateToHMS = (date) => {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  
  return `${(h <= 9 ? '0' + h : h)}:${(m <= 9 ? '0' + m : m)}:${(s <= 9 ? '0' + s : s)}`;
};

const dateToYMDHMS = (date) => {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  
  return `${dateToYMD(date)} ${dateToHMS(date)}`;
};
