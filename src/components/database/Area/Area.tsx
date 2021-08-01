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
  const { openArea } = useContext(DatabaseMachineReactContext);
  /**
   * If `props.currentArea`, we show that area and then the categories
   * will show below.
   *
   * If not, show the *list of areas* that the user can select.
   */
  if (currentArea) {
    return (
      <div className="flex flex-initial">
        <div>.{currentArea}</div>
        <div>{children}</div>
      </div>
    );
  } else {
    const areas = Object.keys(internalJdSystem[currentProject]!.areas);
    return (
      <div>
        {areas.map((area, i) => (
          <div
            className="cursor-pointer"
            key={i}
            onClick={() => openArea(area)}
          >
            &nbsp;{area}
          </div>
        ))}
      </div>
    );
  }
};
