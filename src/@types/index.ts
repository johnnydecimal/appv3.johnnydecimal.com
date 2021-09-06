// export type { JdSystem } from "./JdSystem";
// export type { JdProjectNumbers } from "./JdProjectNumbers";
// export type { JdAreaNumbers } from "./JdAreaNumbers";
// export type { JdCategoryNumbers } from "./JdCategoryNumbers";
// export type { JdIdNumbers } from "./JdIdNumbers";
// export type { JdItem } from "./JdItem";

// export type {
//   JDUserProfile,
//   UserbaseData,
//   UserbaseError,
//   UserbaseItem,
// } from "./Userbase";

import { Item } from "userbase-js";

export type {
  AuthMachineContext,
  AuthMachineEvent,
} from "../components/authentication/machine/auth.machine";

export type {
  DatabaseMachineContext,
  DatabaseMachineEvent,
} from "../components/database/machine/database.machine";

// -=- Database  --=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--
/**
 * `Item` is the base Userbase item type. We extend it by specifying that the
 * `item` property must be a `JdItem`.
 */
export interface UserbaseItem extends Item {
  item: JdItem;
}
