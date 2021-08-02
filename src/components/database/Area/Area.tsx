import { useContext } from "react";
import { InternalJdSystem, JDProjectNumbers, JDAreaNumbers } from "@types";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Area = ({
  internalJdSystem,
  currentProject,
  currentArea,
  children,
}: {
  internalJdSystem: InternalJdSystem;
  currentProject: JDProjectNumbers;
  currentArea: JDAreaNumbers | null;
  children: React.ReactNode;
}) => {
  const { openArea, openCategory } = useContext(DatabaseMachineReactContext);
  if (currentArea) {
    return (
      /**
       * A grid with 3ch at the start so we indent the list of categories
       * by `00-`.
       *
       * Text size is inherited from `<Project />`.
       */
      <div className="grid" style={{ gridTemplateColumns: "3ch auto" }}>
        {/**
         * Spanned across all columns, the area number + title.
         */}
        <div
          className="cursor-pointer col-span-full"
          onClick={() => {
            openCategory(null);
          }}
        >
          {currentArea}{" "}
          {internalJdSystem[currentProject]!.areas[currentArea]!.title}
        </div>
        {/**
         * In the indented second column, children (which is `<Category />`).
         */}
        <div className="col-start-2">{children}</div>
      </div>
    );
  }

  /**
   * If not, generate and show the sorted list of areas to choose from.
   *
   * They just sit in the container.
   */
  const areas = Object.keys(internalJdSystem[currentProject]!.areas).sort(
    (a, b) => {
      return Number(a.charAt(0)) - Number(b.charAt(0));
    }
  ) as JDAreaNumbers[];

  return (
    <div>
      {areas.map((area, i) => (
        <div className="cursor-pointer" key={i} onClick={() => openArea(area)}>
          {area} {internalJdSystem[currentProject]!.areas[area]!.title}
        </div>
      ))}
    </div>
  );
};
