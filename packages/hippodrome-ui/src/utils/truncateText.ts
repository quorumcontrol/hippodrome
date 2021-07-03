export const endTruncateText = (text: string, maximumLetters: number) => {
  const truncatedText = []
  for (let i = 0; i < maximumLetters; i += 1) {
    truncatedText.push(text[i])
  }
  if (text.length <= maximumLetters) {
    return text
  }
  return `${truncatedText.join("")}... `
}

export const centeredTruncateText = (text: string, maximumLetters: number) => {
  const truncatedText = [
    text.slice(0, maximumLetters),
    "......",
    text.slice(text.length - maximumLetters, text.length),
  ]
  return truncatedText.join("")
}
