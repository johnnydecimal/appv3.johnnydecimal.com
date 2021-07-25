// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// import {
//   JDProjectNumbers,
//   JDAreaNumbers,
//   JDCategoryNumbers,
//   JDIdNumbers,
// } from "@types";

import { InternalJDProject, UserbaseItem } from "@types";

/**
 * # userbaseItemsToInternalJdProject
 *
 * Takes an array of `UserbaseItem[]`s and turns it in to the
 * `InternalJDProject` that we use in this app.
 *
 * ## Assumptions
 *
 * 1. We only ever have a single JD project open in this 'system' at any one
 *    time. That is, the object looks like `{ "001": ... }`, with one single
 *    key at the root which is the `currentProject`.
 *
 */
export const userbaseItemsToInternalJdProject = (
  userbaseItems: UserbaseItem[]
): InternalJDProject => {
  // Okay, crib all this from scratch.tsx
};
