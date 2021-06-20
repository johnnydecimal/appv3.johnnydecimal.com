// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign } from "xstate";
import { Machine } from "@xstate/compiled";
import userbase, { Database, DatabasesResult } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface Context {
  databases?: Database[];
}

type Event =
  | { type: "databases received"; databases: Database[] }
  | { type: "database object empty" };

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const appMachine = Machine<Context, Event, "appMachine">(
  {
    id: "appMachine",
    initial: "gettingDatabases",
    context: {
      databases: undefined,
    },
    states: {
      gettingDatabases: {
        invoke: {
          src: "ubGetDatabases",
        },
        on: {
          "databases received": {
            target: "next.dbReceived",
            actions: ["assignDatabases"],
          },
          "database object empty": {
            target: "next.noDBs",
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
    },
  },
  {
    actions: {
      assignDatabases: assign({
        databases: (_context, event) => event.databases,
      }),
    },
    services: {
      ubGetDatabases: () => (sendBack: (event: Event) => void) => {
        userbase
          .getDatabases()
          .then((result: DatabasesResult) => {
            console.log("result", result);
            if (result.databases.length > 0) {
              sendBack({
                type: "databases received",
                databases: result.databases,
              });
            } else {
              sendBack({
                type: "database object empty",
              });
            }
          })
          .catch((error) => {});
      },
    },
  }
);
