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
  /**
   * If `props.currentArea`, we show that area and then the categories
   * will show below.
   */
  if (currentArea) {
    return (
      <div className="flex flex-initial">
        <h3 className="cursor-pointer" onClick={() => openCategory(null)}>
          .{currentArea}
        </h3>
        <div>{children}</div> {/* <Categories /> */}
      </div>
    );
  }

  /**
   * If not, generate and show the sorted list of areas to choose from.
   */
  const areas = Object.keys(internalJdSystem[currentProject]!.areas).sort(
    (a, b) => {
      return Number(a.charAt(0)) - Number(b.charAt(0));
    }
  );
  return (
    <div className="border-l border-black">
      {areas.map((area, i) => (
        <div className="cursor-pointer" key={i} onClick={() => openArea(area)}>
          &nbsp;{area}
        </div>
      ))}
    </div>
  );
};
