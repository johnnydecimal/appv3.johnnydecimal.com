import {
  allAreas,
  allCategories,
  allIds,
  userbaseItemsGenerator,
  userbaseItemsToInternalJdSystem,
} from "utils";

it("should work with a project", () => {
  const userbaseItems = userbaseItemsGenerator(["000"]);
  expect(userbaseItems.length).toBe(1);
});

it("should work with an area", () => {
  const userbaseItems = userbaseItemsGenerator(["000"], ["00-09"]);
  expect(userbaseItems.length).toBe(2);
});

it("should work with a category", () => {
  const userbaseItems = userbaseItemsGenerator(["000"], ["00-09"], ["00"]);
  expect(userbaseItems.length).toBe(3);
});

it("should work with an ID", () => {
  const userbaseItems = userbaseItemsGenerator(
    ["000"],
    ["00-09"],
    ["00"],
    ["00.00"]
  );
  expect(userbaseItems.length).toBe(4);
});

it("should generate a one-project JD system", () => {
  const userbaseItems = userbaseItemsGenerator(["000"]);
  const internalJdSystem = userbaseItemsToInternalJdSystem(userbaseItems);
  expect(internalJdSystem).toEqual({
    "000": {
      title: "Project 000",
      areas: {},
    },
  });
});

it("should generate a one-area JD system", () => {
  const userbaseItems = userbaseItemsGenerator(["000"], ["00-09"]);
  const internalJdSystem = userbaseItemsToInternalJdSystem(userbaseItems);
  expect(internalJdSystem).toEqual({
    "000": {
      title: "Project 000",
      areas: {
        "00-09": {
          title: "Area 00-09",
          categories: {},
        },
      },
    },
  });
});

it("should generate a one-category JD system", () => {
  const userbaseItems = userbaseItemsGenerator(["000"], ["00-09"], ["00"]);
  const internalJdSystem = userbaseItemsToInternalJdSystem(userbaseItems);
  expect(internalJdSystem).toEqual({
    "000": {
      title: "Project 000",
      areas: {
        "00-09": {
          title: "Area 00-09",
          categories: {
            "00": {
              title: "Category 00",
              ids: {},
            },
          },
        },
      },
    },
  });
});

it("should generate a one-ID JD system", () => {
  const userbaseItems = userbaseItemsGenerator(
    ["000"],
    ["00-09"],
    ["00"],
    ["00.00"]
  );
  const internalJdSystem = userbaseItemsToInternalJdSystem(userbaseItems);
  expect(internalJdSystem).toEqual({
    "000": {
      title: "Project 000",
      areas: {
        "00-09": {
          title: "Area 00-09",
          categories: {
            "00": {
              title: "Category 00",
              ids: {
                "00.00": {
                  title: "ID 00.00",
                },
              },
            },
          },
        },
      },
    },
  });
});
