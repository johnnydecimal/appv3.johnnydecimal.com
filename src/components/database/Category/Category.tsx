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
  const { openCategory } = useContext(DatabaseMachineReactContext);
  /**
   * If `props.currentArea`, we show that area and then the categories
   * will show below.
   */
  if (currentCategory) {
    return (
      <div className="flex flex-initial">
        <div>.{currentCategory}</div>
        <div>{children}</div> {/* <IDs /> */}
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
  });
  return (
    <div className="border-l border-black">
      {categories.map((category, i) => (
        <div
          className="cursor-pointer"
          key={i}
          onClick={() => openCategory(category)}
        >
          &nbsp;{category}
        </div>
      ))}
    </div>
  );
};
