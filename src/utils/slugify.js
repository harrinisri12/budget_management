/**
 * Helper utility to convert a category or subcategory name into a slugified format
 * for automatic Proposal ID generation matching PostgreSQL slugify_text().
 * Examples:
 * "Lab and Equipment" -> "Lab-and-Equipment"
 * "Guest Lecture" -> "Guest-Lecture"
 * "CSEA" -> "CSEA"
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
