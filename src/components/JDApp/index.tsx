import { useContext } from "react";
import { MasterMachineContext } from "../MasterMachine/master.machine";

export const JDApp = () => {
  const { handleSignOut } = useContext(MasterMachineContext);

  return (
    <div>
      <div>JD App</div>
      <button onClick={handleSignOut}>Sign out</button>
    </div>
  );
};
