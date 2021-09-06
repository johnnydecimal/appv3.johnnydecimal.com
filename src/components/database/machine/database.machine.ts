// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { ContextFrom, EventFrom, send as xstateSend, sendParent } from "xstate";
import { createModel } from "xstate/lib/model";
import userbase, { Database } from "userbase-js";
import { nanoid } from "nanoid";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { userbaseItemsToJdSystem } from "utils";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { AuthMachineEvent, UserbaseItem } from "@types";
import { jdSystemInsertCheck } from "utils";

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
      CALLBACK_USERBASE_ITEMS_UPDATED: (userbaseItems: UserbaseItem[]) => ({
        userbaseItems,
      }),

      /**
       * Sent by ubOpenDatabase when it successfully opens a database.
       */
      CALLBACK_REPORT_DATABASE_OPENED: () => ({}),

      /**
       * When we open a new database, if it needs to have the project item
       * set up we send this specific event. Makes the machine easier to reason.
       */
      // CREATE_PROJECT_ITEM: () => ({}),
      CALLBACK_PROJECT_CREATED: () => ({}),

      /**
       * Sent by the helper function whenever we want to add a new item to the
       * current database. Note that we don't insert a UserbaseItem, there's a
       * bunch of stuff on there (itemId) that Userbase generates for us.
       */
      REQUEST_INSERT_ITEM: (item: JdItem) => ({ item }),

      /**
       * Sent by ubInsertItem when it was successful.
       */
      CALLBACK_ITEM_INSERTED: () => ({}),

      /**
       * Sent by the helper functions when the user interacts with the app.
       */
      OPEN_AREA: (area: JdAreaNumbers | null) => ({ area }),
      OPEN_CATEGORY: (category: JdCategoryNumbers | null) => ({ category }),
      OPEN_ID: (id: JdIdNumbers | null) => ({ id }),

      /**
       * Testing #TODO delete
       */
      ALERT: () => ({}),
    },
  }
);

export type DatabaseMachineContext = ContextFrom<typeof databaseModel>;
export type DatabaseMachineEvent = EventFrom<typeof databaseModel>;

/**
 * A `send` function typed to this machine.
 */
const send = (event: DatabaseMachineEvent) =>
  xstateSend<any, any, DatabaseMachineEvent>(event);

//#region  ===-===  Actions     ===-===-===-===-===-===-===-===-===-===-===-===
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
    if (event.type !== "REQUEST_INSERT_ITEM") {
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

const assignUserbaseItems =
  databaseModel.assign<"CALLBACK_USERBASE_ITEMS_UPDATED">({
    /**
     * This is fired by the changeHandler() and contains the entire array of
     * userbaseItems.
     */
    userbaseItems: (context, event) => event.userbaseItems,
  });

const assignJdSystem = databaseModel.assign<"CALLBACK_USERBASE_ITEMS_UPDATED">({
  jdSystem: (context, event) => {
    const result = userbaseItemsToJdSystem(event.userbaseItems);
    if (result.success) {
      return result.data;
    }
    // TODO: improve handling of errors
    return context.jdSystem;
  },
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

//#region  ===-===  Main        ===-===-===-===-===-===-===-===-===-===-===-===
export const databaseMachine = databaseModel.createMachine(
  {
    id: "databaseMachine",
    type: "compound",
    initial: "init",
    context: databaseModel.initialContext,
    invoke: {
      /**
       * We need a top-level `invoke` because the `changeHandler` which is
       * set up in this service needs to stay alive.
       */
      src: "ubOpenDatabase",
    },
    on: {
      CALLBACK_USERBASE_ITEMS_UPDATED: {
        actions: [assignUserbaseItems, assignJdSystem],
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
    },
    states: {
      init: {
        on: {
          CALLBACK_REPORT_DATABASE_OPENED: {
            target: "databaseOpen",
            actions: [
              sendParent<any, any, AuthMachineEvent>({
                type: "SENDPARENT_REPORT_DATABASE_OPENED",
              }),
            ],
          },
        },
      },
      databaseOpen: {
        always: [
          {
            cond: (context) => context.userbaseItems.length === 0,
            target: "creatingProjectItem",
          },
        ],
        on: {
          REQUEST_INSERT_ITEM: [
            {
              cond: (context, event) => {
                if (event.type === "REQUEST_INSERT_ITEM") {
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
              // Handle the error here.
            },
          ],
        },
      },
      creatingProjectItem: {
        invoke: {
          src: "ubCreateProjectItem",
        },
        always: [
          /**
           * So we've inserted the item, but we still need to wait for
           * the cH() to fetch the items, and then for those items to be
           * processed by the assign action, before we can go back to
           * databaseOpen. Otherwise we end up in a loop because it'll
           * check its context, length will be zero, etc.
           */
          {
            cond: (context) => context.userbaseItems.length > 0,
            target: "databaseOpen",
          },
        ],
      },
      insertingItem: {
        invoke: {
          src: "ubInsertItem",
        },
        on: {
          CALLBACK_ITEM_INSERTED: {
            target: "databaseOpen",
          },
        },
      },
    },
  },
  {
    services: {
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

                sendBack({
                  type: "CALLBACK_USERBASE_ITEMS_UPDATED",
                  userbaseItems,
                });
              },
            })
            .then(() => {
              sendBack({ type: "CALLBACK_REPORT_DATABASE_OPENED" });
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
          if (event.type !== "REQUEST_INSERT_ITEM") {
            /**
             * Twist TypeScript's arm.
             */
            sendParent<any, any, AuthMachineEvent>({
              type: "ERROR",
              error: {
                name: "UserbaseInsertItemCallError",
                message: `userbaseInsertItem() was invoked from a state that
                  wasn't reached by sending REQUEST_INSERT_ITEM. As a result,
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
              sendBack({ type: "CALLBACK_ITEM_INSERTED" });
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
              /**
               * Doesn't actually do anything -- just for the inspector.
               * #TODO figure out how to handle timeouts?
               */
              sendBack({ type: "CALLBACK_PROJECT_CREATED" });
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
