import { InternalJdSystem, JDProjectNumbers } from "@types";

/**
 * What's this thing need to do?
 *
 * And didn't we write something similar? Whatever, do it again.
 *
 * There are two options for this type of component (because Area, Category etc.
 * will all be the same):
 *
 * - If 'Project' is passed
 */
export const Project = (props: any) => {
  const {
    children,
    internalJdSystem,
    currentProject,
  }: {
    children: any;
    internalJdSystem: InternalJdSystem;
    currentProject: JDProjectNumbers;
  } = props;

  /**
   * Check whether we're undergoing some sort of system rebuild, and display
   * a wait one if so.
   */
  if (!internalJdSystem[currentProject]) {
    return <div>Project: wait one</div>;
  }

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
      <>
        <h2 className="text-2xl font-bold">
          {internalJdSystem[currentProject]!.title}
        </h2>
        <div className="flex flex-initial">
          <h3 className="border-r border-black">{currentProject}</h3>
          <div>{children}</div>
        </div>
      </>
    );
  }

  // At the moment there's no way to un-set currentProject, so fill this in
  // when there is.
  return <div>yeah</div>;
};
