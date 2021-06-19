import { useContext } from "react";
import { MasterMachineContext } from "../AuthMachine/auth.machine";

export const JDApp = () => {
  const { handleSignOut } = useContext(MasterMachineContext);

  return (
    <div>
      <div>JD App</div>
      <button onClick={handleSignOut}>Sign out</button>
    </div>
  );
};
