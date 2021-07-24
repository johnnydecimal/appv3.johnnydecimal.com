// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  assign,
  ContextFrom,
  EventFrom,
  send as xstateSend,
  sendParent,
} from "xstate";
import { createModel } from "xstate/lib/model";
import userbase, { Database } from "userbase-js";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { UserbaseError, UserbaseItem } from "../../@types";
import { AuthMachineEvent } from "../AuthMachine/auth.machine";

const databaseModel = createModel(
  {
    /**
     * currentDatabase is the 3-digit project which we have open. Corresponds to
     * the databaseName in Userbase. We send this value down when we invoke
     * the machine, and the master
     *
     *
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
     * Update: we're moving all error reporting to the parent. Delete when
     * confirmed.
        error: {} as UserbaseError,
     */

    /**
     * When we open any given database, `userbaseItems` is the array of Items
     * which makes up that database.
     */
    userbaseItems: [] as UserbaseItem[],
  },
  {
    events: {
      /**
       * Sits on the root and transitions to `databaseGetter` whenever we
       * need it to. (We call it on demand.)
       */
      GET_DATABASES: () => ({}),

      /**
       * Sent by ubGetDatabases, which calls itself every 60s.
       */
      GOT_DATABASES: (databases: Database[]) => ({ databases }),

      /**
       * Sent by the changeDatabase(newDatabase) helper function when we want
       * to open a new or existing database -- `newDatabase` refers to the new
       * one to open, it might not actually be new. Not that the API call to
       * Userbase cares either way.
       */
      OPEN_DATABASE: (newDatabase: string) => ({
        newDatabase,
      }),

      /**
       * Sent by the changeHandler() when the remote database changes.
       */
      USERBASE_ITEMS_UPDATED: (userbaseItems: UserbaseItem[]) => ({
        userbaseItems,
      }),

      /**
       * Sent by ubOpenDatabase when it successfully opens a database.
       */
      REPORT_DATABASE_OPENED: () => ({}),

      INSERT_ITEM: (item: UserbaseItem) => ({ item }),
      ITEM_INSERTED: () => ({}),
    },
  }
);

export type DatabaseMachineContext = ContextFrom<typeof databaseModel>;
export type DatabaseMachineEvent = EventFrom<typeof databaseModel>;

const send = (event: DatabaseMachineEvent) =>
  xstateSend<any, any, DatabaseMachineEvent>(event);

// === Actions  ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
const assignUserbaseItems = databaseModel.assign({
  userbaseItems: (context, event) => {
    /**
     * This action is fired by a state which was reached indirectly, so we can't
     * use the <"TYPE"> syntax to narrow the event. Do it the old way.
     */
    if (event.type !== "INSERT_ITEM") {
      return context.userbaseItems;
    }
    const newUserbaseItems = [];
    if (typeof context.userbaseItems === "undefined") {
      /**
       * This is weird given that context.userbaseItems has been initialised
       * as an empty array, but whatever.
       */
      newUserbaseItems.push(event.item);
    } else {
      newUserbaseItems.push(...context.userbaseItems, event.item);
    }
    return newUserbaseItems;
  },
});

const assignNewDatabase = databaseModel.assign<"OPEN_DATABASE">({
  currentDatabase: (_context, event) => event.newDatabase,
});

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * There's only one way a database can be opened (or created): by changing
 * context.currentDatabase and transitioning to #databaseMachine.databaseOpener.
 * The root-level OPEN_DATABASE does this for us.
 *
 * This way we guarantee that context.currentDatabase is actually the database
 * which is open.
 */
export const databaseMachine = databaseModel.createMachine(
  {
    id: "databaseMachine",
    type: "parallel",
    context: databaseModel.initialContext,
    on: {
      GET_DATABASES: {
        target: "#databaseMachine.databaseGetter",
      },
      OPEN_DATABASE: {
        actions: [assignNewDatabase],
        target: "#databaseMachine.databaseOpener",
      },
    },
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
                  databaseModel.assign({
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
        initial: "openingDatabase",
        invoke: {
          /**
           * We need a top-level `invoke` because the `changeHandler` which is
           * set up in this service needs to stay alive.
           */
          src: "ubOpenDatabase",
        },
        states: {
          openingDatabase: {
            on: {
              REPORT_DATABASE_OPENED: {
                actions: [
                  /**
                   * Creating a new database doesn't automatically push it to
                   * the local list of available databases: we short-circuit the
                   * 60s refresh and fetch them immediately (after which 60s
                   * sevice will resume).
                   */
                  send({
                    type: "GET_DATABASES",
                  }),

                  /**
                   * Send auth.machine an update event. This causes its local
                   * context to be updated, and it to update Userbase with the
                   * new profile.
                   */
                  sendParent<any, any, AuthMachineEvent>((context) => ({
                    type: "UPDATE_USER_PROFILE",
                    profile: {
                      currentDatabase: context.currentDatabase,
                    },
                  })),
                ],
                target: "databaseOpen",
              },
            },
          },
          databaseOpen: {
            on: {
              INSERT_ITEM: {
                target: "#databaseMachine.itemInserter.insertingItem",
              },
            },
          },
        },
      },
      itemInserter: {
        type: "compound",
        initial: "idle",
        states: {
          idle: {},
          insertingItem: {
            entry: [
              /**
               * Add the new item to the local context. This ensures an instant
               * response in the UI.
               *
               * Okay, console.log shows that the event does get sent down here.
               */
              assignUserbaseItems,
            ],
            invoke: {
              /**
               * Invoke a service to push the new item to Userbase. The
               * changeHandler will then fire, overwriting our local context
               * with the same item, so nothing should change.
               */
              src: "ubInsertItem",
            },
            on: {
              ITEM_INSERTED: {
                target: "idle",
              },
            },
          },
        },
      },
      itemReceiver: {
        type: "compound",
        initial: "listening",
        states: {
          listening: {
            on: {
              USERBASE_ITEMS_UPDATED: {
                actions: [
                  databaseModel.assign({
                    userbaseItems: (context, event) => event.userbaseItems,
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
              sendParent<any, any, AuthMachineEvent>({
                type: "ERROR",
                error,
              })
            );
        },
      ubOpenDatabase:
        (context: DatabaseMachineContext) =>
        (sendBack: (event: DatabaseMachineEvent) => void) => {
          userbase
            .openDatabase({
              databaseName: context.currentDatabase,
              changeHandler: (userbaseItems) => {
                console.log(
                  "🇹🇩 changeHandler() fired, userbaseItems:",
                  userbaseItems
                );
                /**
                 * So when this is set up, this fires. That's how we get the
                 * initial load of items. So we need to make sure that the
                 * machine is in a state which will accept this event and do
                 * something with its payload.
                 */
                sendBack({ type: "USERBASE_ITEMS_UPDATED", userbaseItems });
              },
            })
            .then(() => {
              sendBack({ type: "REPORT_DATABASE_OPENED" });
            })
            .catch((error: UserbaseError) => {
              /**
               * #TODO: errors need to be handled better here. You've already
               *        set `currentDatabase`, so if this doesn't work we're
               *        in a janky state.
               */
              sendParent<any, any, AuthMachineEvent>({
                type: "ERROR",
                error,
              });
            });
        },
      ubInsertItem:
        (context, event) =>
        (sendBack: (event: DatabaseMachineEvent) => void) => {
          if (event.type !== "INSERT_ITEM") {
            /**
             * Twist TypeScript's arm.
             */
            sendParent<any, any, AuthMachineEvent>({
              type: "ERROR",
              error: {
                name: "UserbaseInsertItemCallError",
                message: `userbaseInsertItem() was invoked from a state that
                  wasn't reached by sending INSERT_ITEM. As a result,
                  'event.item' won't exist, so this function will now return.`,
                status: 905, // Customise me later
              },
            });
            return;
          }
          console.log("ubInsertItem", context, event);
          userbase
            .insertItem({
              databaseName: context.currentDatabase,
              // item: event.item,
              item: {
                test: true,
                item: "yeah",
                insertDate: new Date(),
              },
            })
            .then(() => {
              sendBack({ type: "ITEM_INSERTED" });
            })
            .catch((error) => {
              sendParent<any, any, AuthMachineEvent>({
                type: "ERROR",
                error,
              });
            });
        },
    },
  }
);
