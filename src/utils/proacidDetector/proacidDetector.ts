type PROACIDDetectorReturn = "project" | "area" | "category" | "id" | "error";

export const proacidDetector = (item: string): PROACIDDetectorReturn => {
  if (typeof item !== "string") {
    return "error";
  }

  if (item.match(/^\d\d\d$/)) {
    return "project";
  }

  if (item.match(/^\d0-\d9$/)) {
    if (item.charAt(0) === item.charAt(3)) {
      return "area";
    }
  }

  if (item.match(/^\d\d$/)) {
    return "category";
  }

  if (item.match(/^\d\d\.\d\d$/)) {
    return "id";
  }

  // The default. Delete when done and TS will tell you if you've fucked up.
  return "error";
};
