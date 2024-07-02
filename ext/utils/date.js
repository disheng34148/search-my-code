const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const zhCN = require("dayjs/locale/zh-cn");

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

module.exports = {
  relativeTimes(timeStr) {
    const time = dayjs(timeStr);

    return time.from(dayjs());
  },
};
