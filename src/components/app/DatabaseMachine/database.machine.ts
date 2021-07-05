// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, Machine } from "@xstate/compiled";
import userbase, { Database, Item } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface DatabaseMachineContext {
  databases: Database[];
  jdSystem?: any; // The full parsed jdSystem object.
  userbaseItems: Item[];
}

type DatabaseMachineEvent =
  /**
   * ubGetDatabases returns GOT DATABASES as long as the connection to Userbase
   * was successful. `databases` could be an empty array.
   */
  | { type: "GOT DATABASES"; databases: Database[] }

  /**
   * evalDatabases returns depending on the length of the databases array.
   */
  | { type: "ZERO DATABASES DETECTED" }
  | { type: "ONE OR MORE DATABASES DETECTED" }

  /**
   * ubOpenDatabase.
   */
  // The changeHandler fires this.
  | { type: "USERBASEITEMS UPDATED"; userbaseItems: Item[] }
  // When we open a database.
  | { type: "DATABASE OPENED" }

  // Testing/building
  | { type: "TEST" }
  // Errors
  | { type: "ERROR"; error: UserbaseError };

interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

// === Helpers (extract!)   ===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * # projectExists
 *
 * Given a Userbase list of `userbaseItems`, is any of them a Project?
 * Breaks on the first found.
 */
const projectExists = (userbaseItems: Item[]): Boolean => {
  let exists = false;
  for (let item of userbaseItems) {
    if (item.item.jdType === "project") {
      exists = true;
    }
  }
  return exists;
};

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
      jdSystem: undefined,
      userbaseItems: [],
    },
    on: {
      "USERBASEITEMS UPDATED": {
        /**
         * ubOpenDatabase.changeHandler sends this event whenever it receives
         * updated data.
         */
        actions: [
          (context, event) =>
            console.log("USERBASEITEMS UPDATED:actions:event:", event),
          assign({
            userbaseItems: (context, event) => event.userbaseItems,
          }),
        ],
      },
      ERROR: {
        target: "#databaseMachine.error",
      },
    },
    states: {
      getDatabases: {
        type: "compound",
        initial: "init",
        invoke: {
          src: "ubGetDatabases",
        },
        states: {
          init: {
            on: {
              "GOT DATABASES": {
                actions: [
                  (context, event) => console.log("databases", event),
                  assign({
                    databases: (context, event) => event.databases,
                  }),
                ],
                target: "evalDatabases",
              },
            },
          },
          evalDatabases: {
            /**
             * We got zero or some databases. These are our projects.
             *
             * Figure out how many and act accordingly.
             */
            invoke: {
              src: "evalDatabases",
            },
            on: {
              "ZERO DATABASES DETECTED": {
                target: "creatingFirstDatabase",
              },
              "ONE OR MORE DATABASES DETECTED": {
                target: "openDatabase",
              },
            },
          },
          creatingFirstDatabase: {
            // @ts-ignore
            invoke: {
              /**
               * This creates the database but we don't bother setting the
               * changeHandler as we're going to open it again properly
               * in a moment.
               */
              src: {
                type: "ubOpenDatabase",
                databaseName: "000",
                withoutChangeHandler: true,
              },
            },
            on: {
              "DATABASE OPENED": {
                target: "openDatabase",
              },
            },
          },
          openDatabase: {
            // @ts-ignore
            invoke: {
              src: {
                type: "ubOpenDatabase",
                databaseName: "000",
              },
            },
          },
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
            sendBack({ type: "GOT DATABASES", databases: databases });
          })
          .catch((error) => sendBack({ type: "ERROR", error }));
      },
      evalDatabases: (context) => (sendBack: any) => {
        /**
         * We got zero or more databases. These are our projects.
         */
        if (context.databases.length === 0) {
          sendBack({ type: "ZERO DATABASES DETECTED" });
        } else {
          sendBack({ type: "ONE OR MORE DATABASES DETECTED" });
        }
      },
      /**
       * # ubOpenDatabase
       *
       * Opens the database specified, creating it if it doesn't exist.
       * `invoke: { src: 'upOpenDatabase', databaseName: 'your-value-here' }`
       */
      ubOpenDatabase:
        (
          context: DatabaseMachineContext,
          event: DatabaseMachineEvent,
          {
            src: { databaseName, withoutChangeHandler = false },
          }: { src: { databaseName: string; withoutChangeHandler: Boolean } }
        ) =>
        (sendBack: any) => {
          if (!databaseName) {
            sendBack({
              type: "ERROR",
              error: "ubOpenDatabase called without `databaseName`.",
            });
            return;
          }
          userbase
            .openDatabase({
              databaseName,
              changeHandler: (userbaseItems) => {
                if (withoutChangeHandler) {
                  return;
                } else {
                  console.log(
                    "👷‍♀️ userbase:changeHandler:userbaseItems:",
                    userbaseItems
                  );
                  sendBack({
                    type: "USERBASEITEMS UPDATED",
                    userbaseItems,
                  });
                }
              },
            })
            .then(() => {
              sendBack({ type: "DATABASE OPENED" });
            })
            .catch((error) => {
              sendBack({ type: "ERROR", error });
            });
        },
      checkForProject: (context: DatabaseMachineContext) => (sendBack: any) => {
        if (projectExists(context.userbaseItems)) {
          sendBack({ type: "PROJECT EXISTS" });
        } else {
          sendBack({ type: "PROJECT DOES NOT EXIST" });
        }
      },
      createFirstProject: () => (sendBack: any) => {
        userbase
          .insertItem({
            databaseName: "johnnydecimal",
            item: {
              jdType: "project",
              jdNumber: "001",
              jdTitle: "Default project (system created)",
            },
          })
          .then(() => {
            /**
             * Success just sends us back to the start.
             */
            sendBack({
              type: "CHECK FOR FIRST PROJECT",
            });
          })
          .catch((error) =>
            sendBack({
              type: "ERROR",
              error,
            })
          );
      },
    },
  }
);
