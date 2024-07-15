const { relativeTimes } = require("./date.js");

module.exports = {
  parseLog(logData) {
    try {
      let result = [];
      const logs = logData.split("\n").filter((log) => !!log);
  
      logs.forEach((log) => {
        if (/^[0-9a-z]{7,40}/.test(log)) {
          const regex =
            /^([a-f0-9]+) - ([a-zA-Z0-9]+), (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) : (.*)$/;
  
          const match = regex.exec(log);
  
          if(match) {
            result.push({
              hash: match[1],
              author: match[2],
              datetime: match[3],
              path: relativeTimes(match[3]),
              message: match[4],
              files: [],
            });
          }
        } else {
          const lastLog = result[result.length - 1];
          const lastSlashIndex = log.lastIndexOf("/");
  
          lastLog.files.push({
            message: lastSlashIndex === -1 ? log : log.substring(lastSlashIndex + 1),
            path: log.substring(0, lastSlashIndex),
            log,
          });
        }
      });
  
      return result.filter((item) => item.files.length);
    } catch (error) {
      console.log(error)
    }
  },
};
