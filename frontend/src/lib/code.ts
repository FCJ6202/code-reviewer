/** Splits code into display lines, ignoring one trailing newline so it doesn't add an empty line. */
export function splitLines(code: string): string[] {
  if (code === '') return [];
  return code.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
}

export function countLines(code: string): number {
  return splitLines(code).length;
}

/** UTF-8 size, the same unit the API's 200 KB limit is measured in. */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}
