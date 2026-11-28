// Blob을 브라우저 다운로드로 저장한다 (임시 링크를 만들어 클릭한다)
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  // 클릭 직후 바로 해제하면 일부 브라우저에서 다운로드가 취소될 수 있어 잠시 뒤 해제한다
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
