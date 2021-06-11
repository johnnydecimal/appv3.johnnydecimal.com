// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/compiled/react";
import { useLocation } from "react-router-dom";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { masterMachine, MasterMachineContext } from "./master.machine";
import { SignInForm, ISignInFormData } from "../SignInForm";
import { JDApp } from "../JDApp";

// === TEST ===
const FourOhFour = () => <div>404</div>;
// const SignInForm = () => <div>SignInForm</div>;

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const MasterMachine = () => {
  /**
   * Start the machine.
   */
  const [state, send] = useMachine(masterMachine, {
    devTools: true,
  });

  /**
   * We render a component based on state + route. Get the current pathname
   * so we can use it later.
   */
  const { pathname } = useLocation();

  /**
   * Declare the functions which are the things we're going to pass down to our
   * child components. These are the functions which send events, so we don't
   * ever send `send` down the tree.
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

  /**
   * Wrap these functions and `state` in an object which we'll use as context
   * value, passing it down to child components.
   */
  const MasterContextValue = {
    handleSignIn,
    handleSignOut,
    state,
  };

  /**
   * Declare our routing object.
   */
  const routingObject = {
    init: {
      "/": <FourOhFour />,
    },
    signedOut: {
      "/": <SignInForm />,
      "/404": <FourOhFour />,
    },
    signedIn: {
      "/": <JDApp />,
    },
  };

  /**
   * Our state is nested, but for routing we only care about the first-level
   * value.
   */
  const firstLevelState: string = state.toStrings()[0]; // "signedOut"

  // @ts-expect-error
  if (typeof routingObject[firstLevelState][pathname] === "object") {
    // If we find an object, it's a JSX item. Render it.
    return (
      <MasterMachineContext.Provider value={MasterContextValue}>
        {/* @ts-expect-error */}
        {routingObject[firstLevelState][pathname]}
      </MasterMachineContext.Provider>
    );
  } else {
    // If we don't, return some sort of error (TBC).
    return <div>error</div>;
  }
};
