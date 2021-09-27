import React, {
  ChangeEvent,
  SyntheticEvent,
  useContext,
  useState,
} from "react";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Area = ({ children }: { children: React.ReactNode }) => {
  const {
    jdSystem,
    currentProject,
    currentArea,
    currentCategory,
    insertItem,
    selectArea,
    selectCategory,
  } = useContext(DatabaseMachineReactContext);

  const [newArea, setNewArea] = useState("");

  if (!currentArea) {
    /**
     * If there isn't a current area, the user has not selected an area.
     *
     * We render a list of all areas, each of which is clickable. Doing so makes
     * that area the `currentArea`.
     */

    // Get the list of existing areas.
    const areas = Object.keys(jdSystem[currentProject]!.areas).sort((a, b) => {
      return Number(a.charAt(0)) - Number(b.charAt(0));
    }) as JdAreaNumbers[];

    // Find the next available area. It might be in the middle of the range.
    let nextAvailableArea: any; // TODO: FIX - any other value TS errors
    // prettier-ignore
    for (let i = 1; i <= 9; i++) {
      const areaToTest =
        i.toString() + '0-' + i.toString() + '9' as JdAreaNumbers;
      if (
        !jdSystem[currentProject]!
          .areas[areaToTest]
      ) {
        nextAvailableArea = areaToTest;
        break;
      }
    }

    // Set up the add-a-new-thing handlers.
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setNewArea(event.target.value);
    };
    const handleSubmit = (event: SyntheticEvent) => {
      event.preventDefault();
      insertItem({
        jdType: "area",
        jdNumber: nextAvailableArea,
        jdTitle: newArea,
      });
      setNewArea("");
    };

    return (
      <div className="area">
        {/* The list of existing areas, if there are any. */}
        {areas.map((area, i) => (
          <div key={i}>
            {/* prettier-ignore */}
            <span className="cursor-pointer" onClick={() => selectArea(area)}>
              {area}
              {" "}
              {jdSystem[currentProject]!
                .areas[area]!
                .title
              }
            </span>
          </div>
        ))}
        {/* The add-a-new-area line, if there are any spare. */}
        {areas.length <= 9 && nextAvailableArea ? (
          <form onSubmit={handleSubmit}>
            <span className="text-grey-light">{nextAvailableArea} </span>
            <input
              className="text-black outline-none w-96"
              placeholder="Add a new area here..."
              onChange={handleChange}
              value={newArea}
            />
          </form>
        ) : null}
      </div>
    );
  } else {
    /**
     * If there's a current area, the user has selected an area.
     *
     * We show this area as a header, and render the children below.
     *
     * The header is clickable: doing so brings us back to the list of areas,
     * which we do by clearing `currentCategory`.
     */
    return (
      <>
        <div className="area">
          {/* prettier-ignore */}
          <span
            className={currentCategory ? "cursor-pointer" : "selected"}
            onClick={() => {
              selectCategory(null);
            }}
          >
            {currentArea}
            {" "}
            {jdSystem[currentProject]!
              .areas[currentArea]!
              .title
            }
          </span>
        </div>

        {/* If there's a currentArea, <DatabaseMachine> has passed us
            <Category> as a child.
            
            Don't wrap this in a <div>! Otherwise we break the grid. We do
            that in <Category>.
          */}
        {children}
      </>
    );
  }
};
