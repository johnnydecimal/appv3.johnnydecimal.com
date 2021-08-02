import { useContext } from "react";
import {
  InternalJdSystem,
  JDProjectNumbers,
  JDAreaNumbers,
  JDCategoryNumbers,
  JDIdNumbers,
} from "@types";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const ID = ({
  internalJdSystem,
  currentProject,
  currentArea,
  currentCategory,
  currentId,
}: // children,
{
  internalJdSystem: InternalJdSystem;
  currentProject: JDProjectNumbers;
  currentArea: JDAreaNumbers;
  currentCategory: JDCategoryNumbers;
  currentId: JDIdNumbers | null;
  // children: React.ReactNode;
}) => {
  const { openCategory, openId } = useContext(DatabaseMachineReactContext);
  if (currentId) {
    return (
      /**
       * A grid with 3ch at the start so we indent the list of IDs
       * by `00 `.
       *
       * Text size is inherited from `<Project />`.
       */
      <div className="grid" style={{ gridTemplateColumns: "3ch auto" }}>
        {/**
         * Spanned across all columns, the ID number + title.
         */}
        <div
          className="cursor-pointer col-span-full"
          onClick={() => {
            openId(null);
          }}
        >
          {currentId}{" "}
          {
            internalJdSystem[currentProject]!.areas[currentArea]!.categories[
              currentCategory
            ]!.ids[currentId]!.title
          }
        </div>
      </div>
    );
  }

  /**
   * If not, generate and show the sorted list of categories to choose from.
   */
  const ids = Object.keys(
    internalJdSystem[currentProject]!.areas[currentArea]!.categories[
      currentCategory
    ]!.ids
  ).sort((a, b) => {
    return Number(a) - Number(b);
  }) as JDIdNumbers[];

  return (
    <div>
      {ids.map((id, i) => (
        <div
          className="cursor-pointer"
          key={i}
          onClick={() => openCategory(id)}
        >
          {id}{" "}
          {
            internalJdSystem[currentProject]!.areas[currentArea]!.categories[
              currentCategory
            ]!.ids[id]!.title
          }
        </div>
      ))}
    </div>
  );
};
