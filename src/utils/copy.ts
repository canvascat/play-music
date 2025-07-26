/**
 *
 * @param {string} text
 * @returns
 */
export function copyText(text: string) {
	return navigator.clipboard.writeText(text);
}
