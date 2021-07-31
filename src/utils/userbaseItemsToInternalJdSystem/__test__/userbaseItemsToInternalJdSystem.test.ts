import {
  allAreas,
  allCategories,
  allIds,
  userbaseItemsGenerator,
  userbaseItemsToInternalJdSystem,
} from "utils";

it("should work with a project", (done) => {
  const userbaseItems = userbaseItemsGenerator(["000"]);
  if (userbaseItems.length === 1) {
    done();
  }
});
it("should work with an area", (done) => {
  const userbaseItems = userbaseItemsGenerator(["000"], ["00-09"]);
  if (userbaseItems.length === 2) {
    done();
  }
});
it("should work with a category", (done) => {
  const userbaseItems = userbaseItemsGenerator(["000"], ["00-09"], ["00"]);
  if (userbaseItems.length === 3) {
    done();
  }
});
it("should work with an ID", (done) => {
  const userbaseItems = userbaseItemsGenerator(
    ["000"],
    ["00-09"],
    ["00"],
    ["00.00"]
  );
  if (userbaseItems.length === 4) {
    done();
  }
});

it("should generate a JD system", (done) => {
  const userbaseItems = userbaseItemsGenerator(
    ["000"],
    ["00-09"],
    ["00"],
    ["00.00"]
  );
  const internalJdSystem = userbaseItemsToInternalJdSystem(userbaseItems);
  if (
    internalJdSystem["000"]?.areas["00-09"]?.categories["00"]?.ids["00.00"]
      ?.title === "ID 00.00"
  ) {
    done();
  }
});
