// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { authMachine, AuthMachineContext } from "./auth.machine";
import { AuthMachineReactContext } from "./context";
import { DatabaseMachine } from "../DatabaseMachine/DatabaseMachine";
import { SignInForm } from "../authentication/SignInForm/SignInForm";
import { SignUpForm } from "../authentication/SignUpForm/SignUpForm";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { ISignInFormData } from "../authentication/SignInForm/SignInForm";
import { ISignUpFormData } from "../authentication/SignUpForm/SignUpForm";
import { JDUserProfile } from "../../@types";

// == Temp stuff while you build this out ==
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

  const handleSignUp = (formData: ISignUpFormData) => {
    send({
      type: "ATTEMPT_SIGNUP",
      formData,
    });
  };

  const handleSignOut = () => {
    send({ type: "ATTEMPT_SIGNOUT" });
  };

  const switchToSignIn = () => {
    send({ type: "SWITCH_TO_THE_SIGNIN_PAGE" });
  };

  const switchToSignUp = () => {
    send({ type: "SWITCH_TO_THE_SIGNUP_PAGE" });
  };

  const handleAcknowledgeDireWarningAboutE2EEncryption = () => {
    send({ type: "ACKNOWLEDGE_DIRE_WARNING_ABOUT_E2E_ENCRYPTION" });
  };

  const updateUserProfile = (
    context: AuthMachineContext,
    profile: JDUserProfile
  ) => {
    const newUser = { ...context.user };
    newUser.profile!.currentDatabase = "";
    newUser.profile = { ...newUser.profile, ...profile };
    send({
      type: "UPDATE_USER_PROFILE",
      profile: newUser.profile,
    });
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
    updateUserProfile,
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
