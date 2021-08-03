import { JdSystem } from "../../../@types/JdSystem";
import {
  isAreaDuplicate,
  isCategoryDuplicate,
  isIdDuplicate,
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
  expect(isAreaDuplicate(sampleProject, "000", "00-09")).toBeTruthy();
  expect(isAreaDuplicate(sampleProject, "000", "10-19")).toBeFalsy();
});

it("checks for duplicate category", () => {
  expect(isCategoryDuplicate(sampleProject, "000", "00")).toBeTruthy();
  expect(isCategoryDuplicate(sampleProject, "000", "01")).toBeFalsy();
});

it("checks for duplicate ID", () => {
  expect(isIdDuplicate(sampleProject, "000", "00.00")).toBeTruthy();
  expect(isIdDuplicate(sampleProject, "000", "00.01")).toBeFalsy();
});

it("checks that a parent area exists for a category", () => {
  expect(parentAreaExists(sampleProject, "000", "00")).toBeTruthy();
  expect(parentAreaExists(sampleProject, "000", "10")).toBeFalsy();
});

it("checks that a parent category exists for an ID", () => {
  expect(parentCategoryExists(sampleProject, "000", "00.00")).toBeTruthy();
  expect(parentCategoryExists(sampleProject, "000", "01.00")).toBeFalsy();
});
