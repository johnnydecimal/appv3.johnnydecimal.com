import {
  JdAreaNumbers,
  JdCategoryNumbers,
  JdProjectNumbers,
  JdSystem,
} from "@types";
import { current } from "immer";

export const Breadcrumbs = ({
  jdSystem,
  currentProject,
  currentArea,
  currentCategory,
}: {
  jdSystem: JdSystem;
  currentProject: JdProjectNumbers;
  currentArea: JdAreaNumbers | null;
  currentCategory: JdCategoryNumbers | null;
}) => {
  let breadcrumbs = "";

  if (currentArea && !currentCategory) {
    breadcrumbs =
      currentArea + " " + jdSystem[currentProject]!.areas[currentArea]!.title;
  }

  if (currentArea && currentCategory) {
    breadcrumbs =
      currentArea +
      " ‣ " +
      currentCategory +
      " " +
      jdSystem[currentProject]!.areas[currentArea]!.categories[currentCategory]!
        .title;
  }
  return <div className="bg-red">{breadcrumbs}&nbsp;</div>;
};
