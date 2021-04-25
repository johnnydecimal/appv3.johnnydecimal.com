import { useMachine } from "@xstate/compiled/react";
import {
  masterMachine,
  MasterMachineContext,
} from "../machines/master.machine";
// import {
//   apr24MasterMachine,
//   Apr24MasterContext,
// } from "../machines/apr24Master.machine";
import { SignInFormData, SignInForm } from "../signIn";

export const MachineUser = () => {
  const [state, send] = useMachine(masterMachine, {
    devTools: true,
  });

  /**
   * Declare the functions which are the things we're going to pass down to our
   * child components. These are the functions which send events, so we don't
   * ever send `send` down the tree. Ref. video at 52:00.
   */
  const handleSignIn = (data: SignInFormData) => {
    send({
      type: "TRY_SIGNIN",
      data,
    });
  };

  const handleSignOut = () => {
    send("TRY_SIGNOUT");
  };

  const devSignInSuccess = () => {
    send({
      type: "TRY_SIGNIN",
      data: {
        username: "john",
        password: "test123",
      },
    });
  };

  const devSignInFailure = () => {
    send({
      type: "TRY_SIGNIN",
      data: {
        username: "john",
        password: "tekljsdkst123",
      },
    });
  };

  const MasterContextValue = {
    // devSignInFailure,
    // devSignInSuccess,
    handleSignIn,
    handleSignOut,
    state,
  };

  return (
    <MasterMachineContext.Provider value={MasterContextValue}>
      <div className="p-2 border border-black">
        <p>Machine User component</p>
        {JSON.stringify(state.value, null, 2)}
        <button
          className="p-2 m-2 border border-black"
          onClick={() => devSignInSuccess()}
        >
          TRY_SIGNIN (with valid credentials)
        </button>
        <button
          className="p-2 m-2 border border-black"
          onClick={() => devSignInFailure()}
        >
          TRY_SIGNIN (with invalid credentials)
        </button>
        <button
          className="p-2 m-2 border border-black"
          onClick={() => handleSignOut()}
        >
          TRY_SIGNOUT
        </button>
        {state.value === "signedOut" ? (
          <SignInForm />
        ) : (
          // <SignInForm masterMachine={{ state, send }} />
          <div className="p-4 mt-8 border border-black">
            You're not in a state of{" "}
            <span className="font-bold">signedOut</span>, so you won't see the
            sign-in form.
          </div>
        )}
      </div>
    </MasterMachineContext.Provider>
  );
};
