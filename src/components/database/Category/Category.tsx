import { ChangeEvent, SyntheticEvent, useContext, useState } from "react";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Category = ({ children }: { children: React.ReactNode }) => {
  const {
    jdSystem,
    currentProject,
    currentArea,
    currentCategory,
    currentId,
    insertItem,
    // selectArea,
    selectCategory,
    selectId,
  } = useContext(DatabaseMachineReactContext);

  const [newCategory, setNewCategory] = useState("");

  if (currentArea && !currentCategory) {
    /**
     * If there isn't a current category, the user has not selected a category.
     *
     * We render a list of all categories, each of which is clickable. Doing so
     * makes that category the `currentCategory`.
     */

    // Get the list of existing categories.
    const categories = Object.keys(
      jdSystem[currentProject]!.areas[currentArea]!.categories
    ).sort((a, b) => {
      return Number(a) - Number(b);
    }) as JdCategoryNumbers[];

    // Find the next available category. It might be in the middle of the range.
    let nextAvailableCategory: any; // TODO: FIX - any other value TS errors
    const categoryFamily = currentArea.charAt(0);
    // prettier-ignore
    for (let i = 1; i <= 9; i++) {
      const categoryToTest =
        (categoryFamily + i.toString()) as JdCategoryNumbers;
      if (
        !jdSystem[currentProject]!
          .areas[currentArea]!
          .categories[categoryToTest]
      ) {
        nextAvailableCategory = categoryToTest;
        break;
      }
    }

    // Set up the add-a-new-thing handlers.
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setNewCategory(event.target.value);
    };
    const handleSubmit = (event: SyntheticEvent) => {
      event.preventDefault();
      console.debug("🚇 handleSubmit");
      insertItem({
        jdType: "category",
        jdNumber: nextAvailableCategory,
        jdTitle: newCategory,
      });
      setNewCategory("");
    };

    return (
      <div className="category">
        {/* The list of existing categories, if there are any. */}
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
        {/* The add-a-new-category line, if there are any spare. */}
        {categories.length <= 9 && !!nextAvailableCategory ? (
          <form onSubmit={handleSubmit}>
            <span className="text-grey-light">{nextAvailableCategory} </span>
            <input
              className="text-black outline-none w-96"
              placeholder="Add a new category here..."
              onChange={handleChange}
              value={newCategory}
            />
          </form>
        ) : null}
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
