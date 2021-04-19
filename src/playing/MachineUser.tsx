import { useMachine } from "@xstate/compiled/react";
import { masterMachine } from "../machines/master.machine";

export const MachineUser = () => {
  const [state, send] = useMachine(masterMachine, {
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
    </div>
  );
};
