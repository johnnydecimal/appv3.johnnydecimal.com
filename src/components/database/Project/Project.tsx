import { useContext } from "react";
import { InternalJdSystem, JDProjectNumbers, JDAreaNumbers } from "@types";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const Project = (props: any) => {
  const {
    internalJdSystem,
    currentProject,
    children,
  }: {
    internalJdSystem: InternalJdSystem;
    currentProject: JDProjectNumbers;
    children: React.ReactNode;
  } = props;

  const {
    openArea,
  }: {
    openArea: (area: JDAreaNumbers | null) => void;
  } = useContext(DatabaseMachineReactContext);

  /**
   * At the very least, we're always passed `internalJdSystem` which contains
   * the first project that we set up for the user.
   *
   * If `currentProject`, show that project's ID and then render the <Areas />
   * component (i.e. children).
   *
   * If not, show the *list of projects*.
   */

  if (currentProject) {
    return (
      <div
        className="grid text-2xl"
        style={{ gridTemplateColumns: "4ch auto" }}
      >
        <div
          className="font-semibold cursor-pointer col-span-full"
          onClick={() => {
            openArea(null);
          }}
        >
          {currentProject} {internalJdSystem[currentProject]!.title}
        </div>
        <div className="col-start-2">{children}</div>
      </div>
    );
  }

  // At the moment there's no way to un-set currentProject, so fill this in
  // when there is.
  return <div>yeah</div>;
};

// <h2 className="text-2xl font-bold">
//   {currentProject}: {internalJdSystem[currentProject]!.title}
// </h2>
// <div className="flex flex-initial">
//   <h3 className="cursor-pointer" onClick={() => openArea(null)}>
//     {currentProject}
//   </h3>
//   <div>{children}</div>
// </div>
