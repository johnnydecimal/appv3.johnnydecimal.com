// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { Machine, assign } from "@xstate/compiled";
import userbase, { Database, DatabasesResult } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface Context {
  databases?: Database[];
}

type Event =
  | { type: "database opened" }
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
    initial: "databaseManagement",
    context: {
      databases: undefined,
    },
    on: {
      error: {
        target: "#appMachine.error",
      },
    },
    states: {
      databaseManagement: {
        type: "compound",
        /**
         * Userbase's `openDatabase` method will open an existing database
         * *or* create one if it doesn't exist.
         */
        initial: "openDatabase",
        states: {
          openDatabase: {
            invoke: {
              src: "ubOpenDatabase",
            },
            on: {
              "database opened": {
                target: "#appMachine.next.dbReceived",
              },
              error: { target: "#appMachine.error" },
            },
          },
        },
      },
      next: {
        type: "compound",
        initial: "dbReceived",
        states: {
          dbReceived: {},
          noDBs: {},
        },
      },
      error: {
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
              console.log("database items:", items);
            },
          })
          .then(() => {
            sendBack({ type: "database opened" });
          })
          .catch((error) => {
            sendBack({ type: "error", error });
          });
      },
    },
  }
);
