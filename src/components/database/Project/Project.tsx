import { useContext } from "react";
import { JdSystem, JdProjectNumbers, JdAreaNumbers } from "@types";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Project = (props: any) => {
  const {
    jdSystem,
    currentProject,
    children,
  }: {
    jdSystem: JdSystem;
    currentProject: JdProjectNumbers;
    children: React.ReactNode;
  } = props;

  const {
    openArea,
  }: {
    openArea: (area: JdAreaNumbers | null) => void;
  } = useContext(DatabaseMachineReactContext);

  /**
   * At the very least, we're always passed `jdSystem` which contains
   * the first project that we set up for the user.
   *
   * If `currentProject`, show that project's ID and then render the <Areas />
   * component (i.e. children).
   *
   * If not, show the *list of projects*.
   */

  return (
    <div
      className="grid"
      id="project"
      style={{ gridTemplateColumns: "4ch auto" }}
    >
      <div className="col-start-2">{children}</div>
    </div>
  );
};

// <h2 className="text-2xl font-bold">
//   {currentProject}: {jdSystem[currentProject]!.title}
// </h2>
// <div className="flex flex-initial">
//   <h3 className="cursor-pointer" onClick={() => openArea(null)}>
//     {currentProject}
//   </h3>
//   <div>{children}</div>
// </div>
