// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/compiled/react";
import { Redirect, useLocation } from "react-router-dom";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { masterMachine, MasterMachineContext } from "./master.machine";
import { SignInForm, ISignInFormData } from "../SignInForm";
import { SignUpForm, ISignUpFormData } from "../SignUpForm";
import { JDApp } from "../JDApp";

// === TEST ===
const FourOhFour = () => <div>404</div>;
const WaitOne = () => <div>Wait one. Doing networks.</div>;
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
      type: "attempt signin",
      data,
    });
  };

  const handleSignUp = (data: ISignUpFormData) => {
    send({
      type: "TRY_SIGNUP",
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
    handleSignUp,
    state,
  };

  /**
   * Declare our routing object.
   *
   * So our primary concern is state: what state are we in? From there, what
   * path are we at? If it's something valid, render the result.
   *
   * The routing logic below has a fallback built-in: if a state matches but a
   * path does not, render a `<Redirect to="/" />.
   */
  const routingObject = {
    init: {
      "/": <WaitOne />,
      "/signup": <WaitOne />,
    },
    signedOut: {
      "/": <SignInForm />,
      "/404": <FourOhFour />,
    },
    signedIn: {
      "/": <JDApp />,
    },
    signUp: {
      "/signup": <SignUpForm />,
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
    // Nothing matched: if in doubt, just redirect back to the home screen.
    return <Redirect to="/" />;
  }
};
