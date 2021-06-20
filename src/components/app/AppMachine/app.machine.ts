import { createMachine } from "xstate";

export const appMachine = createMachine({
  id: "appMachine",
  initial: "init",
  states: {
    init: {
      on: {
        SEND: "next",
      },
    },
    next: {},
  },
});
