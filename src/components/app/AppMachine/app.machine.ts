// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, Machine } from "@xstate/compiled";
import userbase, { Database, Item } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface AppMachineContext {
  databases?: Database[];
  items: Item[];
}

type AppMachineEvent =
  | { type: "DATABASE ITEMS UPDATED"; items: any }
  | { type: "CHECK FOR PROJECT" }
  | { type: "PROJECT EXISTS" }
  | { type: "PROJECT DOES NOT EXIST" }
  | { type: "NULL" } // for testing
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
  for (let item of items) {
    if (item.item.jdType === "project") {
      return true;
    }
  }
  return false;
};

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const appMachine = Machine<
  AppMachineContext,
  AppMachineEvent,
  "appMachine"
>(
  {
    id: "appMachine",
    initial: "openingDatabase",
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
      openingDatabase: {
        invoke: {
          src: "ubOpenDatabase",
        },
        on: {
          "CHECK FOR PROJECT": {
            target: "#appMachine.checkingForProject",
          },
        },
      },
      checkingForProject: {
        /**
         * On first run, we create a project `001` for the user. Check that it
         * exists, and create it if it doesn't.
         */
        invoke: {
          src: "checkItemsForProject",
        },
        on: {
          "PROJECT EXISTS": "projectFound",
          "PROJECT DOES NOT EXIST": "projectNotFound",
        },
      },
      projectFound: {},
      projectNotFound: {},
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
              sendBack({ type: "DATABASE ITEMS UPDATED", items });
            },
          })
          .then(() => {
            sendBack({ type: "CHECK FOR PROJECT" });
          })
          .catch((error) => {
            sendBack({ type: "error", error });
          });
      },
      checkItemsForProject: (context: AppMachineContext) => (sendBack: any) => {
        if (projectExists(context.items)) {
          sendBack({ type: "PROJECT EXISTS" });
        } else {
          sendBack({ type: "PROJECT DOES NOT EXIST" });
        }
      },
    },
  }
);
