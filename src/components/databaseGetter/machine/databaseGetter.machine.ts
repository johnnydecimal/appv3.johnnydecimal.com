// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import userbase, { Database } from "userbase-js";
import { EventFrom, sendParent } from "xstate";
import { createModel } from "xstate/lib/model";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { AuthMachineEvent } from "@types";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
const databaseGetterModel = createModel(
  {
    // No context on this machine.
  },
  {
    events: {
      /**
       * Sent by ubGetDatabases, which calls itself every 60s.
       */
      CALLBACK_GOT_DATABASES: (databases: Database[]) => ({ databases }),

      /**
       * Sent by the parent when it detects the opening of a new database; this
       * will short-circuit the 60s timer and return the list of databases which
       * should by now include that new database.
       */
      GET_DATABASES: () => ({}),
    },
  }
);

export type DatabaseGetterMachineEvent = EventFrom<typeof databaseGetterModel>;

/**
 * The databaseGetter is invoked by authMachine when the user reaches the
 * `signedIn` state. Remembering that an OPEN_DATABASE event on that state is
 * external, a new instance of this machine will be invoked every time the
 * current database changes.
 */
export const databaseGetterMachine = databaseGetterModel.createMachine(
  {
    id: "databaseGetterMachine",
    initial: "gettingDatabases",
    on: {
      GET_DATABASES: {
        target: "gettingDatabases",
      },
    },
    states: {
      gettingDatabases: {
        invoke: {
          src: "ubGetDatabases",
        },
        on: {
          CALLBACK_GOT_DATABASES: {
            target: "idle",
            actions: [
              sendParent<any, any, AuthMachineEvent>((_, event) => ({
                type: "SENDPARENT_GOT_DATABASES",
                databases: event.databases,
              })),
            ],
          },
        },
      },
      idle: {
        after: {
          60000: {
            target: "gettingDatabases",
          },
        },
      },
    },
  },
  {
    services: {
      ubGetDatabases:
        () => (sendBack: (event: DatabaseGetterMachineEvent) => void) => {
          /**
           * Get the array of databases. Is always returned, can be empty.
           */
          userbase
            .getDatabases()
            .then(({ databases }) => {
              console.debug(
                "%c> dbG.m: ubGetDatabases sendingBack CALLBACK_GOT_DATABASES",
                "color: orange"
              );
              sendBack({ type: "CALLBACK_GOT_DATABASES", databases });
            })
            .catch((error: UserbaseError) =>
              sendParent<any, any, AuthMachineEvent>({
                type: "ERROR",
                error,
              })
            );
        },
    },
  }
);
