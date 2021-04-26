// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/compiled/react";
import React from "react";
import { useLocation } from "react-router-dom";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  masterMachine,
  MasterMachineContext,
} from "../machines/master.machine";
import { SignInForm, ISignInFormData } from "./SignInForm";

// === TEST ===
const FourOhFour = () => <div>404</div>;
// const SignInForm = () => <div>SignInForm</div>;
const JDApp = () => <div>JD App</div>;

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const MasterMachine = () => {
  const [state, send] = useMachine(masterMachine, {
    devTools: true,
  });

  const { pathname } = useLocation();

  /**
   * Declare the functions which are the things we're going to pass down to our
   * child components. These are the functions which send events, so we don't
   * ever send `send` down the tree. Ref. video at 52:00.
   */
  const handleSignIn = (data: ISignInFormData) => {
    send({
      type: "TRY_SIGNIN",
      data,
    });
  };

  const handleSignOut = () => {
    send("TRY_SIGNOUT");
  };

  const MasterContextValue = {
    handleSignIn,
    handleSignOut,
    state,
  };

  const MasterMachineContextWrapper: React.FC = ({ children }) => {
    return (
      <MasterMachineContext.Provider value={MasterContextValue}>
        {children}
      </MasterMachineContext.Provider>
    );
  };

  switch (state.toStrings()[0]) {
    case "init":
      return (
        <MasterMachineContextWrapper>
          {state.toStrings()[0]}
        </MasterMachineContextWrapper>
      );
    case "signedOut":
      return (
        <MasterMachineContextWrapper>
          <SignInForm />
        </MasterMachineContextWrapper>
      );
    case "signedIn":
      return (
        <MasterMachineContextWrapper>
          {state.toStrings()[0]}
        </MasterMachineContextWrapper>
      );
    default:
      return (
        <MasterMachineContextWrapper>
          {state.toStrings()[0]}
        </MasterMachineContextWrapper>
      );
  }
};
