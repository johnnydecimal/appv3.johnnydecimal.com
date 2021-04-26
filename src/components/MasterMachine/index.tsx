// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/compiled/react";
import { useLocation } from "react-router-dom";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  masterMachine,
  MasterMachineContext,
} from "../../machines/master.machine";
import { SignInForm, ISignInFormData } from "../SignInForm";

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

  const firstLevelState: string = state.toStrings()[0]; // "signedOut"

  // const firstLevel = "signedOut";
  // const secondLevel = "/";
  // const anything1 = routingObject[firstLevel][secondLevel];
  // const anything2 = routingObject[firstLevelState][secondLevel];

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
