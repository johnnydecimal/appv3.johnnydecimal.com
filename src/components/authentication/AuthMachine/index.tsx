// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/compiled/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { masterMachine, MasterMachineContext } from "./auth.machine";
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
    send("attempt signout");
  };

  const switchToSignIn = () => {
    send("switch to the signin page");
  };

  const switchToSignUp = () => {
    send("switch to the signup page");
  };

  const handleAcknowledgeDireWarningAboutE2EEncryption = () => {
    send("acknowledge dire warning about e2e encryption");
  };

  /**
   * Wrap these functions and `state` in an object which we'll use as context
   * value, passing it down to child components.
   */
  const MasterContextValue = {
    handleAcknowledgeDireWarningAboutE2EEncryption,
    handleSignIn,
    handleSignOut,
    handleSignUp,
    state,
    switchToSignIn,
    switchToSignUp,
  };

  let RenderComponent;
  switch (true) {
    case state.matches("init"):
      RenderComponent = <WaitOne />;
      break;
    case state.matches("signedOut"):
      RenderComponent = <SignInForm />;
      break;
    case state.matches("signUp"):
      RenderComponent = <SignUpForm />;
      break;
    case state.matches("signedIn"):
      RenderComponent = <JDApp />;
      break;
    default:
      RenderComponent = <FourOhFour />;
      break;
  }

  return (
    <MasterMachineContext.Provider
      children={RenderComponent}
      value={MasterContextValue}
    />
  );
};
