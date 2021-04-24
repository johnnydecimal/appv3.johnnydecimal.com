import { useMachine } from "@xstate/compiled/react";
import {
  Apr24MasterContext,
  apr24MasterMachine,
} from "../machines/apr24Master.machine";
import { FormData, SignInForm } from "../signIn";

export const MachineUser = () => {
  const [state, send] = useMachine(apr24MasterMachine, {
    devTools: true,
  });

  /**
   * Declare the functions which are the things we're going to pass down to our
   * child components. These are the functions which send events, so we don't
   * ever send `send` down the tree. Ref. video at 52:00.
   */
  const handleSignIn = (data: FormData) => {
    console.log("handleSignIn.data:", data);
    send({
      type: "TRY_SIGNIN",
      data,
    });
  };
  const handleSignOut = () => {
    send("TRY_SIGNOUT");
  };

  const Apr24MasterContextValue = {
    handleSignIn,
    handleSignOut,
    state,
  };

  return (
    <Apr24MasterContext.Provider value={Apr24MasterContextValue}>
      <div>
        <p>Machine User component</p>
        {JSON.stringify(state.value, null, 2)}
        <button
          className="mx-2"
          onClick={() =>
            handleSignIn({
              username: "john",
              password: "also true but a string",
            })
          }
        >
          TRY_SIGNIN
        </button>
        <button className="mx-2" onClick={() => send("TRY_SIGNOUT")}>
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
    </Apr24MasterContext.Provider>
  );
};
