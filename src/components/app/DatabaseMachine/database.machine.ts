// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, Machine } from "@xstate/compiled";
import userbase, { Database, Item } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface DatabaseMachineContext {
  databases?: Database[];
  jdSystem?: any; // The full parsed jdSystem object.
  userbaseItems: Item[];
}

type DatabaseMachineEvent =
  // Get the list of databases
  | { type: "GOT DATABASES"; databases: Database[] }
  // Sent by userbase `changeHandler` when the database is updated.
  | { type: "USERBASEITEMS UPDATED"; userbaseItems: Item[] }
  // Opening the database and checking that a project exists. These do the same
  // thing and are duplicated for machine readability.
  | { type: "DATABASE OPENED" }
  | { type: "PROJECT EXISTS" }
  | { type: "PROJECT DOES NOT EXIST" }
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
      databases: undefined,
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
                target: "next",
              },
            },
          },
          next: {},
        },
      },
      openDatabase: {
        type: "compound",
        initial: "init",
        invoke: {
          src: "ubOpenDatabase",
        },
        states: {
          init: {
            on: {
              "DATABASE OPENED": "checkingForProject",
            },
          },
          checkingForProject: {
            invoke: {
              src: "checkForProject",
            },
            on: {
              "PROJECT EXISTS": "ready",
              "PROJECT DOES NOT EXIST": "creatingFirstProject",
            },
          },
          creatingFirstProject: {
            invoke: {
              src: "createFirstProject",
            },
            on: {
              /**
               * Success just sends us back to the start.
               */
              "DATABASE OPENED": "checkingForProject",
            },
          },
          ready: {},
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
    actions: {
      // assignDatabases: assign({
      //   databases: (_context, event) => event.databases,
      // }),
    },
    services: {
      ubGetDatabases: () => (sendBack: any) => {
        userbase
          .getDatabases()
          .then(({ databases }) => {
            console.log("databases in the service:", databases);
            sendBack({ type: "GOT DATABASES", databases: databases });
          })
          .catch((error) => sendBack({ type: "ERROR", error }));
      },
      ubOpenDatabase: () => (sendBack: any) => {
        userbase
          .openDatabase({
            databaseName: "johnnydecimal",
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
