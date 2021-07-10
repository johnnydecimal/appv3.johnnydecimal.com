// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext } from "react";
import { useActor } from "@xstate/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  AuthMachineReactContext,
  DatabaseMachineReactContext,
} from "../../../components";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { EventObject, send } from "xstate";
import { Sender } from "@xstate/react/lib/types";
import { Database } from "userbase-js";

// === Helpers (extract!)   ===-===-===-===-===-===-===-===-===-===-===-===-===
// https://kyleshevlin.com/how-to-render-an-object-in-react
const Log = ({ value = {}, replacer = null, space = 2 }) => (
  <pre>
    <code>{JSON.stringify(value, replacer, space)}</code>
  </pre>
);

const ProjectViewer = ({
  projectNumber,
  projectTitle,
}: {
  projectNumber: string;
  projectTitle: string;
}) => {
  return (
    <div className="my-8">
      {projectNumber}: {projectTitle}
    </div>
  );
};

const ProjectPicker = ({ projects }: { projects: Database[] }) => {
  return (
    <div>
      <select id="project" name="project">
        {projects.map((project) => (
          <option key={project.databaseName} value={project.databaseName}>
            {project.databaseName}
          </option>
        ))}
      </select>
    </div>
  );
};

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const DatabaseMachine = () => {
  const { handleSignOut, state: authState } = useContext(
    AuthMachineReactContext
  );

  // TODO: fix this `any` typing.
  const [state, send]: [any, Sender<EventObject>] = useActor(
    authState.children.databaseMachine
  );

  const createProject = (projectNumber: string) => {
    send({
      type: "CREATE PROJECT",
      projectNumber,
    });
  };

  const DatabaseReactContextValue = {
    createProject,
  };

  return (
    <DatabaseMachineReactContext.Provider value={DatabaseReactContextValue}>
      <div>JD App</div>
      <button onClick={handleSignOut}>Sign out</button>
      <hr />
      <ProjectPicker projects={state.context.databases} />
      <ProjectViewer
        projectNumber={state.context.databases.databaseName}
        projectTitle="Passed in by props"
      />
      <hr />
      <div>appMachine.state: {JSON.stringify(state.value)}</div>
      <Log value={state.context} />
    </DatabaseMachineReactContext.Provider>
  );
};
