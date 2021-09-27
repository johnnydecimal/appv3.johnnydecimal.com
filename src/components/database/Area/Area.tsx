import React, { useContext } from "react";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Area = ({ children }: { children: React.ReactNode }) => {
  const {
    jdSystem,
    currentProject,
    currentArea,
    currentCategory,
    selectArea,
    selectCategory,
  } = useContext(DatabaseMachineReactContext);

  if (!currentArea) {
    /**
     * If there isn't a current area, the user has not selected an area.
     *
     * We render a list of all areas, each of which is clickable. Doing so makes
     * that area the `currentArea`.
     */
    const areas = Object.keys(jdSystem[currentProject]!.areas).sort((a, b) => {
      return Number(a.charAt(0)) - Number(b.charAt(0));
    }) as JdAreaNumbers[];

    return (
      <div className="area">
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
