// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { createContext } from "react";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const AuthMachineReactContext =
  createContext<AuthMachineReactContextValue>({
    handleAcknowledgeDireWarningAboutE2EEncryption: () => {},
    handleDeleteUser: () => {},
    handleSignUp: () => {},
    handleSignIn: () => {},
    handleSignOut: () => {},
    switchToSignIn: () => {},
    switchToSignUp: () => {},
    send: "", // TODO: Fudging TS here, we know this is wrong
    state: "", // TODO: Fudging TS here, we know this is wrong
  });
