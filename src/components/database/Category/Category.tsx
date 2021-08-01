import { useContext } from "react";
import {
  InternalJdSystem,
  JDProjectNumbers,
  JDAreaNumbers,
  JDCategoryNumbers,
} from "@types";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Category = ({
  children,
  currentProject,
  currentArea,
  currentCategory,
  internalJdSystem,
}: {
  children: React.ReactNode;
  currentProject: JDProjectNumbers;
  currentArea: JDAreaNumbers;
  currentCategory: JDCategoryNumbers | null;
  internalJdSystem: InternalJdSystem;
}) => {
  const { openCategory } = useContext(DatabaseMachineReactContext);
  /**
   * If `props.currentArea`, we show that area and then the categories
   * will show below.
   *
   * If not, show the *list of areas* that the user can select.
   */
  if (currentCategory) {
    return (
      <div className="flex flex-initial">
        <div>.{currentCategory}</div>
        <div>{children}</div>
      </div>
    );
  } else {
    // Generate the list of areas to show
    // @ts-ignore
    const categories = Object.keys(
      // @ts-ignore
      internalJdSystem[currentProject].areas[currentArea].categories
    );
    return (
      <div>
        {categories.map((category, i) => (
          <div key={i} onClick={() => openCategory(category)}>
            &nbsp;{category}
          </div>
        ))}
      </div>
    );
  }
};
