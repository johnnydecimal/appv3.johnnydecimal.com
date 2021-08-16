import userbase, { Database } from "userbase-js";
import { EventFrom, sendParent } from "xstate";
import { createModel } from "xstate/lib/model";
import { AuthMachineEvent, UserbaseError } from "@types";

const databaseGetterModel = createModel(
  {},
  {
    events: {
      /**
       * Sent by ubGetDatabases, which calls itself every 60s.
       */
      GOT_DATABASES: (databases: Database[]) => ({ databases }),

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
 *
 * If that OPEN_DATABASE event created a new database, we're too early here to
 * detect it. So what can we do about that?
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
          GOT_DATABASES: {
            target: "idle",
            actions: [
              sendParent<any, any, AuthMachineEvent>((context, event) => ({
                type: "GOT_DATABASES",
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
              sendBack({ type: "GOT_DATABASES", databases });
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
