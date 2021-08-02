import { useContext } from "react";
import {
  InternalJdSystem,
  JDProjectNumbers,
  JDAreaNumbers,
  JDCategoryNumbers,
} from "@types";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Category = ({
  internalJdSystem,
  currentProject,
  currentArea,
  currentCategory,
  children,
}: {
  internalJdSystem: InternalJdSystem;
  currentProject: JDProjectNumbers;
  currentArea: JDAreaNumbers;
  currentCategory: JDCategoryNumbers | null;
  children: React.ReactNode;
}) => {
  const { openCategory, openId } = useContext(DatabaseMachineReactContext);
  if (currentCategory) {
    /**
     * If there's a current category, the user has selected a category.
     *
     * We show this category as a header, and render the children below.
     *
     * The header is clickable: doing so brings us back to the list of
     * categories, which we do by clearing `currentId`.
     */
    return (
      <div className="grid" style={{ gridTemplateColumns: "3ch auto" }}>
        {/**
         * Spanned across all columns, the category number + title.
         */}
        <div
          className="cursor-pointer col-span-full"
          onClick={() => {
            openId(null);
          }}
        >
          {currentCategory}{" "}
          {
            internalJdSystem[currentProject]!.areas[currentArea]!.categories[
              currentCategory
            ]!.title
          }
        </div>
        {/**
         * In the indented second column, children (which is `<ID />`).
         */}
        <div className="col-start-2">{children}</div>
      </div>
    );
  }

  /**
   * If there isn't a current category, the user has not selected a category.
   *
   * We render a list of all categories, each of which is clickable. Doing so
   * makes that category the `currentCategory`.
   */
  const categories = Object.keys(
    internalJdSystem[currentProject]!.areas[currentArea]!.categories
  ).sort((a, b) => {
    return Number(a) - Number(b);
  }) as JDCategoryNumbers[];

  return (
    <div>
      {categories.map((category, i) => (
        <div
          className="cursor-pointer"
          key={i}
          onClick={() => openCategory(category)}
        >
          {category}{" "}
          {
            internalJdSystem[currentProject]!.areas[currentArea]!.categories[
              category
            ]!.title
          }
        </div>
      ))}
    </div>
  );
};
