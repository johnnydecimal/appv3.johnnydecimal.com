import { useContext } from "react";
import { MasterMachineContext } from "../AuthMachine/auth.machine";
import { useActor } from "@xstate/react";
import { Sender } from "@xstate/react/lib/types";
import { EventObject } from "xstate";

export const JDApp = () => {
  const { handleSignOut, state } = useContext(MasterMachineContext);

  // TODO: fix this `any` typing.
  const [appState, sendApp]: [any, Sender<EventObject>] = useActor(
    state.children.appMachine
  );

  return (
    <div>
      <div>JD App</div>
      <button onClick={handleSignOut}>Sign out</button>
      <div>appMachine.state: {JSON.stringify(appState.value)}</div>
      <button
        onClick={() => {
          sendApp({ type: "SEND" });
        }}
      >
        appMachine SEND
      </button>
    </div>
  );
};
