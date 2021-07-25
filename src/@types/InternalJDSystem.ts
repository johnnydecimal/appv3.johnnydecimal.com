/**
 * These are the types used by our internal representation of the JD system as
 * created by `helpers/userbaseItemsToInternalJdProject`.
 */

import { JDAreaNumbers, JDCategoryNumbers, JDIdNumbers } from "@types";
import { JDProjectNumbers } from "./JDProjectNumbers";

interface InternalJDId {
  title: string;
  meta?: { [key: string]: any };
}

type InternalJDCategory = {
  title: string;
  meta?: { [key: string]: any };
  ids?: { [K in JDIdNumbers]?: InternalJDId };
};

type InternalJDArea = {
  title: string;
  meta?: { [key: string]: any };
  categories?: { [K in JDCategoryNumbers]?: InternalJDCategory };
};

type InternalJDProject = {
  title: string;
  meta?: { [key: string]: any };
  areas?: { [K in JDAreaNumbers]?: InternalJDArea };
};

/**
 * This one must be a type, an interface generates an error.
 * https://stackoverflow.com/questions/51659420/consider-using-a-mapped-object-type-instead-whats-a-mapped-object-type-and#51659490
 */
export type InternalJDSystem = {
  [K in JDProjectNumbers]?: InternalJDProject;
};

export const test: InternalJDSystem = {
  "001": {
    title: "project",
  },
};
