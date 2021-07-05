// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext } from "react";
import { useActor } from "@xstate/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  AuthMachineReactContext,
  DatabaseMachineReactContext,
} from "../../../components";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { EventObject } from "xstate";
import { Sender } from "@xstate/react/lib/types";

// === Helpers (extract!)   ===-===-===-===-===-===-===-===-===-===-===-===-===
// https://kyleshevlin.com/how-to-render-an-object-in-react
const Log = ({ value = {}, replacer = null, space = 2 }) => (
  <pre style={{ color: "darkblue" }}>
    <code>{JSON.stringify(value, replacer, space)}</code>
  </pre>
);

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const DatabaseMachine = () => {
  const { handleSignOut, state } = useContext(AuthMachineReactContext);

  // TODO: fix this `any` typing.
  const [appState, sendApp]: [any, Sender<EventObject>] = useActor(
    state.children.databaseMachine
  );

  return (
    <DatabaseMachineReactContext.Provider value={undefined}>
      <div>JD App</div>
      <button onClick={handleSignOut}>Sign out</button>
      <div>appMachine.state: {JSON.stringify(appState.value)}</div>
      <Log value={appState.context} />
      <button
        onClick={() => {
          sendApp({ type: "SEND" });
        }}
      >
        appMachine SEND
      </button>
    </DatabaseMachineReactContext.Provider>
  );
};
