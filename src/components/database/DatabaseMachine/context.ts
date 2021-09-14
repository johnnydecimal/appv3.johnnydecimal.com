// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { createContext } from "react";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * We load this up with default values. The alternative is to make it a
 * <Partial<DMRCV>> but then we have to check for the existence of every value
 * when we consume context and that's really boring.
 */
export const DatabaseMachineReactContext =
  createContext<DatabaseMachineReactContextValue>({
    changeDatabase: () => {},
    insertItem: () => {},
    jdSystem: {},
    currentProject: "000",
    currentArea: null,
    currentCategory: null,
    currentId: null,
    selectArea: () => {},
    selectCategory: () => {},
    selectId: () => {},
  });
