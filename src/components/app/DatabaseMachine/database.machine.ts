// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, sendParent } from "xstate";
import { createModel } from "xstate/lib/model";
import userbase, { Database, Item } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { JDItem } from "@types";

interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

interface JDUserbaseItem extends Item {
  item: JDItem;
}

const dbModel = createModel(
  {
    /**
     * currentDatabase is the 3-digit project which we have open. Corresponds to
     * the databaseName in Userbase.
     *
     * This context is overwritten by auth.machine when it invokes this machine.
     */
    currentDatabase: "",

    /**
     * The array of the user's available database objects, returned by Userbase.
     * The `databaseName` property on each object is the 3-digit JD project
     * code, which is a string.
     */
    databases: [] as Database[],

    error: {} as UserbaseError,

    /**
     * When we open any given database, `userbaseItems` is the array of Items
     * which makes up that database.
     */
    userbaseItems: [] as JDUserbaseItem[],
  },
  {
    events: {
      /**
       * Sent by ubGetDatabases, which calls itself every 60s.
       */
      "GOT DATABASES": (value: Database[]) => ({ value }),

      /**
       * Sent back to the parent so it can update the user's profile.
       */
      "CURRENT DATABASE UPDATED": (value: string) => ({ value }),

      /**
       * Sent by the changeHandler() when the remote database changes.
       */
      "DATABASE ITEMS UPDATED": (value: JDUserbaseItem[]) => ({ value }),

      /**
       * Sent by ubOpenDatabase when it opens a database.
       */
      "DATABASE OPENED": () => ({}),
    },
  }
);

// Is 4.22.1 released yet?
// export type DatabaseMachineContext = ContextFrom<typeof databaseModel>;
// export type DatabaseMachineEvent = EventFrom<typeof databaseModel>;

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const databaseMachine = dbModel.createMachine(
  {
    id: "databaseMachine",
    type: "parallel",
    context: dbModel.initialContext,
    states: {
      databaseGetter: {
        type: "compound",
        initial: "gettingDatabases",
        states: {
          gettingDatabases: {
            invoke: {
              src: "ubGetDatabases",
            },
            on: {
              "GOT DATABASES": {
                actions: [
                  assign({
                    databases: (_, event) => event.value,
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
        type: "compound",
        initial: "init",
        states: {
          init: {
            invoke: {
              src: "ubOpenDatabase",
            },
            on: {
              "DATABASE OPENED": "databaseOpen",
            },
          },
          databaseOpen: {
            on: {
              "DATABASE ITEMS UPDATED": {
                actions: [
                  dbModel.assign({
                    userbaseItems: (_, event) => event.value,
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
      ubGetDatabases: () => (sendBack: (event: any) => void) => {
        // () => (sendBack: (event: DatabaseMachineEvent) => void) => {
        /**
         * Get the array of databases. Is always returned, can be empty.
         */
        userbase
          .getDatabases()
          .then(({ databases }) => {
            sendBack({ type: "GOT DATABASES", databases });
          })
          .catch((error: UserbaseError) => sendBack({ type: "ERROR", error }));
      },
      ubOpenDatabase: (context) => (sendBack: (event: any) => void) => {
        // (sendBack: (event: DatabaseMachineEvent) => void) => {
        const databaseName = context.currentDatabase || "001";
        userbase
          .openDatabase({
            databaseName,
            changeHandler: (items) => {
              sendBack({ type: "DATABASE ITEMS UPDATED", items });
            },
          })
          .then(() => {
            sendParent({ type: "CURRENT DATABASE UPDATED", databaseName });
            sendBack({ type: "DATABASE OPENED" });
          })
          .catch((error) => {
            sendParent({ type: "ERROR", error });
          });
      },
    },
  }
);
