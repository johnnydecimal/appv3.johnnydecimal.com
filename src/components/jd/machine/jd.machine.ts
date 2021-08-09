import { createModel } from "xstate/lib/model";

import { JdSystem, UserbaseItem } from "@types";
import { userbaseItemsGenerator } from "utils";

export const testUserbaseItems = userbaseItemsGenerator(
  ["000"],
  ["00-09"],
  ["00"],
  ["00.00"]
);

const jdModel = createModel(
  {
    userbaseItems: [] as UserbaseItem[],
  },
  { events: {} }
);

export const jdMachine = jdModel.createMachine({
  id: "jdMachine",
  initial: "init",
  context: jdModel.initialContext,
  states: {
    init: {
      /**
       * Soon as we enter the machine we should check that we have something
       * on context. If not that's a straight fail.
       */
      always: [
        {
          target: "error",
          cond: (context) => context.userbaseItems.length === 0,
        },
        { target: "checkingProject" },
      ],
    },
    checkingProject: {
      always: [
        {
          target: "error",
          // cond: (context) => {
          // 	if (context.userbaseItems.length > )
          // 	// Grab the project
          // 	const project = Object.keys(context.userbaseItems)
          // }
        },
      ],
    },
    error: {},
  },
});

/**
 * Okay how's this going to work? You give this thing an unordered bunch of
 * userbaseItems[] and then what?
 *
 * I guess you parse them to a temporary object first, of potential shape
 * JdSystem, and then check *that* for validity?
 *
 * Because this machine isn't going to be sitting running. There's no 'waiting'
 * state here. This is a fire, action, finish sorta machine. So it will *always*
 * take an input...
 *
 * Or does it? Why wouldn't it sit waiting as a service? It's done its initial
 * analysis on the incoming ubI[], and now it expects events which request to
 * CRUD. It's the thing that decides whether those CRUDs are actually sent to
 * the Userbase API.
 *
 * And *also* it needs to check the new stuff returned by the changeHandler().
 * Because we're making sure we don't screw the database with a race condition.
 * But I guess that's just it doing a slightly different thing based on the
 * state that it's in. Because how it responds to an updated list if you're
 * active will be different to how it responds to a fubar initial input.
 *
 * You gotta draw this.
 */

export const sampleJd: JdSystem = {
  "000": {
    title: "pro 000",
    areas: {
      "00-09": {
        title: "area 00-09",
        categories: {
          "00": {
            title: "cat 00",
            ids: {
              "00.00": {
                title: "id 00.00",
              },
            },
          },
        },
      },
    },
  },
};
