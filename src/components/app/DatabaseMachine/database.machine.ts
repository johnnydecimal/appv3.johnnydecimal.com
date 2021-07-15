// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, sendParent } from "xstate";
import { Machine } from "@xstate/compiled";
import userbase, { Database, Item } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { JDItem } from "@types";

interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

interface JDUserbaseItem extends Item {
  item: JDItem;
}

export interface DatabaseMachineContext {
  /**
   * The array of the user's available database objects, returned by Userbase.
   * The `databaseName` property on each object is the 3-digit JD project code,
   * which is a string.
   */
  databases: Database[];
  /**
   * currentDatabase is the 3-digit project which we have open. Corresponds to
   * the databaseName in Userbase.
   */
  currentDatabase?: string;
  /**
   * When we open any given database, `userbaseItems` is the array of Items
   * which makes up that database.
   */
  userbaseItems: JDUserbaseItem[];
  error: any;
}

export type DatabaseMachineEvent =
  /**
   * ubGetDatabases returns GOT ARRAY OF DATABASES as long as the connection to
   * Userbase was successful. `databases` could be an empty array.
   */
  | { type: "GOT DATABASES"; databases: Database[] }
  | { type: "CURRENT DATABASE UPDATED"; currentDatabase: string }
  /**
   * countingDatabases returns depending on the length of the databases array.
   */
  // | { type: "ZERO DATABASES DETECTED" }
  // | { type: "ONE OR MORE DATABASES DETECTED" }

  /**
   * ubCreateFirstDatabase
   */
  // | { type: "FIRST DATABASE CREATED" }

  /**
   * ubOpenDatabase.
   */
  // The changeHandler fires this.
  // | { type: "USERBASEITEMS UPDATED"; userbaseItems: Item[] }

  // When we want to create a new project.
  // | { type: "CREATE PROJECT"; projectNumber: string }

  // When we open a database.
  // | { type: "DATABASE OPENED" }

  // Testing/building
  | { type: "TEST" }

  // Errors
  | { type: "ERROR"; error: UserbaseError };

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const databaseMachine = Machine<
  DatabaseMachineContext,
  DatabaseMachineEvent,
  "databaseMachine"
>(
  {
    id: "databaseMachine",
    // initial: "getDatabases",
    type: "parallel",
    context: {
      databases: [],
      userbaseItems: [],
      error: undefined,
    },
    on: {},
    states: {
      databaseGetter: {
        type: "compound",
        initial: "gettingDatabases",
        states: {
          gettingDatabases: {
            invoke: {
              src: "ubGetDatabases",
            },
            on: {
              "GOT DATABASES": {
                actions: [
                  assign({
                    databases: (_, event) => event.databases,
                  }),
                ],
                target: "idle",
              },
            },
          },
          idle: {
            after: {
              60000: {
                target: "gettingDatabases",
              },
            },
          },
        },
      },
      databaseOpener: {
        type: "compound",
        initial: "init",
        states: {
          init: {
            invoke: {
              src: "ubOpenDatabase",
            },
          },
        },
      },
    },
  },
  {
    services: {
      // @ts-ignore
      ubGetDatabases:
        () => (sendBack: (event: DatabaseMachineEvent) => void) => {
          /**
           * Get the array of databases. Is always returned, can be empty.
           */
          userbase
            .getDatabases()
            .then(({ databases }) => {
              sendBack({ type: "GOT DATABASES", databases });
            })
            .catch((error: UserbaseError) =>
              sendBack({ type: "ERROR", error })
            );
        },
      // @ts-ignore
      ubOpenDatabase:
        (context: DatabaseMachineContext) =>
        (sendBack: (event: DatabaseMachineEvent) => void) => {
          const databaseName = context.currentDatabase || "001";
          userbase
            .openDatabase({
              databaseName,
              changeHandler: () => {},
            })
            .then(() => {
              sendParent({ type: "CURRENT DATABASE UPDATED", databaseName });
              // sendBack({ });
            })
            .catch((error) => {
              /* TODO handle */
            });
        },
    },
  }
);
