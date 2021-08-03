import { JDItem } from "@types";

type PROACIDDetectorReturn =
  | "project"
  | "area"
  | "category"
  | "id"
  | { error: string };

// == MOVE ME EXTERNALLY WHEN DONE
const proacidDetector = (item: any): PROACIDDetectorReturn => {
  if (item.match(/^\d\d\d$/)) {
    return "project";
  }

  if (item.match(/^\d\d-\d\d$/)) {
    if (item.charAt(1) === item.charAt(3)) {
      return "area";
    }
  }

  // The default. Delete when done and TS will tell you if you've fucked up.
  return { error: "Default" };
};

/**
 * # insert
 *
 * A very lenient inserter. Throw it anything and it'll either insert it, or
 * tell you that you're dumb. But it'll do that gracefully so that you can
 * handle the rejection in your own way.
 *
 */
export const insert = (item: JDItem) => {
  // So what is it?
  const proacid = proacidDetector(item);
};
