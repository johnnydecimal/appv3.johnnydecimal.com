// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useMachine } from "@xstate/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { DatabaseMachine } from "components/database";

// === Intra-component  ===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { authMachine } from "../machine/auth.machine";
import { AuthMachineReactContext } from "./context";
import { SignInForm } from "../SignInForm/SignInForm";
import { SignUpForm } from "../SignUpForm/SignUpForm";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
declare global {
  interface Window {
    // TODO: For testing, remove in prod
    AuthMachine: any;
  }
}

// === Temp ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
const WaitOne = () => <div>Wait one. Doing networks.</div>;

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const AuthMachine = () => {
  /**
   * Start the machine.
   * #TODO: switch to `useInterpret` to save re-renders.
   * https://xstate.js.org/docs/recipes/react.html#global-state-react-context
   */
  const [state, send] = useMachine(authMachine, {
    devTools: true,
  });
  const FourOhFour = () => <div>404 - {state.context.error?.message}</div>;

  window.AuthMachine = { send };

  /**
   * Declare the functions which are the things we're going to pass down to our
   * child components. These are the functions which send events, so we don't
   * ever send `send` down the tree.
   */
  const handleSignIn = (formData: SignInFormData) => {
    send({
      type: "ATTEMPT_SIGNIN",
      formData,
    });
  };

  const handleSignUp = (formData: SignUpFormData) => {
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

  const handleDeleteUser = () => {
    send({ type: "ATTEMPT_DELETE_USER" });
  };

  // @ts-expect-error
  if (window.Cypress) {
    console.log("🌲 cypress.io!");
    // @ts-expect-error
    window.__handleDeleteUser__ = handleDeleteUser;
  }

  /**
   * Wrap these functions and `state` in an object which we'll use as context
   * value, passing it down to child components.
   */
  const AuthReactContextValue = {
    handleAcknowledgeDireWarningAboutE2EEncryption,
    handleDeleteUser,
    handleSignIn,
    handleSignOut,
    handleSignUp,
    send,
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
