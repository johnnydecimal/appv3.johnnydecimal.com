import { useContext } from "react";
import { useActor, useSelector } from "@xstate/react";
import { AuthMachineReactContext } from "components/authentication";
import { ActorRefFrom } from "xstate";

export const Database2Machine = () => {
  const { handleSignOut, state: authState } = useContext(
    AuthMachineReactContext
  );

  /**
   * We invoked `dbMachine` from `authMachine`. Grab its state/send actions.
   */
  const [state, send] = useActor(authState.children.database2Machine as any);
  // const stateValue = (state: any) => state.value;
  // const state = useSelector(
  //   authState.children.database2Machine as any,
  //   stateValue
  // );

  console.debug(
    "%c> database2Machine.state.value:",
    "color: orange",
    // @ts-ignore
    state,
    new Date().getMilliseconds()
  );

  return <div>Database2Machine</div>;
};
