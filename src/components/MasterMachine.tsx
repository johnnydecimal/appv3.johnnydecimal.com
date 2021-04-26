// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/compiled/react";
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

  const jsxThing = <SignInForm />;
  console.log(typeof jsxThing);

  const topLevelState = state.toStrings()[0];
  // @ts-expect-error
  if (typeof routingObject[topLevelState][pathname] === "object") {
    return (
      <MasterMachineContext.Provider value={MasterContextValue}>
        {/* @ts-expect-error */}
        {routingObject[topLevelState][pathname]}
      </MasterMachineContext.Provider>
    );
  } else {
    return <div>error</div>;
  }

  // == Render   ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
  /*
  try {
    console.log("topLevelState, pathname:", topLevelState, pathname);
    // @ts-expect-error
    console.log("trying: ", routingObject[topLevelState][pathname]);
    // @ts-expect-error
    const renderJSX = routingObject[topLevelState][pathname]();
    return (
      <MasterMachineContext.Provider value={MasterContextValue}>
        {renderJSX}
      </MasterMachineContext.Provider>
    );
  } catch (error) {
    console.log(error);
    return <div>error, see console</div>;
  }
  */
};
