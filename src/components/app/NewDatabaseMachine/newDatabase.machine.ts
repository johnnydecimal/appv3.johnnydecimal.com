import { createModel } from "xstate/lib/model";

const newDatabaseModel = createModel(
  {
    contextKey1: true,
    contextKey2: "a string",
  },
  {
    events: {
      EVENT: () => ({}),
    },
  }
);

export const newDatabaseMachine = newDatabaseModel.createMachine({
  id: "newDatabaseMachine",
  initial: "init",
  states: {
    init: {},
  },
});
