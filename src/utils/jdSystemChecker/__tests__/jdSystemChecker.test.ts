import { JdItem, JdSystem } from "../../../@types";
import {
  areaIsNotDuplicate,
  categoryIsNotDuplicate,
  idIsNotDuplicate,
  jdSystemInsertCheck,
  parentAreaExists,
  parentCategoryExists,
} from "../jdSystemChecker";

const sampleProject: JdSystem = {
  "000": {
    title: "Project",
    areas: {
      "00-09": {
        title: "Area",
        categories: {
          "00": {
            title: "Category",
            ids: {
              "00.00": {
                title: "ID",
              },
            },
          },
        },
      },
    },
  },
};

it("checks for duplicate area", () => {
  expect(areaIsNotDuplicate(sampleProject, "000", "00-09")).toBeFalsy();
  expect(areaIsNotDuplicate(sampleProject, "000", "10-19")).toBeTruthy();
});

it("checks for duplicate category", () => {
  expect(categoryIsNotDuplicate(sampleProject, "000", "00")).toBeFalsy();
  expect(categoryIsNotDuplicate(sampleProject, "000", "01")).toBeTruthy();
});

it("checks for duplicate ID", () => {
  expect(idIsNotDuplicate(sampleProject, "000", "00.00")).toBeFalsy();
  expect(idIsNotDuplicate(sampleProject, "000", "00.01")).toBeTruthy();
});

it("checks that a parent area exists for a category", () => {
  expect(parentAreaExists(sampleProject, "000", "00")).toBeTruthy();
  expect(parentAreaExists(sampleProject, "000", "10")).toBeFalsy();
});

it("checks that a parent category exists for an ID", () => {
  expect(parentCategoryExists(sampleProject, "000", "00.00")).toBeTruthy();
  expect(parentCategoryExists(sampleProject, "000", "99.90")).toBeFalsy();
});

it("checks that you can't add a duplicate area", () => {
  const areaToCheck: JdItem = {
    jdType: "area",
    jdNumber: "00-09",
    jdTitle: "Area 00-09",
  };
  expect(jdSystemInsertCheck(sampleProject, "000", areaToCheck)).toStrictEqual({
    success: false,
    message: "The area already exists.",
  });
});

it("checks that you can add a valid area", () => {
  const areaToCheck: JdItem = {
    jdType: "area",
    jdNumber: "10-19",
    jdTitle: "Area 10-19",
  };
  expect(jdSystemInsertCheck(sampleProject, "000", areaToCheck)).toStrictEqual({
    success: true,
  });
});

it("checks that you can't add a duplicate category", () => {
  const categoryToCheck: JdItem = {
    jdType: "category",
    jdNumber: "00",
    jdTitle: "Category 00-09",
  };
  expect(
    jdSystemInsertCheck(sampleProject, "000", categoryToCheck)
  ).toStrictEqual({
    success: false,
    message: "The category already exists.",
  });
});

it("checks that you can't add a category if the parent area doesn't exist", () => {
  const categoryToCheck: JdItem = {
    jdType: "category",
    jdNumber: "10",
    jdTitle: "Category 10-19",
  };
  expect(
    jdSystemInsertCheck(sampleProject, "000", categoryToCheck)
  ).toStrictEqual({
    success: false,
    message: "Parent area does not exist for this category.",
  });
});

it("checks that you can add a valid category", () => {
  const categoryToCheck: JdItem = {
    jdType: "category",
    jdNumber: "01",
    jdTitle: "Category 01",
  };
  expect(
    jdSystemInsertCheck(sampleProject, "000", categoryToCheck)
  ).toStrictEqual({
    success: true,
  });
});

it("checks that you can't add a duplicate ID", () => {
  const idToCheck: JdItem = {
    jdType: "id",
    jdNumber: "00.00",
    jdTitle: "ID 00.00",
  };
  expect(jdSystemInsertCheck(sampleProject, "000", idToCheck)).toStrictEqual({
    success: false,
    message: "The ID already exists.",
  });
});

it("checks that you can't add an ID if the parent category doesn't exist", () => {
  const idToCheck: JdItem = {
    jdType: "id",
    jdNumber: "99.99",
    jdTitle: "ID 99.99",
  };
  expect(jdSystemInsertCheck(sampleProject, "000", idToCheck)).toStrictEqual({
    success: false,
    message: "Parent category does not exist for this ID.",
  });
});

it("checks that you can add a valid ID", () => {
  const idToCheck: JdItem = {
    jdType: "id",
    jdNumber: "00.01",
    jdTitle: "ID 00.01",
  };
  expect(jdSystemInsertCheck(sampleProject, "000", idToCheck)).toStrictEqual({
    success: true,
  });
});
