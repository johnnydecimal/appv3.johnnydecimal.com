import { categoryNumberToAreaNumber } from "utilities/categoryNumberToAreaNumber/categoryNumberToAreaNumber";

import {
  InternalJDSystem,
  JDProjectNumbers,
  JDAreaNumbers,
  UserbaseItem,
  JDCategoryNumbers,
} from "@types";
import { current } from "immer";

/**
 * # userbaseItemsToInternalJdSystem
 *
 * Takes an array of `UserbaseItem[]`s and turns it in to the
 * `InternalJDSystem` that we use in this app.
 *
 * ## Assumptions
 *
 * 1. We only ever have a single JD project open in this 'system' at any one
 *    time. That is, the object looks like `{ "001": ... }`, with one single
 *    key at the root which is the `currentProject`.
 *    ... although at this stage we just renamed it to `...System`, and all of
 *        the type shapes do allow multiple projects, so this may no longer be
 *        valid.
 *
 */
export const userbaseItemsToInternalJdSystem = (
  currentProjectNumber: JDProjectNumbers,
  currentProjectTitle: string,
  userbaseItems: UserbaseItem[]
): InternalJDSystem => {
  console.log(
    "userbaseItemsToInternalJdSystem called with:",
    currentProjectNumber,
    currentProjectTitle,
    userbaseItems
  );
  /**
   * Do some timings in dev. #TODO: remove later.
   */
  const startTime = window.performance.now();

  /**
   * Set up the base object. We'll return this even if there are no AC.IDs.
   */
  const internalJDSystem: InternalJDSystem = {
    [currentProjectNumber]: {
      title: currentProjectTitle,
      areas: {},
    },
  };

  /**
   * Set up variables that we'll use to loop over `userbaseItems[]`.
   */
  var i = 0,
    len = userbaseItems.length;

  /**
   * First pass: get all of the items which are an area.
   *
   * Note that testing shows that this entire area/category/ID generation from
   * a full 10,110-record userbaseItems[] takes <50ms. So we're not going to
   * bother trying to optimise by exiting early when we have all of the areas,
   * for example.
   */
  while (i < len) {
    const item = userbaseItems[i].item;
    if (item.jdType === "area") {
      const areaNumber = userbaseItems[i].item.jdNumber as JDAreaNumbers;
      const areaTitle = userbaseItems[i].item.jdTitle;
      /**
       * The forcing-TS-to-believe! here assumes that we haven't screwed up
       * elsewhere and somehow added an area to a project that doesn't exist.
       * Is that even possible with the current model? I don't think so.
       */
      // prettier-ignore
      internalJDSystem[currentProjectNumber]!
        .areas[areaNumber] = {
          title: areaTitle,
          categories: {},
        };
    }
    i++;
  }

  /**
   * Second pass: get the categories.
   */
  i = 0;
  while (i < len) {
    const item = userbaseItems[i].item;
    if (item.jdType === "category") {
      const categoryNumber = item.jdNumber as JDCategoryNumbers;
      const categoryTitle = userbaseItems[i].item.jdTitle;
      const areaNumber = categoryNumberToAreaNumber(categoryNumber);
      /**
       * The forcing-TS-to-believe! here assumes that we haven't screwed up
       * elsewhere and created a category without an associated area, or deleted
       * an area with existing categories. The functions where we do that will
       * need to be 100%.
       */
      // prettier-ignore
      internalJDSystem[currentProjectNumber]!
        .areas[areaNumber]!
        .categories[categoryNumber] = {
          title: categoryTitle,
          ids: {},
        };
    }
    i++;
  }

  /**
   * Third pass: get the IDs.
   */
  i = 0;
  while (i < len) {
    const item = userbaseItems[i].item;
    if (item.jdType === "id") {
      const idNumber = item.jdNumber;
      const idTitle = item.jdTitle;
      const categoryNumber: JDCategoryNumbers = item.jdNumber.substr(
        0,
        2
      ) as JDCategoryNumbers;
      const areaNumber = categoryNumberToAreaNumber(categoryNumber);
      // prettier-ignore
      internalJDSystem[currentProjectNumber]!
        .areas[areaNumber]!
        .categories[categoryNumber]!
        .ids[idNumber] = {
          title: idTitle,
        };
    }
    i++;
  }

  const endTime = window.performance.now();
  if (process.env.NODE_ENV === "development") {
    console.log(
      `Creating internalJDSystem from userbaseItem[] took ${
        endTime - startTime
      }ms.`
    );
  }

  return internalJDSystem;
};
