import type {
  JDProjectNumbers,
  JdAreaNumbers,
  JDCategoryNumbers,
  JDIdNumbers,
} from ".";

/**
 * Each distinct JD Item -- a Project, Area, Category, etc. -- follows the same
 * basic structure.
 *
 * - `jdType` describes which of these it is.
 * - `jdNumber` contains its number.
 * - `jdTitle` contains its title.
 * - `meta` contains any user-defined metadata
 */

export type JDItem =
  | {
      jdType: "project";
      jdNumber: JDProjectNumbers;
      jdTitle: string;
      meta?: Object;
    }
  | {
      jdType: "area";
      jdNumber: JdAreaNumbers;
      jdTitle: string;
      meta?: Object;
    }
  | {
      jdType: "category";
      jdNumber: JDCategoryNumbers;
      jdTitle: string;
      meta?: Object;
    }
  | {
      jdType: "id";
      jdNumber: JDIdNumbers;
      jdTitle: string;
      meta?: Object;
    };
