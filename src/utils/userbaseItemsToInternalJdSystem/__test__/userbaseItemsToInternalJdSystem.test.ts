import {
  allAreas,
  allCategories,
  allIds,
  userbaseItemsGenerator,
  userbaseItemsToInternalJdSystem,
} from "utils";

const fullJdSystem = userbaseItemsToInternalJdSystem(
  userbaseItemsGenerator(["000"], allAreas, allCategories, allIds)
);

it("should run a test", (done) => {
  if (
    fullJdSystem["000"]!.areas["00-09"]!.categories["00"]!.ids["00.00"]!
      .title === "ID 00.00"
  ) {
    done();
  }
});
