import { useContext } from "react";

import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

/**
 * Don't forget, which you did, that the breadcrumbs also need to be clickable
 * so that the user can go back.
 *
 * And hoverable with some sort of state indicator so they know this will
 * happen.
 */
export const Breadcrumbs: React.FC = () => {
  const { currentProject } = useContext(
    DatabaseMachineReactContext
  ) as DatabaseMachineReactContextType;

  console.log(currentProject);

  return <div className="border border-dotted border-red">breadcrumbs</div>;
};
