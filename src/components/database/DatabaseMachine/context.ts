// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { createContext } from "react";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const DatabaseMachineReactContext = createContext<Partial<DatabaseMachineReactContextValue>>({});
