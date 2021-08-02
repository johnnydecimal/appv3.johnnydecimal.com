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
  /**
   * If `props.currentArea`, we show that area and then the categories
   * will show below.
   */
  if (currentCategory) {
    return (
      /**
       * A grid with 3ch at the start so we indent the list of IDs
       * by `00 `.
       *
       * Text size is inherited from `<Project />`.
       */
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
   * If not, generate and show the sorted list of categories to choose from.
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
