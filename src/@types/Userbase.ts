// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { Item, UserProfile } from "userbase-js";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { JDItem } from ".";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// -=- Auth   --=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--
/**
 * `JDUserProfile` is the base profile interface with our custom stuff.
 */
export interface JDUserProfile extends UserProfile {
  currentDatabase: string;
}

// -=- Database  --=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--
/**
 * `Item` is the base Userbase item type. We extend it by specifying that the
 * `item` property must be a `JDItem`.
 */
export interface UserbaseItem extends Item {
  item: JDItem;
}

/**
 * The `UserbaseData` array is an array of `UserbaseItem`s as returned by
 * `userbase.openDatabase()`.
 */
export type UserbaseData = UserbaseItem[];

// -=- Misc   --=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--
/**
 * `UserbaseError` is the shape of all errors returned by the Userbase API.
 */
export interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}
