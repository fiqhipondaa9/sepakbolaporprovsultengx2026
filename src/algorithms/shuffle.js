/**
 * Fisher-Yates (Knuth) Shuffle Algorithm
 * PRD: §9.1 Algoritma Pengundian
 */

export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
