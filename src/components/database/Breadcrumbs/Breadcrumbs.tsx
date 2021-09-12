import { useContext } from "react";

import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Breadcrumbs = () => {
  const {
    jdSystem,
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
   */

  return <div className="bg-red">breadcrumbs</div>;
};
