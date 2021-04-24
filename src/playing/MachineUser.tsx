import { useMachine } from "@xstate/compiled/react";
import { apr24MasterMachine } from "../machines/apr24Master.machine";
import { SignInForm } from "../signIn";

export const MachineUser = () => {
  const [state, send, service] = useMachine(apr24MasterMachine, {
    devTools: true,
  });

  return (
    <div>
      <p>Machine User component</p>
      {JSON.stringify(state.value, null, 2)}
      <button className="mx-2" onClick={() => send("TRY_SIGNIN")}>
        TRY_SIGNIN
      </button>
      <button className="mx-2" onClick={() => send("TRY_SIGNOUT")}>
        TRY_SIGNOUT
      </button>
      {state.value === "signedOut" ? (
        <SignInForm masterMachineService={service} />
      ) : (
        // <SignInForm masterMachine={{ state, send }} />
        <div className="p-4 mt-8 border border-black">
          You're not in a state of <span className="font-bold">signedOut</span>,
          so you won't see the sign-in form.
        </div>
      )}
    </div>
  );
};
