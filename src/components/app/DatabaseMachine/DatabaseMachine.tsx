// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext } from "react";
import { useActor } from "@xstate/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  AuthMachineReactContext,
  DatabaseMachineReactContext,
} from "../../../components";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { Sender } from "@xstate/react/lib/types";
import { Database } from "userbase-js";
// import { DatabaseMachineEvent } from "./database.machine";

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
    <div>
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
  const {
    handleSignOut,
    state: authState,
    updateUserProfile,
  } = useContext(AuthMachineReactContext);

  // TODO: fix this `any` typing.
  const [state]: [any, Sender<any>] = useActor(
    // const [state]: [any, Sender<DatabaseMachineEvent>] = useActor(
    authState.children.databaseMachine
  );

  // const createProject = (projectNumber: string) => {
  //   send({
  //     type: "CREATE PROJECT",
  //     projectNumber,
  //   });
  // };

  const DatabaseReactContextValue = {
    // createProject,
  };

  return (
    <DatabaseMachineReactContext.Provider value={DatabaseReactContextValue}>
      <div>JD App</div>
      <hr className="my-2" />
      <button onClick={handleSignOut}>Sign out</button>
      <hr className="my-2" />
      <ProjectPicker projects={state.context.databases} />
      <hr className="my-2" />
      <ProjectViewer
        projectNumber={state.context.databases.databaseName}
        projectTitle="Passed in by props"
      />
      <hr className="my-2" />
      <button onClick={() => updateUserProfile({ currentDatabase: "001" })}>
        Create 005
      </button>
      <hr className="my-2" />
      <div>appMachine.state: {JSON.stringify(state.value)}</div>
      <Log value={state.context} />
    </DatabaseMachineReactContext.Provider>
  );
};
