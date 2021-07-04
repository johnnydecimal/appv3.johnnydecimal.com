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
  | { type: "DATABASE OPENED" }
  | { type: "ADD TEST ITEM TO DATABASE" }
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
 const projectExists = (items: Item[]): Boolean => {
   let exists = false;
   for (let item of items) {
     if (item.item.jdType === "project") {
       exists = true;
       break;
      }
    }
    return exists;
  };
*/

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
          (context, event) =>
            console.log("DATABASE ITEMS UPDATED:actions:event:", event),
          assign({
            items: (context, event) => event.items,
          }),
        ],
      },
      "ADD TEST ITEM TO DATABASE": {
        actions: [
          () =>
            userbase.insertItem({
              databaseName: "johnnydecimal",
              item: {
                testItem: new Date(),
              },
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
          "DATABASE OPENED": "#appMachine.openingDatabase.databaseOpen",
        },
        initial: "databaseOpen",
        states: {
          databaseOpen: {},
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
            sendBack({ type: "CHECK FOR PROJECT" });
          })
          .catch((error) => {
            sendBack({ type: "ERROR", error });
          });
      },
      /**
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
      */
    },
  }
);
