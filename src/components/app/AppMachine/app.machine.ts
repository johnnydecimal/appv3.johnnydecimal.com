// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, Machine } from "@xstate/compiled";
import userbase, { Database, Item } from "userbase-js";
import { send } from "xstate";

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
  | { type: "TEST"; message: string } // for testing
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

const sendToAppMachine = () => console.log("sendToAppMachine");
send(
  {
    type: "TEST",
    message: "woohoo",
  },
  {
    to: "appMachine",
  }
);

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
      TEST: {
        actions: [(context, event) => alert(event.message)],
      },
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
          src: "checkForProject",
        },
        on: {
          "PROJECT EXISTS": "projectFound",
          "PROJECT DOES NOT EXIST": "projectNotFound",
        },
      },
      projectFound: {},
      projectNotFound: {},
      creatingFirstProject: {
        invoke: {
          src: "createFirstProject",
        },
        on: {
          "CHECK FOR PROJECT": {
            target: "#appMachine.checkingForProject",
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
              sendToAppMachine();
            },
          })
          .then(() => {
            sendBack({ type: "CHECK FOR PROJECT" });
          })
          .catch((error) => {
            sendBack({ type: "ERROR", error });
          });
      },
      checkForProject: (context: AppMachineContext) => (sendBack: any) => {
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
            sendBack({
              type: "CHECK FOR PROJECT",
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
