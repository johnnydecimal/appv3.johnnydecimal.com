// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, Machine } from "@xstate/compiled";
import userbase, { Database } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface Context {
  databases?: Database[];
  horses: boolean;
  items?: any;
}

type Event =
  | { type: "DATABASE OPENED"; items: any }
  | { type: "DATABASE ITEMS UPDATED"; items: any }
  | { type: "error"; error: UserbaseError };

interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}
// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const appMachine = Machine<Context, Event, "appMachine">(
  {
    id: "appMachine",
    initial: "openingDatabase",
    context: {
      databases: undefined,
      items: undefined,
      horses: true,
    },
    on: {
      error: {
        target: "#appMachine.error",
      },
      "DATABASE ITEMS UPDATED": {
        actions: [
          (context, event) => {
            console.log("DATABASE ITEMS UPDATED.event:", event);
          },
          assign({
            items: (context, event) => event.items,
          }),
        ],
      },
    },
    states: {
      openingDatabase: {
        invoke: {
          src: "ubOpenDatabase",
        },
        on: {
          "DATABASE OPENED": {
            target: "#appMachine.checkingForProject",
          },
        },
      },
      checkingForProject: {
        /**
         * On first run, we create a project `001` for the user. Check that it
         * exists, and create it if it doesn't.
         */
        // invoke: {
        //   src: (context, event) => {
        //   }
        // }
        entry: [
          (context) => {
            console.log("entry to checkingForProject, context:", context);
          },
        ],
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
              sendBack({ type: "DATABASE ITEMS UPDATED", items });
            },
          })
          .then(() => {
            // sendBack({ type: "database opened" });
            // This should never be triggered?
            // Actually it's just then nothing, because the changeHandler takes
            // care of it.
          })
          .catch((error) => {
            sendBack({ type: "error", error });
          });
      },
    },
  }
);
