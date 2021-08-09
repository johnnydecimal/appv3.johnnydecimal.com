import {
  JdSystem,
  JDProjectNumbers,
  JdAreaNumbers,
  JDCategoryNumbers,
  JDIdNumbers,
} from "@types";
import { categoryNumberToAreaNumber } from "utils";
import { idNumberToCategoryNumber } from "utils/idNumberToCategoryNumber/idNumberToCategoryNumber";

export {};
/**
 * JD system checker.
 *
 * The idea is that we validate any of our CRUD operations before we perform
 * them on Userbase.
 *
 * We should also be able to use this same algorithm to check an existing
 * system -- e.g. the system returned by the changeHandler.
 *
 * What are the rules?
 *
 * ## Inserts
 * - Assumes: we have a project open.
 * - Area: not a duplicate.
 * - Category: not a duplicate.
 * - Category: parent area exists.
 * - ID: not a duplicate.
 * - ID: parent category exists.
 *
 * So the question is, what's quicker/nicer/simpler? Probably initially just to
 * build some super simple, re-useable functions that we string together.
 */

export const isAreaDuplicate = (
  jdSystem: JdSystem,
  currentProject: JDProjectNumbers,
  areaToCheck: JdAreaNumbers
): Boolean => {
  if (jdSystem[currentProject]?.areas[areaToCheck]) {
    return true;
  }
  return false;
};

export const isCategoryDuplicate = (
  jdSystem: JdSystem,
  currentProject: JDProjectNumbers,
  categoryToCheck: JDCategoryNumbers
): Boolean => {
  const area = categoryNumberToAreaNumber(categoryToCheck);
  if (
    // prettier-ignore
    jdSystem[currentProject]
      ?.areas[area]
      ?.categories[categoryToCheck]
  ) {
    return true;
  }
  return false;
};

export const isIdDuplicate = (
  jdSystem: JdSystem,
  currentProject: JDProjectNumbers,
  idToCheck: JDIdNumbers
): Boolean => {
  const category = idNumberToCategoryNumber(idToCheck);
  const area = categoryNumberToAreaNumber(category);
  if (
    // prettier-ignore
    jdSystem[currentProject]
    ?.areas[area]
    ?.categories[category]
    ?.ids[idToCheck]
  ) {
    return true;
  }
  return false;
};

export const parentAreaExists = (
  jdSystem: JdSystem,
  currentProject: JDProjectNumbers,
  categoryToCheck: JDCategoryNumbers
): Boolean => {
  const area = categoryNumberToAreaNumber(categoryToCheck);
  if (
    // prettier-ignore
    jdSystem[currentProject]
    ?.areas[area]
  ) {
    return true;
  }
  return false;
};

export const parentCategoryExists = (
  jdSystem: JdSystem,
  currentProject: JDProjectNumbers,
  idToCheck: JDIdNumbers
): Boolean => {
  const category = idNumberToCategoryNumber(idToCheck);
  const area = categoryNumberToAreaNumber(category);
  if (
    // prettier-ignore
    jdSystem[currentProject]
      ?.areas[area]
      ?.categories[category]
  ) {
    return true;
  }
  return false;
};
