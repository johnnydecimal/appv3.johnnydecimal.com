import {
  JdSystem,
  JdProjectNumbers,
  JdAreaNumbers,
  JdCategoryNumbers,
  JdIdNumbers,
  JdItem,
} from "@types";
import { categoryNumberToAreaNumber } from "utils";
import { idNumberToCategoryNumber } from "utils/idNumberToCategoryNumber/idNumberToCategoryNumber";

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

export const areaIsNotDuplicate = (
  jdSystem: JdSystem,
  currentProject: JdProjectNumbers,
  areaToCheck: JdAreaNumbers
): Boolean => {
  if (jdSystem[currentProject]?.areas[areaToCheck]) {
    return false;
  }
  return true;
};

export const categoryIsNotDuplicate = (
  jdSystem: JdSystem,
  currentProject: JdProjectNumbers,
  categoryToCheck: JdCategoryNumbers
): Boolean => {
  const area = categoryNumberToAreaNumber(categoryToCheck);
  if (
    // prettier-ignore
    jdSystem[currentProject]
      ?.areas[area]
      ?.categories[categoryToCheck]
  ) {
    return false;
  }
  return true;
};

export const idIsNotDuplicate = (
  jdSystem: JdSystem,
  currentProject: JdProjectNumbers,
  idToCheck: JdIdNumbers
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
    return false;
  }
  return true;
};

export const parentAreaExists = (
  jdSystem: JdSystem,
  currentProject: JdProjectNumbers,
  categoryToCheck: JdCategoryNumbers
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
  currentProject: JdProjectNumbers,
  idToCheck: JdIdNumbers
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

export const isAreaNumber = (areaNumber: JdAreaNumbers): boolean => {
  return /^(\d)0-(\1)9$/.test(areaNumber);
};

export const isCategoryNumber = (
  categoryNumber: JdCategoryNumbers
): boolean => {
  return /^\d\d$/.test(categoryNumber);
};

export const isIdNumber = (idNumber: JdIdNumbers): boolean => {
  return /^\d\d\.\d\d$/.test(idNumber);
};

export const jdSystemInsertCheck = (
  jdSystem: JdSystem,
  currentProject: JdProjectNumbers,
  itemToCheck: JdItem
):
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
    } => {
  switch (itemToCheck.jdType) {
    case "project":
      // We don't handle this here. Error.
      return {
        success: false,
        message: "We don't handle project insertion here.",
      };

    case "area":
      // Check if it's actually an area number
      if (!isAreaNumber(itemToCheck.jdNumber)) {
        return {
          success: false,
          message: "You tried to add an area with an invalid area number.",
        };
      }

      // Check if the area is a duplicate
      if (areaIsNotDuplicate(jdSystem, currentProject, itemToCheck.jdNumber)) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          message: "The area already exists.",
        };
      }

    case "category":
      // Check if it's actually a category number
      if (!isCategoryNumber(itemToCheck.jdNumber)) {
        return {
          success: false,
          message:
            "You tried to add a category with an invalid category number.",
        };
      }

      if (
        categoryIsNotDuplicate(jdSystem, currentProject, itemToCheck.jdNumber)
      ) {
        if (parentAreaExists(jdSystem, currentProject, itemToCheck.jdNumber)) {
          return {
            success: true,
          };
        } else {
          return {
            success: false,
            message: "Parent area does not exist for this category.",
          };
        }
      } else {
        return {
          success: false,
          message: "The category already exists.",
        };
      }

    case "id":
      // Check it's actually an ID number
      if (!isIdNumber(itemToCheck.jdNumber)) {
        return {
          success: false,
          message: "You tried to add an ID with an invalid ID number.",
        };
      }

      if (idIsNotDuplicate(jdSystem, currentProject, itemToCheck.jdNumber)) {
        if (
          parentCategoryExists(jdSystem, currentProject, itemToCheck.jdNumber)
        ) {
          return {
            success: true,
          };
        } else {
          return {
            success: false,
            message: "Parent category does not exist for this ID.",
          };
        }
      } else {
        return {
          success: false,
          message: "The ID already exists.",
        };
      }

    default:
      return {
        success: false,
        message: "You managed to hit the default case, which isn't possible.",
      };
  }
};
