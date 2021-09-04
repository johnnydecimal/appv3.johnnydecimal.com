import { useContext } from "react";
import {
  JdSystem,
  JdAreaNumbers,
  JdCategoryNumbers,
  JdIdNumbers,
} from "@types";

import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Breadcrumbs = () => {
  const {
    jdSystem,
    selectArea,
    selectCategory,
    selectId,
  }: {
    jdSystem: JdSystem;
    selectArea: (area: JdAreaNumbers | null) => void;
    selectCategory: (area: JdCategoryNumbers | null) => void;
    selectId: (area: JdIdNumbers | null) => void;
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
