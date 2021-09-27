import { useContext } from "react";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Category = ({ children }: { children: React.ReactNode }) => {
  const {
    jdSystem,
    currentProject,
    currentArea,
    currentCategory,
    currentId,
    // selectArea,
    selectCategory,
    selectId,
  } = useContext(DatabaseMachineReactContext);

  if (currentArea && !currentCategory) {
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

    /**
     * If there are no categories, display a placeholder rather than nothing.
     */
    if (categories.length === 0) {
      return (
        <div className="category text-grey-light">
          <span className="">41 </span>
          <input
            className="outline-none w-96 text-grey-light"
            placeholder="Add a new category here..."
          />
        </div>
      );
    }

    return (
      <div className="category">
        {categories.map((category, i) => (
          <div key={i}>
            {/* prettier-ignore */}
            <span
              className="cursor-pointer"
              onClick={() => selectCategory(category)}
            >
              {category}
              {" "}
              {jdSystem[currentProject]!
                .areas[currentArea]!
                .categories[category]!
                .title
              }
            </span>
          </div>
        ))}
      </div>
    );
  } else if (currentArea && currentCategory) {
    /**
     * If there's a current category, the user has selected a category.
     *
     * We show this category as a header, and render the children below.
     *
     * The header is clickable: doing so brings us back to the list of
     * categories, which we do by clearing `currentId`.
     */
    return (
      <>
        <div className="category">
          {/* prettier-ignore */}
          <span
            className={currentId ? "cursor-pointer" : 'selected'}
            onClick={() => {
              selectId(null);
            }}
          >
            {currentCategory}
            {" "}
            {jdSystem[currentProject]!
              .areas[currentArea]!
              .categories[currentCategory]!
              .title
            }
          </span>
        </div>

        {/* If there's a currentCategory, <DatabaseMachine> has passed us
            <ID> as a child.
            
            Don't wrap this in a <div>! Otherwise we break the grid. We do
            that in <ID>.
          */}
        {children}
      </>
    );
  } else {
    return <div>Impossible</div>; // TODO: test/handle.
  }
};
