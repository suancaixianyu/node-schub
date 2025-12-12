// utils/toc.ts
export interface TocItem {
  level: number
  text: string
  id: string
}

export interface TocData {
  items: TocItem[]
  html: string
}

export function generateTocFromHtml(html: string): TocData {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const toc: TocItem[] = []

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1))
    const text = heading.textContent?.trim() || `标题 ${index}`
    let id = heading.getAttribute('id') || `heading-${index}`

    // Ensure the heading has an id
    heading.setAttribute('id', id)

    toc.push({ level, text, id })
  })

  return {
    items: toc,
    html: doc.body.innerHTML, // Return the modified HTML
  }
}
