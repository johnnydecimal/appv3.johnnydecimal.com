import { createMachine } from "xstate";

export const database2Machine = createMachine({
  id: "database2Machine",
  initial: "one",
  states: {
    one: {
      on: {
        GO_TO_TWO: "two",
      },
    },
    two: {
      on: {
        GO_TO_ONE: "one",
      },
    },
  },
});
