/**
 * These are the types used by our internal representation of the JD system as
 * created by `helpers/userbaseItemsToInternalJdProject`.
 */

import { JDProjectNumbers } from "./JDProjectNumbers";

interface InternalJDId {
  title: string;
  meta?: { [key: string]: any };
}

interface InternalJDCategory {
  title: string;
  meta?: { [key: string]: any };
  ids?: { [key: string]: InternalJDId };
}

interface InternalJDArea {
  title: string;
  meta?: { [key: string]: any };
  categories?: { [key: string]: InternalJDCategory };
}

interface InternalJDProject {
  title: string;
  meta?: { [key: string]: any };
  areas?: { [key: string]: InternalJDArea };
}

/**
 * This one must be a type, an interface generates an error.
 * https://stackoverflow.com/questions/51659420/consider-using-a-mapped-object-type-instead-whats-a-mapped-object-type-and#51659490
 */
export type InternalJDSystem = {
  [K in JDProjectNumbers]: InternalJDProject;
};
