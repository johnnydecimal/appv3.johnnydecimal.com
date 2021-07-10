// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/compiled/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  authMachine,
  AuthMachineReactContext,
  SignInForm,
  SignUpForm,
  DatabaseMachine,
} from "../../../components";

import { ISignInFormData } from "../SignInForm/SignInForm";
import { ISignUpFormData } from "../SignUpForm/SignUpForm";

// === TEST ===
const FourOhFour = () => <div>404</div>;
const WaitOne = () => <div>Wait one. Doing networks.</div>;
// const SignInForm = () => <div>SignInForm</div>;

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const AuthMachine = () => {
  /**
   * Start the machine.
   */
  const [state, send] = useMachine(authMachine, {
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
      type: "attempt signup",
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
  const AuthReactContextValue = {
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
      RenderComponent = <DatabaseMachine />;
      break;
    default:
      RenderComponent = <FourOhFour />;
      break;
  }

  return (
    <AuthMachineReactContext.Provider
      children={RenderComponent}
      value={AuthReactContextValue}
    />
  );
};
