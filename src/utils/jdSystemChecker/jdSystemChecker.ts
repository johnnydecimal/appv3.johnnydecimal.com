import { JdSystem, JDAreaNumbers, JDProjectNumbers } from "@types";

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
  areaToCheck: JDAreaNumbers
) => {
  if (jdSystem[currentProject]?.areas[areaToCheck]) {
    return true;
  }
};
