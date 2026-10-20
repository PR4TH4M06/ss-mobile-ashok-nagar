export function hashText(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "r" + (h >>> 0).toString(36);
}

export function tooSimilar(next: string, previous: string[]): boolean {
  const words = (s: string) =>
    s
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
  const nw = words(next);
  if (!nw.length) return true;
  return previous.some((old) => {
    const ow = new Set(words(old));
    const hit = nw.filter((w) => ow.has(w)).length;
    return hit / nw.length > 0.7;
  });
}
