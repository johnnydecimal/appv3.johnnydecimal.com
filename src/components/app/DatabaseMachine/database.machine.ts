// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { JDItem } from "@types";
import { assign, Machine } from "@xstate/compiled";
import userbase, { Database, Item } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

interface JDUserbaseItem extends Item {
  item: JDItem;
}

interface DatabaseMachineContext {
  /**
   * The array of the user's available database objects, returned by Userbase.
   * The `databaseName` property on each object is the 3-digit JD project code,
   * which is a string.
   */
  databases: Database[];
  /**
   * currentProject is the 3-digit project which we have open. Corresponds to
   * the databaseName in Userbase.
   */
  currentProject: string;
  /**
   * When we open any given database, `userbaseItems` is the array of Items
   * which makes up that database.
   */
  userbaseItems: JDUserbaseItem[];
  error?: UserbaseError;
}

export type DatabaseMachineEvent =
  /**
   * ubGetDatabases returns GOT DATABASES as long as the connection to
   * Userbase was successful. `databases` could be an empty array.
   */
  | { type: "GOT DATABASES"; databases: Database[] }

  /**
   * countingDatabases returns depending on the length of the databases array.
   */
  | { type: "ZERO DATABASES DETECTED" }
  | { type: "ONE OR MORE DATABASES DETECTED" }

  /**
   * ubCreateFirstDatabase
   */
  | { type: "FIRST DATABASE CREATED" }

  /**
   * ubOpenDatabase.
   */
  // The changeHandler fires this.
  | { type: "USERBASEITEMS UPDATED"; userbaseItems: Item[] }

  // When we want to create a new project.
  | { type: "CREATE PROJECT"; projectNumber: string }

  // When we open a database.
  | { type: "DATABASE OPENED" }

  // Testing/building
  | { type: "TEST" }
  // Errors
  | { type: "ERROR"; error: any }; // TODO: fix the any

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const databaseMachine = Machine<
  DatabaseMachineContext,
  DatabaseMachineEvent,
  "databaseMachine"
>(
  {
    id: "databaseMachine",
    initial: "getDatabases",
    context: {
      databases: [],
      currentProject: "",
      userbaseItems: [],
      error: undefined,
    },
    on: {
      "USERBASEITEMS UPDATED": {
        /**
         * ubOpenDatabase.changeHandler sends this event whenever it receives
         * updated data.
         */
        actions: [
          assign({
            userbaseItems: (context, event) => event.userbaseItems,
          }),
        ],
      },
      "CREATE PROJECT": {
        actions: [
          assign({
            currentProject: (context, event) => event.projectNumber,
          }),
        ],
        target: "#databaseMachine.openDatabase",
      },
      ERROR: {
        target: "#databaseMachine.error",
        actions: [
          (context, event) => console.log("ERROR.event:", event),
          assign({
            error: (context, event) => event.error,
          }),
        ],
      },
    },
    states: {
      getDatabases: {
        type: "compound",
        initial: "init",
        states: {
          init: {
            invoke: {
              src: "ubGetDatabases",
            },
            on: {
              "GOT DATABASES": [
                /**
                 * This event comes with `{ databases: Database[] }`.
                 */
                {
                  /**
                   * If there are no databases, create one.
                   */
                  cond: (_, event) => event.databases.length === 0,
                  target: "#databaseMachine.getDatabases.creatingFirstDatabase",
                },
                {
                  /**
                   * If there are databases, store them on context and open.
                   */
                  cond: (_, event) => event.databases.length > 0,
                  actions: [
                    assign({
                      databases: (_, event) => event.databases,
                    }),
                  ],
                  target: "#databaseMachine.openDatabase",
                },
              ],
            },
          },
          creatingFirstDatabase: {
            invoke: {
              src: "ubCreateFirstDatabase",
            },
            on: {
              "FIRST DATABASE CREATED": {
                target: "init",
              },
            },
          },
        },
      },
      setCurrentProject: {
        /**
         * We should only get here if `context.databases.length > 0`.
         */
        entry: [
          /**
           * Just any old database for now. They're returned in `databaseId`
           * order so this won't make any sense.
           */
          assign({
            currentProject: (context) => context.databases[0].databaseName,
          }),
        ],
        always: [
          {
            target: "openDatabase",
          },
        ],
      },
      openDatabase: {
        type: "compound",
        initial: "openingDatabase",
        /**
         * This is where the Userbase changeHandler gets set up. If we exit this
         * state the handler gets killed/ignored.
         */
        always: [
          /**
           * We invoke `ubOpenDatabase`, and it needs `context.currentProject`,
           * so check for it and branch rather than throwing an error later.
           */
          {
            cond: (context) => context.currentProject === "",
            target: "#databaseMachine.setCurrentProject",
          },
        ],
        invoke: {
          src: "ubOpenDatabase",
        },
        states: {
          openingDatabase: {
            on: {
              "DATABASE OPENED": "databaseIsOpen",
            },
          },
          databaseIsOpen: {},
        },
      },
      error: {
        /**
         * Top-level error state. Calling ERROR anywhere will bring us here.
         */
        type: "final",
      },
    },
  },
  {
    services: {
      ubGetDatabases: () => (sendBack: any) => {
        /**
         * Get the array of databases. Is always returned, can be empty.
         */
        userbase
          .getDatabases()
          .then(({ databases }) => {
            sendBack({ type: "GOT DATABASES", databases });
          })
          .catch((error) => sendBack({ type: "ERROR", error }));
      },
      ubCreateFirstDatabase: () => (sendBack: any) => {
        userbase
          .openDatabase({
            databaseName: "001",
            changeHandler: () => {
              /**
               * This changeHandler isn't needed, but is required by Userbase.
               * We exit the state that invoked this service immediately, so
               * anything created by this service will be ignored by XState.
               *
               * This function might be a minor memory leak? Which is why it
               * doesn't do anything.
               */
            },
          })
          .then(() => {
            sendBack({ type: "FIRST DATABASE CREATED" });
          })
          .catch((error) => sendBack({ type: "ERROR", error }));
      },
      ubOpenDatabase: (context: DatabaseMachineContext) => (sendBack: any) => {
        if (context.currentProject === "") {
          sendBack({
            type: "ERROR",
            error: "ubOpenDatabase called while context.currentProject === ''",
          });
          return;
        }
        userbase
          .openDatabase({
            databaseName: context.currentProject,
            changeHandler: (userbaseItems) => {
              sendBack({
                type: "USERBASEITEMS UPDATED",
                userbaseItems,
              });
            },
          })
          .then(() => {
            sendBack({ type: "DATABASE OPENED" });
          })
          .catch((error) => {
            sendBack({ type: "ERROR", error });
          });
      },
    },
  }
);
