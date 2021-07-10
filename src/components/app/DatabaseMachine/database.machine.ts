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
        states: {
          init: {
            invoke: {
              src: "ubGetDatabases",
            },
            on: {
              "GOT DATABASES": {
                actions: [
                  assign({
                    databases: (context, event) => event.databases,
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
        // @ts-ignore
        invoke: {
          src: {
            type: "ubOpenDatabase",
            databaseName: "001",
          },
        },
        states: {
          openingDatabase: {
            //
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
            sendBack({ type: "GOT DATABASES", databases });
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
      ubOpenDatabase:
        (
          context: DatabaseMachineContext,
          event: DatabaseMachineEvent,
          { src: { databaseName } }: { src: { databaseName: string } }
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
                console.log(
                  "👷‍♀️ userbase:changeHandler:userbaseItems:",
                  userbaseItems
                );
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
