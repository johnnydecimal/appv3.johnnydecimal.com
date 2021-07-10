import type { JDArea, JDCategory, JDID } from ".";

/**
 * Each distinct JD Item -- a Project, Area, Category, etc. -- follows the same
 * basic structure.
 *
 * - `jdType` describes which of these it is.
 * - `jdNumber` contains its number.
 * - `jdTitle` contains its title.
 * - `meta` contains any user-defined metadata, which follows the item
 *   (this has yet to be defined).
 *
 */
export interface JDItem {
  jdType: "area" | "category" | "id";
  jdNumber: JDArea | JDCategory | JDID;
  jdTitle: string;
  meta?: any; // This is an object with user-defined properties.
}
