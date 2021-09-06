export const proacidDetector = (item: string): PROACIDDetectorReturn => {
  if (typeof item !== "string") {
    return "error";
  }

  /**
   * Sorted by order-of-probably-most-likely-to-be-called to possibly save the
   * odd millisecond here and there.
   */

  if (item.match(/^\d\d\.\d\d$/)) {
    return "id";
  }

  if (item.match(/^\d\d$/)) {
    return "category";
  }

  if (item.match(/^\d0-\d9$/)) {
    if (item.charAt(0) === item.charAt(3)) {
      return "area";
    }
  }

  if (item.match(/^\d\d\d$/)) {
    return "project";
  }

  return "error";
};
