/**
 * Generates a compact list of page numbers for pagination UI.
 * Numbers far from the current page are replaced with "..." ellipsis.
 *
 * Example: getPageNumbers(5, 10) → [1, "...", 3, 4, 5, 6, 7, "...", 10]
 *
 * @param current - The current active page (1-indexed)
 * @param total   - Total number of pages
 * @param delta   - How many pages to show on each side of current (default: 2)
 */
export function getPageNumbers(
  current: number,
  total: number,
  delta = 2,
): (number | string)[] {
  const pages: (number | string)[] = [];

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return pages;
}
