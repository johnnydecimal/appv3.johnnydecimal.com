// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { createContext } from "react";

import type { DatabaseMachineReactContextValue } from "../DatabaseMachine/DatabaseMachine"

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const DatabaseMachineReactContext = createContext<any>({});
