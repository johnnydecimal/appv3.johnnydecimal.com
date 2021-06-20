// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign } from "xstate";
import { Machine } from "@xstate/compiled";
import userbase from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface Context {
  databases: {};
}

type Event = { type: "databases received"; databases: {} } | { type: "SEND" };

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const appMachine = Machine<Context, Event, "appMachine">(
  {
    id: "appMachine",
    initial: "init",
    context: {
      databases: {},
    },
    states: {
      init: {
        invoke: {
          src: "userbaseGetDatabases",
        },
        on: {
          SEND: "next",
          "databases received": {
            target: "next",
            actions: ["assignDatabases"],
          },
        },
      },
      next: {},
    },
  },
  {
    actions: {
      assignDatabases: assign({
        databases: (_context, event) => event.databases,
      }),
    },
    services: {
      userbaseGetDatabases: () => (sendBack: (event: Event) => void) => {
        userbase
          .getDatabases()
          .then((databases) => {
            console.log("databases:", databases);
            sendBack({
              type: "databases received",
              databases,
            });
          })
          .catch((error) => {});
      },
    },
  }
);
