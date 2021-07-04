import { useContext } from "react";
import { AuthMachineReactContext } from "../../authentication/AuthMachine/context";
import { useActor } from "@xstate/react";
import { Sender } from "@xstate/react/lib/types";
import { EventObject } from "xstate";

// https://kyleshevlin.com/how-to-render-an-object-in-react
const Log = ({ value = {}, replacer = null, space = 2 }) => (
  <pre style={{ color: "darkblue" }}>
    <code>{JSON.stringify(value, replacer, space)}</code>
  </pre>
);

export const DatabaseMachine = () => {
  const { handleSignOut, state } = useContext(AuthMachineReactContext);

  // TODO: fix this `any` typing.
  const [appState, sendApp]: [any, Sender<EventObject>] = useActor(
    state.children.appMachine
  );

  /**
   * NEXT: set up some context like AuthMachineContext. Use this component
   *       as the master for the app and start building it out.
   */

  // TODO: Careful, state isn't typed here. Fix.

  return (
    <div>
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
    </div>
  );
};
