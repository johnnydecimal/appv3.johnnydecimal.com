// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import React from "react";
import { useContext } from "react";
import { useActor } from "@xstate/react";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { AuthMachineReactContext } from "components/authentication";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { ActorRefFrom } from "xstate";
import { JDItem, JDProjectNumbers } from "@types";

// === Intra-component  ===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { databaseMachine } from "../machine/database.machine";
import { DatabaseMachineReactContext } from "./context";

// === BUILDING - FIX WHEN DONE
import { Project } from "../Project/Project";
import { Area } from "../Area/Area";

// === Helpers (extract!)   ===-===-===-===-===-===-===-===-===-===-===-===-===
// https://kyleshevlin.com/how-to-render-an-object-in-react
// const Log = ({ value = {}, replacer = null, space = 2 }) => (
//   <pre>
//     <code>{JSON.stringify(value, replacer, space)}</code>
//   </pre>
// );

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const DatabaseMachine = () => {
  const { handleSignOut, state: authState } = useContext(
    AuthMachineReactContext
  );

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
  const changeDatabase = (newDatabase: JDProjectNumbers) => {
    send({
      type: "OPEN_DATABASE",
      newDatabase,
    });
  };

  const insertItem = (item: JDItem) => {
    send({
      type: "INSERT_ITEM",
      item,
    });
  };

  /**
   * `DatabaseReactContextValue` contains all of the helper/sender functions,
   * declared here, that are passed down in React Context for use by child
   * components.
   */
  const DatabaseReactContextValue = {
    changeDatabase,
    insertItem,
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // TODO: obvs in real life we have to make sure that the user can only
    //       create a DB with the right format; but this is a fudge anyway
    changeDatabase(formRef!.current!.value as JDProjectNumbers);
  };
  const formRef = React.createRef<HTMLInputElement>();
  /*
  const handleSubmitNewItem = (e: any) => {
    e.preventDefault();
    insertItem({
      // @ts-ignore
      jdType: jdTypeRef!.current!.value,
      // @ts-ignore
      jdNumber: jdNumberRef!.current!.value,
      jdTitle: jdTitleRef!.current!.value,
    });
  };
  const jdTypeRef = React.createRef<HTMLInputElement>();
  const jdNumberRef = React.createRef<HTMLInputElement>();
  const jdTitleRef = React.createRef<HTMLInputElement>();
  */

  return (
    <DatabaseMachineReactContext.Provider value={DatabaseReactContextValue}>
      <div>JD App</div>
      <hr className="my-2" />
      <button onClick={handleSignOut}>Sign out</button>
      <hr className="my-2" />
      <div>User: {state.context.currentUserName}</div>
      <hr className="my-2" />
      <form onSubmit={handleSubmit}>
        <label>
          New project:
          <input type="text" ref={formRef} />
          <input type="submit" value="submit" />
        </label>
      </form>
      <hr className="my-2" />
      {state.context.internalJdSystem ? (
        <Project
          currentProject={state.context.currentDatabase}
          internalJdSystem={state.context.internalJdSystem}
        >
          <Area
            // currentArea={"00-09"}
            currentArea={null}
            currentProject={state.context.currentDatabase}
            internalJdSystem={state.context.internalJdSystem}
          >
            area children
          </Area>
        </Project>
      ) : (
        <div>A flash as we generate the system</div>
      )}
      {/*
      <h2>Create item</h2>
      <form onSubmit={handleSubmitNewItem}>
        <label>
          New item:
          <input
            name="jdType"
            placeholder="jdType"
            type="text"
            ref={jdTypeRef}
          />
          <input
            name="jdNumber"
            placeholder="jdNumber"
            type="text"
            ref={jdNumberRef}
          />
          <input
            name="jdTitle"
            placeholder="jdTitle"
            type="text"
            ref={jdTitleRef}
          />
          <input type="submit" value="submit" />
        </label>
      </form>
      <hr className="my-2" />
      <div>appMachine.state: {JSON.stringify(state.value)}</div>
      <Log value={state.context} /> */}
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
