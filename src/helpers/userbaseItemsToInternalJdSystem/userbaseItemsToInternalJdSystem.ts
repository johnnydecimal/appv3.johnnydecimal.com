// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// import {
//   JDProjectNumbers,
//   JDAreaNumbers,
//   JDCategoryNumbers,
//   JDIdNumbers,
// } from "@types";

import { InternalJDSystem, JDProjectNumbers, UserbaseItem } from "@types";

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
  /**
   * Set up the base object. We'll return this even if there are no AC.IDs.
   */
  const internalJDSystem: InternalJDSystem = {
    [currentProjectNumber]: {
      title: currentProjectTitle,
      areas: {},
    },
  };

  return internalJDSystem;
};
