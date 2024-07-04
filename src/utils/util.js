import slash from "slash";

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

export function formatSearchResult(data) {
  const { keyword, matchingFiles } = data;
  if (!Array.isArray(matchingFiles) || !matchingFiles.length) return;

  const result = [];
  let resultData = [];

  resultData = matchingFiles.map((item) => {
    item.filePath = slash(item.filePath);

    return item;
  });

  resultData.forEach((item) => {
    const isInclude = result.findIndex((r) => item.filePath === r.log);
    if (isInclude > -1) {
      const lineText = item.lineText.trim();
      const keywordIndex = lineText.indexOf(keyword);

      result[isInclude].files.push({
        message: keyword,
        frontLabel: lineText.slice(0, keywordIndex),
        endLabel: lineText.slice(keywordIndex + keyword.length),
        log: item.filePath,
        endPos: item.endPos,
        startPos: item.startPos,
        type: "search",
      });
    } else {
      const lastSlashIndex = item.filePath.lastIndexOf("/");
      const lineText = item.lineText.trim();
      const keywordIndex = lineText.indexOf(keyword);

      result.push({
        message:
          lastSlashIndex === -1
            ? item.filePath
            : item.filePath.substring(lastSlashIndex + 1),
        path: item.filePath.substring(0, lastSlashIndex),
        log: item.filePath,
        files: [
          {
            log: item.filePath,
            message: keyword,
            frontLabel: lineText.slice(0, keywordIndex),
            endLabel: lineText.slice(keywordIndex + keyword.length),
            endPos: item.endPos,
            startPos: item.startPos,
            type: "search",
          },
        ],
      });
    }
  });

  return result;
}
