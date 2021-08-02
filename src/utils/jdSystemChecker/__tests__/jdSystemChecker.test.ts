import { JdSystem } from "../../../@types/JdSystem";
import { isAreaDuplicate } from "../jdSystemChecker";

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
  expect(() => isAreaDuplicate(sampleProject, "000", "00-09")).toBeTruthy;
});
