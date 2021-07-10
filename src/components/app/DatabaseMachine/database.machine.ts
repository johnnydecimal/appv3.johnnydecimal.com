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
  error: any;
}

type DatabaseMachineEvent =
  /**
   * ubGetDatabases returns GOT ARRAY OF DATABASES as long as the connection to
   * Userbase was successful. `databases` could be an empty array.
   */
  | { type: "GOT ARRAY OF DATABASES"; databases: Database[] }

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
  | { type: "ERROR"; error: UserbaseError };

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
              "GOT ARRAY OF DATABASES": {
                actions: [
                  assign({
                    databases: (context, event) => event.databases,
                  }),
                  assign({
                    currentProject: (context, event) => {
                      if (event.databases[0]) {
                        return event.databases[0].databaseName;
                      } else {
                        return "";
                      }
                    },
                  }),
                ],
                target: "countingDatabases",
              },
            },
          },
          countingDatabases: {
            /**
             * We got zero or some databases. These are our projects.
             *
             * Figure out how many and act accordingly.
             */
            invoke: {
              src: "countDatabases",
            },
            on: {
              "ZERO DATABASES DETECTED": {
                target: "creatingFirstDatabase",
              },
              "ONE OR MORE DATABASES DETECTED": {
                target: "#databaseMachine.openDatabase",
              },
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
      openDatabase: {
        type: "compound",
        initial: "openingDatabase",
        /**
         * This is where the Userbase changeHandler gets set up. If we exit this
         * state the handler gets killed/ignored.
         */
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
            sendBack({ type: "GOT ARRAY OF DATABASES", databases });
          })
          .catch((error) => sendBack({ type: "ERROR", error }));
      },
      countDatabases: (context: DatabaseMachineContext) => (sendBack: any) => {
        if (context.databases.length === 0) {
          sendBack({ type: "ZERO DATABASES DETECTED" });
        } else {
          sendBack({ type: "ONE OR MORE DATABASES DETECTED" });
        }
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
