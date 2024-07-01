import slash from 'slash'

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
  if(!Array.isArray(data) || !data.length) return;

  const result = []
  let resultData = []

  resultData = data.map(item => {
    item.filePath = slash(item.filePath)

    return item
  })

  console.log(resultData, 'vvvvvvvvvvvvv')

  resultData.forEach(item => {
    const isInclude = result.findIndex(r => item.filePath === r.log)
    if(isInclude > -1) {
      const lastSlashIndex = item.filePath.lastIndexOf('/');

      result[isInclude].files.push({
        message: lastSlashIndex === -1 ? item.filePath : item.filePath.substring(lastSlashIndex + 1),
        path: item.filePath.substring(0, lastSlashIndex),
        log: item.filePath,
        endPos: item.endPos,
        startPos: item.startPos
      })
    } else {
      const lastSlashIndex = item.filePath.lastIndexOf('/');

      result.push({
        message: lastSlashIndex === -1 ? item.filePath : item.filePath.substring(lastSlashIndex + 1),
        path: item.filePath.substring(0, lastSlashIndex),
        log: item.filePath,
        files: [{
          log: item.filePath,
          message: item.lineText.trim(),
          endPos: item.endPos,
          startPos: item.startPos
        }]
      })
    }
  })

  return result
}