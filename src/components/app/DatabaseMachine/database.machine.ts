// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, ContextFrom, EventFrom, sendParent } from "xstate";
import { createModel } from "xstate/lib/model";
import userbase, { Database } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { UserbaseError, UserbaseItem } from "@types";
import {
  AuthMachineContext,
  AuthMachineEvent,
} from "components/authentication/AuthMachine/auth.machine";

const dbModel = createModel(
  {
    /**
     * currentDatabase is the 3-digit project which we have open. Corresponds to
     * the databaseName in Userbase.
     */
    currentDatabase: "",

    /**
     * The array of the user's available database objects, returned by Userbase.
     * The `databaseName` property on each object is the 3-digit JD project
     * code, which is a string.
     */
    databases: [] as Database[],

    /**
     * The latest error.
     */
    error: {} as UserbaseError,

    /**
     * When we open any given database, `userbaseItems` is the array of Items
     * which makes up that database.
     */
    userbaseItems: [] as UserbaseItem[],
  },
  {
    events: {
      /**
       * Sent by ubGetDatabases, which calls itself every 60s.
       */
      GOT_DATABASES: (databases: Database[]) => ({ databases }),

      /**
       * Sent by the changeHandler() when the remote database changes.
       */
      DATABASE_ITEMS_UPDATED: (userbaseItems: UserbaseItem[]) => ({
        userbaseItems,
      }),

      /**
       * Sent by ubOpenDatabase when it opens a database.
       */
      DATABASE_OPENED: () => ({}),

      /**
       * An error.
       */
      ERROR: (error: UserbaseError) => ({ error }),
    },
  }
);

export type DatabaseMachineContext = ContextFrom<typeof dbModel>;
export type DatabaseMachineEvent = EventFrom<typeof dbModel>;

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const databaseMachine = dbModel.createMachine(
  {
    id: "databaseMachine",
    type: "parallel",
    context: dbModel.initialContext,
    on: {},
    states: {
      databaseGetter: {
        /**
         * This state loops itself every 60s and is responsible for getting the
         * current list of databases. This is assigned to context but nothing
         * else is done: it's just so that we have the list available if we want
         * to switch databases.
         */
        type: "compound",
        initial: "gettingDatabases",
        states: {
          gettingDatabases: {
            invoke: {
              src: "ubGetDatabases",
            },
            on: {
              GOT_DATABASES: {
                actions: [
                  assign({
                    databases: (_, event) => event.databases,
                  }),
                ],
                target: "idle",
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
      databaseOpener: {
        /**
         * This is where we actually open our database.
         */
        type: "compound",
        initial: "init",
        invoke: {
          /**
           * We need a top-level `invoke` because the `changeHandler` which is
           * set up in this service needs to stay alive.
           */
          src: "ubOpenDatabase",
        },
        states: {
          init: {
            on: {
              DATABASE_OPENED: "databaseOpen",
            },
          },
          databaseOpen: {
            on: {
              DATABASE_ITEMS_UPDATED: {
                actions: [
                  dbModel.assign({
                    userbaseItems: (_, event) => event.userbaseItems,
                  }),
                ],
              },
            },
          },
        },
      },
    },
  },
  {
    services: {
      ubGetDatabases:
        () => (sendBack: (event: DatabaseMachineEvent) => void) => {
          /**
           * Get the array of databases. Is always returned, can be empty.
           */
          userbase
            .getDatabases()
            .then(({ databases }) => {
              sendBack({ type: "GOT_DATABASES", databases });
            })
            .catch((error: UserbaseError) =>
              sendBack({ type: "ERROR", error })
            );
        },
      ubOpenDatabase:
        (context: DatabaseMachineContext) =>
        (sendBack: (event: DatabaseMachineEvent) => void) => {
          const databaseName = context.currentDatabase || "001";
          userbase
            .openDatabase({
              databaseName,
              changeHandler: (userbaseItems) => {
                sendBack({ type: "DATABASE_ITEMS_UPDATED", userbaseItems });
              },
            })
            .then(() => {
              sendParent<any, any, AuthMachineEvent>({
                type: "CURRENT_DATABASE_UPDATED",
                databaseName,
              });
              sendBack({ type: "DATABASE_OPENED" });
            })
            .catch((error: UserbaseError) => {
              sendParent<any, any, AuthMachineEvent>({
                type: "ERROR",
                error,
              });
            });
        },
    },
  }
);
