function removeHtmlTagsPreserveBreaks(html) {
  return html
    .replace(/<(div|p|br|h[1-6])[^>]*>/gi, '\n') // Convert block elements to line breaks
    .replace(/<\/?(div|p|h[1-6])[^>]*>/gi, '\n') // Convert closing block elements to line breaks
    .replace(/<br\s*\/?>/gi, '\n')               // Convert <br> tags to line breaks
    .replace(/<[^>]*>/g, '')                     // Remove remaining HTML tags
    .replace(/\n\s*\n/g, '\n')                   // Remove multiple consecutive line breaks
    .replace(/^\s+|\s+$/gm, '')                  // Trim each line
    .trim();                                     // Trim the entire string
}
export { removeHtmlTagsPreserveBreaks }