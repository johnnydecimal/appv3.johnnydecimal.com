import { useContext } from "react";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Category = ({
  jdSystem,
  currentProject,
  currentArea,
  currentCategory,
  children,
}: {
  jdSystem: JdSystem;
  currentProject: JdProjectNumbers;
  currentArea: JdAreaNumbers;
  currentCategory: JdCategoryNumbers | null;
  children: React.ReactNode;
}) => {
  const { selectCategory, selectId } = useContext(DatabaseMachineReactContext);
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
            selectId(null);
          }}
        >
          {currentCategory}{" "}
          {
            jdSystem[currentProject]!.areas[currentArea]!.categories[
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
    jdSystem[currentProject]!.areas[currentArea]!.categories
  ).sort((a, b) => {
    return Number(a) - Number(b);
  }) as JdCategoryNumbers[];

  return (
    <div>
      {categories.map((category, i) => (
        <div
          className="cursor-pointer"
          key={i}
          onClick={() => selectCategory(category)}
        >
          {category}{" "}
          {
            jdSystem[currentProject]!.areas[currentArea]!.categories[category]!
              .title
          }
        </div>
      ))}
    </div>
  );
};
