// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, Machine } from "@xstate/compiled";
import userbase, { Database, Item } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface DatabaseMachineContext {
  databases?: Database[];
  items: Item[];
}

type DatabaseMachineEvent =
  // Sent by userbase `changeHandler` when the database is updated.
  | { type: "DATABASE ITEMS UPDATED"; items: Item[] }
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
 * Given a Userbase list of `items`, is any of them a Project?
 * Breaks on the first found.
 */
const projectExists = (items: Item[]): Boolean => {
  let exists = false;
  for (let item of items) {
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
  "appMachine"
>(
  {
    id: "appMachine",
    initial: "openDatabase",
    context: {
      databases: undefined,
      items: [],
    },
    on: {
      "DATABASE ITEMS UPDATED": {
        /**
         * ubOpenDatabase.changeHandler sends this event whenever it receives
         * updated data.
         */
        actions: [
          (context, event) =>
            console.log("DATABASE ITEMS UPDATED:actions:event:", event),
          assign({
            items: (context, event) => event.items,
          }),
        ],
      },
      ERROR: {
        target: "#appMachine.error",
      },
    },
    states: {
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
      ubOpenDatabase: () => (sendBack: any) => {
        userbase
          .openDatabase({
            databaseName: "johnnydecimal",
            changeHandler: (items) => {
              console.log("👷‍♀️ userbase:changeHandler:items:", items);
              sendBack({
                type: "DATABASE ITEMS UPDATED",
                items,
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
        if (projectExists(context.items)) {
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
