// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import React from "react";
import { useContext } from "react";
import { useActor } from "@xstate/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { AuthMachineReactContext } from "../AuthMachine/context";
import { DatabaseMachineReactContext } from "./context";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// import { Sender } from "@xstate/react/lib/types";
// import { Database } from "userbase-js";
import { ActorRefFrom } from "xstate";
import { databaseMachine } from "./database.machine";

// === Helpers (extract!)   ===-===-===-===-===-===-===-===-===-===-===-===-===
// https://kyleshevlin.com/how-to-render-an-object-in-react
const Log = ({ value = {}, replacer = null, space = 2 }) => (
  <pre>
    <code>{JSON.stringify(value, replacer, space)}</code>
  </pre>
);

/*
const ProjectViewer = ({
  projectNumber,
  projectTitle,
}: {
  projectNumber: string;
  projectTitle: string;
}) => {
  return (
    <div>
      {projectNumber}: {projectTitle}
    </div>
  );
};
*/

// const ProjectPicker = ({ projects }: { projects: Database[] }) => {
//   return (
//     <div>
//       <select id="project" name="project">
//         {projects.map((project) => (
//           <option key={project.databaseName} value={project.databaseName}>
//             {project.databaseName}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const DatabaseMachine = () => {
  const {
    handleSignOut,
    state: authState,
    updateUserProfileWithCurrentDatabase,
  } = useContext(AuthMachineReactContext);

  /**
   * We invoked `dbMachine` from `authMachine`. Grab its state/send actions.
   */
  const [state, send] = useActor(
    authState.children.databaseMachine as ActorRefFrom<typeof databaseMachine>
  );

  /**
   * Declare the functions which are the things we're going to pass down to our
   * child components. These are the functions which send events, so we don't
   * ever send `send` down the tree.
   */
  const changeDatabase = (newDatabase: string) => {
    send({
      type: "OPEN_DATABASE",
      newDatabase,
    });
    updateUserProfileWithCurrentDatabase(newDatabase);
  };

  /**
   * `DatabaseReactContextValue` contains all of the helper/sender functions,
   * declared here, that are passed down in React Context for use by child
   * components.
   */
  const DatabaseReactContextValue = {
    changeDatabase,
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    changeDatabase(formRef!.current!.value);
  };

  const formRef = React.createRef<HTMLInputElement>();

  return (
    <DatabaseMachineReactContext.Provider value={DatabaseReactContextValue}>
      <div>JD App</div>
      <hr className="my-2" />
      <button onClick={handleSignOut}>Sign out</button>
      <hr className="my-2" />
      <form onSubmit={handleSubmit}>
        <label>
          New project:
          <input type="text" ref={formRef} />
          <input type="submit" value="submit" />
        </label>
      </form>
      <hr className="my-2" />
      <div>appMachine.state: {JSON.stringify(state.value)}</div>
      <Log value={state.context} />
    </DatabaseMachineReactContext.Provider>
  );
};

/**
 * Okay let's just chew the fat here. If we're going to 'open or create' another
 * database, where does that happen? What needs to happen?
 *
 * 1. We need to actually open that database. Presumably it's enough to set
 *    context.currentDatabase here on db.machine and `init`.
 * 2. We need to set user.profile.currentDatabase so that the next time they
 *    log in they're using this database. But we specifically do NOT want that
 *    change to propagate to any active sessions.
 *
 * Getting there, going to bed.
 */
