/**
 * Avatar initials: first letter of the first and last word, e.g. "Nguyễn Văn An" -> "NA", "An" -> "A".
 * Uses the first grapheme (Intl.Segmenter) so a decomposed "Ẫ" (letter + combining marks) stays whole.
 */
export function initials(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = (word: string) =>
    new Intl.Segmenter().segment(word)[Symbol.iterator]().next().value
      ?.segment ?? "";
  const letters =
    words.length === 1
      ? first(words[0])
      : first(words[0]) + first(words[words.length - 1]);
  return letters.toLocaleUpperCase();
}
