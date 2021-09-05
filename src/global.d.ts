// export type {
//     JdProjectNumbers,
//     JdAreaNumbers,
//     JdCategoryNumbers,
//     JdIdNumbers,
//     JdItem
// } from '@types'

/**
 * JdProjectNumbers is a sample of project numbers to help us in dev.
 */
type JdProjectNumbers =
  | "000"
  | "001"
  | "002"
  | "003"
  | "004"
  | "005"
  | "006"
  | "007"
  | "008"
  | "009"

/**
* JdAreaNumbers is the type which is all possible area numbers.
*/
type JdAreaNumbers =
  | "00-09"
  | "10-19"
  | "20-29"
  | "30-39"
  | "40-49"
  | "50-59"
  | "60-69"
  | "70-79"
  | "80-89"
  | "90-99";

/**
* JdCategoryNumbers is the type which is all possible category numbers.
*/
type JdCategoryNumbers =
  | "00"
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"

/**
 * JdIdNumbers is a sample of ID numbers to help us in dev.
 *
 * Edit: no it isn't, because now you know how TypeScript works, that's
 * pointless and probably just taking CPU cycles. We put some indicative IDs
 * here to help us develop.
 */
type JdIdNumbers =
  | "00.00"
  | "00.01"
  | "00.02"
  | "00.03"
  | "00.04"
  | "00.05"
  | "00.06"
  | "00.07"
  | "00.08"
  | "00.09"
  | "99.90"
  | "99.91"
  | "99.92"
  | "99.93"
  | "99.94"
  | "99.95"
  | "99.96"
  | "99.97"
  | "99.98"
  | "99.99";

interface InternalJDId {
  title: string;
  meta?: { [key: string]: any };
}

type InternalJDCategory = {
  title: string;
  ids: { [K in JdIdNumbers]?: InternalJDId };
  meta?: { [key: string]: any };
};

type InternalJDArea = {
  title: string;
  categories: { [K in JdCategoryNumbers]?: InternalJDCategory };
  meta?: { [key: string]: any };
};

type InternalJDProject = {
  title: string;
  areas: { [K in JdAreaNumbers]?: InternalJDArea };
  meta?: { [key: string]: any };
};

/**
 * This one must be a type, an interface generates an error.
 * https://stackoverflow.com/questions/51659420/consider-using-a-mapped-object-type-instead-whats-a-mapped-object-type-and#51659490
 */
type JdSystem = {
  [K in JdProjectNumbers]?: InternalJDProject;
};

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// -=- Auth   --=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--
/**
 * `JDUserProfile` is the base profile interface with our custom stuff.
 */
interface JDUserProfile extends UserProfile {
  currentProject: string;
}

// -=- Database  --=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--
/**
 * `Item` is the base Userbase item type. We extend it by specifying that the
 * `item` property must be a `JdItem`.
 */
interface UserbaseItem extends Item {
  item: JdItem;
}

/**
 * The `UserbaseData` array is an array of `UserbaseItem`s as returned by
 * `userbase.openDatabase()`.
 */
type UserbaseData = UserbaseItem[];

// -=- Misc   --=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--
/**
 * `UserbaseError` is the shape of all errors returned by the Userbase API.
 */
interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

/**
 * Each distinct JD Item -- a Project, Area, Category, etc. -- follows the same
 * basic structure.
 *
 * - `jdType` describes which of these it is.
 * - `jdNumber` contains its number.
 * - `jdTitle` contains its title.
 * - `meta` contains any user-defined metadata
 */

type JdItem =
  | {
    jdType: "project";
    jdNumber: JdProjectNumbers;
    jdTitle: string;
    meta?: Object;
  }
  | {
    jdType: "area";
    jdNumber: JdAreaNumbers;
    jdTitle: string;
    meta?: Object;
  }
  | {
    jdType: "category";
    jdNumber: JdCategoryNumbers;
    jdTitle: string;
    meta?: Object;
  }
  | {
    jdType: "id";
    jdNumber: JdIdNumbers;
    jdTitle: string;
    meta?: Object;
  };

type SelectArea = (area: JdAreaNumbers | null) => void;
type SelectCategory = (category: JdCategoryNumbers | null) => void;
type SelectId = (id: JdIdNumbers | null) => void;
type ChangeDatabase = (newDatabase: JdProjectNumbers) => void;;
type InsertItem = (item: JdItem) => void;

interface DatabaseMachineReactContextValue {
  jdSystem: JdSystem;
  changeDatabase: ChangeDatabase;
  selectArea: SelectArea;
  selectCategory: SelectCategory;
  selectId: SelectId;
  insertItem: InsertItem;
};