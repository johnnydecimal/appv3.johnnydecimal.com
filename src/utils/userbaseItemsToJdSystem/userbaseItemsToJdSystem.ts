// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { categoryNumberToAreaNumber } from "utils";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { UserbaseItem } from "@types";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * # userbaseItemsToJdSystem
 *
 * Takes an array of `UserbaseItem[]`s and turns it in to the
 * `JdSystem` that we use in this app.
 *
 * How does this feel for a return type:
 * {
 *   success: { // JdSystem in here },
 *   error:   { // error here },
 * }
 */

type UserbaseItemsToJdSystemResult =
  | { success: true; data: JdSystem }
  | { success: false; error: string };

export const userbaseItemsToJdSystem = (
  userbaseItems: UserbaseItem[]
): UserbaseItemsToJdSystemResult => {
  /**
   * Do some timings in dev. #TODO: remove later.
   */
  const startTime = window.performance.now();

  /**
   * Set up the base object.
   */
  const jdSystem: JdSystem = {};

  /**
   * Set up variables that we'll use to loop over `userbaseItems[]`.
   */
  var i = 0,
    len = userbaseItems.length;

  /**
   * New! Zeroth pass: get the project itself and create the base object.
   */
  let projectNumber: JdProjectNumbers = "000";
  while (i < len) {
    const item = userbaseItems[i].item;
    if (item.jdType === "project") {
      projectNumber = item.jdNumber as JdProjectNumbers;
      const projectTitle = item.jdTitle;
      jdSystem[projectNumber] = {
        title: projectTitle,
        areas: {},
      };
      break; // There can only be one project in userbaseItems[].
    }
    i++;
  }

  /**
   * First pass: get all of the items which are an area.
   *
   * Note that testing shows that this entire area/category/ID generation from
   * a full 10,110-record userbaseItems[] takes <50ms. So we're not going to
   * bother trying to optimise by exiting early when we have all of the areas,
   * for example.
   */
  i = 0;
  while (i < len) {
    const item = userbaseItems[i].item;
    if (item.jdType === "area") {
      const areaNumber = item.jdNumber as JdAreaNumbers;
      const areaTitle = item.jdTitle;
      /**
       * The forcing-TS-to-believe! here assumes that we haven't screwed up
       * elsewhere and somehow added an area to a project that doesn't exist.
       * Is that even possible with the current model? I don't think so.
       */
      // prettier-ignore
      jdSystem[projectNumber]!
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
      const categoryNumber = item.jdNumber as JdCategoryNumbers;
      const categoryTitle = item.jdTitle;
      const areaNumber = categoryNumberToAreaNumber(categoryNumber);
      /**
       * The forcing-TS-to-believe! here assumes that we haven't screwed up
       * elsewhere and created a category without an associated area, or deleted
       * an area with existing categories. The functions where we do that will
       * need to be 100%.
       */
      // prettier-ignore
      jdSystem[projectNumber]!
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
      const categoryNumber: JdCategoryNumbers = item.jdNumber.substr(
        0,
        2
      ) as JdCategoryNumbers;
      const areaNumber = categoryNumberToAreaNumber(categoryNumber);
      // prettier-ignore
      jdSystem[projectNumber]!
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
      `Creating jdSystem from userbaseItem[] took ${endTime - startTime}ms.`
    );
  }

  /**
   * If we reach this point, it's worked.
   */
  return {
    success: true,
    data: jdSystem,
  };
};
