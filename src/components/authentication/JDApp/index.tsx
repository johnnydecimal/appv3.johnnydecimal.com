import { useContext } from "react";
import { MasterMachineContext } from "../AuthMachine/auth.machine";
import { appMachine } from "../../app/AppMachine/app.machine";
import { useMachine } from "@xstate/react";

export const JDApp = () => {
  const { handleSignOut } = useContext(MasterMachineContext);

  const [state, sendApp] = useMachine(appMachine, {
    devTools: true,
  });

  return (
    <div>
      <div>JD App</div>
      <button onClick={handleSignOut}>Sign out</button>
      <div>appMachine.state: {JSON.stringify(state.value)}</div>
      <button
        onClick={() => {
          sendApp("SEND");
        }}
      >
        appMachine SEND
      </button>
    </div>
  );
};
