/**
 * 
 * @param {string} text 
 * @returns 
 */
export function copyText(text) {
  return navigator.clipboard.writeText(text);
}
