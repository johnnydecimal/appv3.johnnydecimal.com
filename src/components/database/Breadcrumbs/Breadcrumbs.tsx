import { useContext } from "react";

import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Breadcrumbs = () => {
  const {
    jdSystem,
    currentProject,
    currentArea,
    currentCategory,
    currentId,
    selectArea,
    selectCategory,
    selectId,
  } = useContext(DatabaseMachineReactContext);

  /**
   * Let's try and actually design this thing rather than just hacking about as
   * usual.
   *
   * It's a breadcrumb component. Simple! But it has to be able to communicate
   * with the machine, as it's clickable.
   *
   * We're going to need the current[Everything] so we can figure out what's
   * what.
   *
   * - If nothing selected:
   *   - Show nothing.
   * - If area selected:
   *   - Show full area.
   *   - Underneath we'll now be showing a list of categories.
   *   - So try showing a 'go to the top' sort of symbol, which is clickable,
   *     and then the area name, which is not.
   * - If category selected:
   *   - Show area number then full category.
   *   - Underneath we'll now be showing a list of IDs.
   *   - Clicking the 'go to the top' goes back to the top.
   *   - Clicking the x0-x9 truncated area takes you to the list of categories
   *     (which is the area).
   *   - Clicking the category does nothing.
   */

  /** Nothing is selected. */
  if (!currentArea) {
    return <div className="border border-red">[null]</div>;
  }

  /** An area is selected. */
  if (currentArea && !currentCategory) {
    const areaTitle =
      jdSystem[currentProject]!
        .areas[currentArea]!
        .title;

    return (
      <div className="border border-red">
        {currentArea} {areaTitle}
      </div>
    );
  }

  /** A category is selected. */
  if (currentCategory && !currentId) {
    const categoryTitle =
      jdSystem[currentProject]!
        .areas[currentArea]!
        .categories[currentCategory]!
        .title;
        
        return (
          <div className="border border-red">
        {currentArea} ‣ {currentCategory} {categoryTitle}
      </div>
    );
  }
  
  /** An ID is selected. */
  if (currentId) {
    const categoryTitle =
      jdSystem[currentProject]!
        .areas[currentArea]!
        .categories[currentCategory!]!
        .title;
    const idTitle =
      jdSystem[currentProject]!
        .areas[currentArea]!
        .categories[currentCategory!]!
        .ids[currentId]!
        .title;

    return <div className="border border-red">
      {currentArea} ‣ {currentCategory} {categoryTitle} ‣ {currentId} {idTitle}
    </div>
  }

  return <div className="border border-red">breadcrumbs</div>;
};
