import { useContext } from "react";
import {
  JdSystem,
  JdProjectNumbers,
  JdAreaNumbers,
  JdCategoryNumbers,
} from "@types";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Area = ({
  jdSystem,
  currentProject,
  currentArea,
  children,
}: {
  jdSystem: JdSystem;
  currentProject: JdProjectNumbers;
  currentArea: JdAreaNumbers | null;
  children: React.ReactNode;
}) => {

  const {
    openArea,
    openCategory,
  }: {
    openArea: (area: JdAreaNumbers) => void;
    openCategory: (category: JdCategoryNumbers | null) => void;
  } = useContext(DatabaseMachineReactContext);

  /**
   * If there isn't a current area, the user has not selected an area.
   *
   * We render a list of all areas, each of which is clickable. Doing so makes
   * that area the `currentArea`.
   */
  if (!currentArea) {

    const areas = Object.keys(jdSystem[currentProject]!.areas).sort((a, b) => {
      return Number(a.charAt(0)) - Number(b.charAt(0));
    }) as JdAreaNumbers[];

    return (
      <div>
        {areas.map((area, i) => (
          <div key={i}>
            <span className="cursor-pointer border border-dotted" onClick={() => openArea(area)}>
              <span className="inline-block border border-dashed w-14">{area}</span> {jdSystem[currentProject]!.areas[area]!.title}
            </span>
          </div>
        ))}
      </div>
    );
  }

  /**
   * If there's a current area, the user has selected an area.
   *
   * We show this area as a header, and render the children below.
   *
   * The header is clickable: doing so brings us back to the list of areas,
   * which we do by clearing `currentCategory`.
   */
  return (
    <div className="grid" style={{ gridTemplateColumns: "3ch auto" }}>
      {/**
         * Spanned across all columns, the area number + title.
        <div
          className="cursor-pointer col-span-full"
          onClick={() => {
            openCategory(null);
          }}
        >
          {currentArea} {jdSystem[currentProject]!.areas[currentArea]!.title}
        </div>
          */}
      {/**
         * In the indented second column, children (which is `<Category />`).
         */}
      <div className="col-start-2">{children}</div>
    </div>
  );
};
