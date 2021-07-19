// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/react";

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
  const handleSignIn = (formData: ISignInFormData) => {
    send({
      type: "ATTEMPT_SIGNIN",
      formData,
    });
  };

  // const handleSignUp = (formData: ISignUpFormData) => {
  //   send({
  //     type: "ATTEMPT SIGNUP",
  //     formData,
  //   });
  // };

  const handleSignOut = () => {
    send({ type: "ATTEMPT_SIGNOUT" });
  };

  // const switchToSignIn = () => {
  //   send("SWITCH TO THE SIGNIN PAGE");
  // };

  // const switchToSignUp = () => {
  //   send("SWITCH TO THE SIGNUP PAGE");
  // };

  // const handleAcknowledgeDireWarningAboutE2EEncryption = () => {
  //   send("ACKNOWLEDGE DIRE WARNING ABOUT E2E ENCRYPTION");
  // };

  // const updateUserProfile = (profile: any) => {
  //   send({
  //     type: "UPDATE USER PROFILE",
  //     profile,
  //   });
  // };

  /**
   * Wrap these functions and `state` in an object which we'll use as context
   * value, passing it down to child components.
   */
  const AuthReactContextValue = {
    // handleAcknowledgeDireWarningAboutE2EEncryption,
    handleSignIn,
    handleSignOut,
    // handleSignUp,
    state,
    // switchToSignIn,
    // switchToSignUp,
    // updateUserProfile,
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
      // RenderComponent = <div>Ah-ha! 2</div>;
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
