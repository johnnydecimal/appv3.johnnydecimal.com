// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { ContextFrom, EventFrom, send as xstateSend, sendParent } from "xstate";
import { createModel } from "xstate/lib/model";
import userbase, { Database } from "userbase-js";
import { nanoid } from "nanoid";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { userbaseItemsToJdSystem } from "utils";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  AuthMachineEvent,
  JdSystem,
  JdProjectNumbers,
  JdAreaNumbers,
  JdCategoryNumbers,
  JdIdNumbers,
  JdItem,
  UserbaseError,
  UserbaseItem,
} from "@types";
import { jdSystemInsertCheck } from "utils/jdSystemChecker/jdSystemChecker";

const databaseModel = createModel(
  {
    /**
     * currentProject is the 3-digit project which we have open. Corresponds to
     * the databaseName in Userbase. We send this value down when we invoke
     * the machine.
     */
    currentProject: "" as JdProjectNumbers,

    /**
     * The currently-open area, category, and ID.
     */
    currentArea: null as JdAreaNumbers | null,
    currentCategory: null as JdCategoryNumbers | null,
    currentId: null as JdIdNumbers | null,

    /**
     * currentUsername is the username of the currently-signed-in user. We send
     * this down when we invoke the machine. Note that this isn't the full
     * User object.
     */
    currentUsername: "",

    /**
     * The array of the user's available database objects, returned by Userbase.
     * The `databaseName` property on each object is the 3-digit JD project
     * code, which is a string.
     */
    databases: [] as Database[],

    /**
     * When we open any given database, `userbaseItems` is the array of Items
     * which makes up that database.
     */
    userbaseItems: [] as UserbaseItem[],

    /**
     * The parsed representation of our system.
     */
    jdSystem: {} as JdSystem,
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
      OPEN_DATABASE: (newDatabase: JdProjectNumbers) => ({
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

      /**
       * When we open a new database, if it needs to have the project item
       * set up we send this specific event. Makes the machine easier to reason.
       */
      CREATE_PROJECT_ITEM: () => ({}),
      PROJECT_CREATED: () => ({}),

      /**
       * Sent by the helper function whenever we want to add a new item to the
       * current database. Note that we don't insert a UserbaseItem, there's a
       * bunch of stuff on there (itemId) that Userbase generates for us.
       */
      INSERT_ITEM: (item: JdItem) => ({ item }),

      /**
       * Sent by ubInsertItem when it was successful.
       */
      ITEM_INSERTED: () => ({}),

      /**
       * Sent by the helper functions when the user interacts with the app.
       */
      OPEN_AREA: (area: JdAreaNumbers) => ({ area }),
      OPEN_CATEGORY: (category: JdCategoryNumbers) => ({ category }),
      OPEN_ID: (id: JdIdNumbers) => ({ id }),

      /**
       * Testing #TODO delete
       */
      ALERT: () => ({}),
    },
  }
);

export type DatabaseMachineContext = ContextFrom<typeof databaseModel>;
export type DatabaseMachineEvent = EventFrom<typeof databaseModel>;

const send = (event: DatabaseMachineEvent) =>
  xstateSend<any, any, DatabaseMachineEvent>(event);

//#region  ===-===  Actions     ===-===-===-===-===-===-===-===-===-===-===-===
const assignDatabases = databaseModel.assign<"GOT_DATABASES">({
  databases: (_, event) => event.databases,
});

const assignNewDatabase = databaseModel.assign<"OPEN_DATABASE">({
  currentProject: (_context, event) => event.newDatabase,
});

const assignNewUserbaseItem = databaseModel.assign({
  /**
   * This is fired whenever we add a new item to the database. We add it to the
   * local context immediately so that our UI is nice and responsive.
   */
  userbaseItems: (context, event) => {
    /**
     * This action is fired by a state which was reached indirectly, so we can't
     * use the <"TYPE"> syntax to narrow the event. Do it the old way.
     */
    if (event.type !== "INSERT_ITEM") {
      return context.userbaseItems;
    }
    /**
     * Incoming event.item is of type JdItem. It doesn't contain the stuff that
     * Userbase adds, so we fudge it here as it'll be immediately overwritten
     * by the changeHandler.
     */
    const newItem: UserbaseItem = {
      itemId: nanoid(),
      item: {
        ...event.item,
      },
      createdBy: {
        username: context.currentUsername,
        timestamp: new Date(),
      },
    };
    const newUserbaseItems = [];
    if (typeof context.userbaseItems === "undefined") {
      /**
       * This is weird given that context.userbaseItems has been initialised
       * as an empty array, but whatever.
       */
      newUserbaseItems.push(newItem);
    } else {
      newUserbaseItems.push(...context.userbaseItems, newItem);
    }
    return newUserbaseItems;
  },
});

const assignUserbaseItems = databaseModel.assign<"USERBASE_ITEMS_UPDATED">({
  /**
   * This is fired by the changeHandler() and contains the entire array of
   * userbaseItems.
   */
  userbaseItems: (context, event) => event.userbaseItems,
});

const assignJdSystem = databaseModel.assign<"USERBASE_ITEMS_UPDATED">({
  jdSystem: (context, event) => {
    const result = userbaseItemsToJdSystem(event.userbaseItems);
    if (result.success) {
      return result.data;
    }
    // TODO: improve handling of errors
    return context.jdSystem;
  },
});

const clearUserbaseItems = databaseModel.assign<"OPEN_DATABASE">({
  /**
   * As soon as we open a new database, the existing userbaseItems
   * become invalid. Rather than wait the fraction of a second for the
   * changeHandler() to update them, we clear them here. This will make
   * the UI more snappy. The cH() will fire immediately and re-populate.
   */
  userbaseItems: () => [],
});

const assignCurrentArea = databaseModel.assign<"OPEN_AREA">({
  currentArea: (context, event) => event.area,
});

const assignCurrentCategory = databaseModel.assign<"OPEN_CATEGORY">({
  currentCategory: (context, event) => event.category,
});

const assignCurrentId = databaseModel.assign<"OPEN_ID">({
  currentId: (context, event) => event.id,
});

const clearCurrentArea = databaseModel.assign<"OPEN_DATABASE">({
  currentArea: () => null,
});

const clearCurrentCategory = databaseModel.assign<
  "OPEN_DATABASE" | "OPEN_AREA"
>({
  currentCategory: () => null,
});

const clearCurrentId = databaseModel.assign<
  "OPEN_DATABASE" | "OPEN_AREA" | "OPEN_CATEGORY"
>({
  currentId: () => null,
});
//#endregion

//#region  ===-===  Main        ===-===-===-===-===-===-===-===-===-===-===-===
/**
 * There's only one way a database can be opened (or created): by changing
 * context.currentProject and transitioning back to the root of this machine.
 * The root-level OPEN_DATABASE does this for us.
 *
 * This way we guarantee that context.currentProject is actually the database
 * which is open.
 */
export const databaseMachine = databaseModel.createMachine(
  {
    id: "databaseMachine",
    type: "parallel",
    context: databaseModel.initialContext,
    invoke: {
      /**
       * We need a top-level `invoke` because the `changeHandler` which is
       * set up in this service needs to stay alive.
       */
      src: "ubOpenDatabase",
    },
    on: {
      GET_DATABASES: {
        target: "#databaseMachine.databaseGetter",
      },
      OPEN_DATABASE: {
        actions: [
          assignNewDatabase,
          clearUserbaseItems,
          clearCurrentArea,
          clearCurrentCategory,
          clearCurrentId,
        ],
        target: "#databaseMachine",
      },
      OPEN_AREA: {
        actions: [assignCurrentArea, clearCurrentCategory, clearCurrentId],
      },
      OPEN_CATEGORY: {
        actions: [assignCurrentCategory, clearCurrentId],
      },
      OPEN_ID: {
        actions: [assignCurrentId],
      },
      ALERT: {
        actions: [() => console.debug("🛎 ALERT fired")],
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
        initial: "waitingForDatabaseToBeOpen",
        states: {
          waitingForDatabaseToBeOpen: {
            on: {
              REPORT_DATABASE_OPENED: "gettingDatabases",
            },
          },
          gettingDatabases: {
            invoke: {
              src: "ubGetDatabases",
            },
            on: {
              GOT_DATABASES: {
                actions: [assignDatabases],
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
      databaseState: {
        /**
         * We moved the opening of the database to the root, but this state
         * still does a bunch of admin for us.
         */
        type: "compound",
        initial: "openingDatabase",
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
                      currentProject: context.currentProject,
                    },
                  })),
                ],
                target: "databaseOpen",
              },
            },
          },
          databaseOpen: {
            entry: [
              (context) => console.debug("> databaseOpen, context:", context),
            ],
            always: [
              {
                cond: (context) => context.userbaseItems.length === 0,
                actions: () =>
                  console.debug(
                    "%c> `always` from `databaseOpen` to `creatingProjectItem`",
                    "color: orange"
                  ),
                target: "creatingProjectItem",
              },
            ],
            // on: {
            //   INSERT_ITEM: {
            //     target: "#databaseMachine.itemInserter.requestItemInsertion",
            //   },
            // },
          },
          creatingProjectItem: {
            invoke: {
              src: "ubCreateProjectItem",
            },
            on: {
              PROJECT_CREATED: {
                target: "waitingForUserbaseItemsToBeUpdated",
              },
            },
          },
          waitingForUserbaseItemsToBeUpdated: {
            //   /**
            //    * We can't transition straight back to `databaseOpen` because
            //    * context.userbaseItems.length is still 0. So we just wait until
            //    * the insertion we just made is pushed back to us by the cH().
            //    */
            //   entry: [
            //     () =>
            //       console.debug(
            //         "%c> entry: waitingForUserbaseItemsToBeUpdated",
            //         "color: orange"
            //       ),
            //   ],
            //   on: {
            //     USERBASE_ITEMS_UPDATED: {
            //       target: "databaseOpen",
            //     },
            //   },
          },
        },
      },
      itemInserter: {
        /**
         * We're going to put a guard on here and it's the thing that will
         * check our current local context to see if the new item is allowed.
         *
         * If it is, we'll transition to the state where `ubInsertItem` is
         * invoked. If it isn't, we should throw a warning or something.
         *
         * Remember that INSERT_ITEM calls directly to insertingItem here.
         *
         * Alternatively we could do this checking down in `ubInsertItem` but
         * it's going to make more sense later to see it visualised here.
         */
        type: "compound",
        initial: "idle",
        states: {
          idle: {},
          requestItemInsertion: {
            always: [
              {
                cond: (context, event) => {
                  if (event.type === "INSERT_ITEM") {
                    const { success } = jdSystemInsertCheck(
                      context.jdSystem,
                      context.currentProject,
                      event.item
                    );
                    return success;
                    // TODO: Handle the error.
                  }
                  return false;
                },
                target: "insertingItem",
              },
              {
                target: "idle",
                // actions: [() => alert("requestItemInsertion error!")],
              },
            ],
          },
          insertingItem: {
            entry: [
              /**
               * Add the new item to the local context. This ensures an instant
               * response in the UI.
               */
              assignNewUserbaseItem,
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
        /**
         * The changeHandler() that we set up when we open a database fires
         * the event which we listen for here. It fires when the database is
         * initially opened, and whenever any remote changes are detected.
         * When that happens we assign the array of userbaseItems to context.
         */
        type: "compound",
        initial: "listening",
        states: {
          listening: {
            on: {
              USERBASE_ITEMS_UPDATED: {
                actions: [assignUserbaseItems, assignJdSystem],
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
              databaseName: context.currentProject,
              changeHandler: (userbaseItems) => {
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
               *        set `currentProject`, so if this doesn't work we're
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

          userbase
            .insertItem({
              databaseName: context.currentProject,
              item: event.item,
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
      ubCreateProjectItem:
        (context) => (sendBack: (event: DatabaseMachineEvent) => void) => {
          /**
           * This should only be invoked after checking that there's nothing
           * in the current database, but let's be sure.
           */
          if (context.userbaseItems.length !== 0) {
            sendParent<any, any, AuthMachineEvent>({
              type: "ERROR",
              error: {
                name: "DuplicateProjectInsertion",
                message:
                  "You invoked ubCreateProjectItem on a UserbaseItems which already contains an item.",
                status: 903.21, // TODO Ooh they can be JD IDs, nice
              },
            });
          }

          console.debug(
            "%c> ubCreateProjectItem just about to userbase.insertItem()",
            "color: orange"
          );
          userbase
            .insertItem({
              databaseName: context.currentProject,
              item: {
                jdType: "project",
                jdNumber: context.currentProject,
                jdTitle: `Project ${context.currentProject}`,
              },
            })
            .then(() => {
              console.debug(
                "%c> ubCreateProjectItem about to sendBack(PROJECT_CREATED)",
                "color: orange"
              );
              sendBack({ type: "PROJECT_CREATED" });
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
//#endregion
