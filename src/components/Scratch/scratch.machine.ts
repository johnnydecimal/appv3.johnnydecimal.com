import { createMachine } from "xstate";

export const scratchMachine = createMachine({
  id: "scratch",
  initial: "one",
  states: {
    one: {},
    two: {},
  },
});
