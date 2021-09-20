// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import React from "react";
import { useContext } from "react";
import { useActor } from "@xstate/react";
import userbase from "userbase-js";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { AuthMachineReactContext } from "components/authentication";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { ActorRefFrom } from "xstate";
import {
  // JdProjectNumbers,
  // JdAreaNumbers,
  // JdCategoryNumbers,
  // JdIdNumbers,
  // JdItem,
  AuthMachineEvent,
} from "@types";

// === Intra-component  ===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { databaseMachine } from "../machine/database.machine";
import { DatabaseMachineReactContext } from "./context";

// === BUILDING - FIX WHEN DONE
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs";
// import { Project } from "../Project/Project";
import { Area } from "../Area/Area";
import { Category } from "../Category/Category";
import { ID } from "../ID/ID";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
declare global {
  interface Window {
    // Cypress testing
    DatabaseMachine: any;
  }
}

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const DatabaseMachine = () => {
  const {
    handleSignOut,
    send: authSend,
    state: authState,
  } = useContext(AuthMachineReactContext);

  /**
   * We invoked `dbMachine` from `authMachine`. Grab its state/send actions.
   */
  const [state, send] = useActor(
    authState.children.databaseMachine as ActorRefFrom<typeof databaseMachine>
  );

  const { jdSystem, currentProject, currentArea, currentCategory, currentId } =
    state.context;

  //#region helper functions
  /**
   * Declare the functions which are the things we're going to pass down to our
   * child components. These are the functions which send events, so we don't
   * ever send `send` down the tree.
   */
  const changeDatabase = (newDatabase: JdProjectNumbers) => {
    authSend({
      type: "OPEN_DATABASE",
      currentProject: newDatabase,
    });
  };

  const insertItem = (item: JdItem) => {
    send({
      type: "REQUEST_INSERT_ITEM",
      item,
    });
  };

  const selectArea = (area: JdAreaNumbers | null) => {
    send({
      type: "OPEN_AREA",
      area,
    });
  };

  const selectCategory = (category: JdCategoryNumbers | null) => {
    send({
      type: "OPEN_CATEGORY",
      category,
    });
  };

  const selectId = (id: JdIdNumbers | null) => {
    send({
      type: "OPEN_ID",
      id,
    });
  };

  /**
   * If we're testing, expose all of this on `window`.
   */
  // if ("Cypress" in window) {
  window.DatabaseMachine = {
    changeDatabase,
    insertItem,
    currentArea,
    currentCategory,
    currentId,
    selectArea,
    selectCategory,
    selectId,
    userbase,
  };
  // }

  /**
   * `DatabaseMachineReactContextValue` contains all of the helper/sender functions,
   * declared here, that are passed down in React Context for use by child
   * components.
   */
  const DatabaseMachineReactContextValue: DatabaseMachineReactContextValue = {
    changeDatabase,
    insertItem,
    jdSystem,
    currentProject,
    currentArea,
    currentCategory,
    currentId,
    selectArea,
    selectCategory,
    selectId,
  };

  //#region temporary shit while we build it
  const handleSubmit = (e: any) => {
    e.preventDefault();
    // TODO: obvs in real life we have to make sure that the user can only
    //       create a DB with the right format; but this is a fudge anyway
    changeDatabase(formRef!.current!.value as JdProjectNumbers);
  };
  const formRef = React.createRef<HTMLInputElement>();
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
  //#endregion

  return (
    <DatabaseMachineReactContext.Provider
      value={DatabaseMachineReactContextValue}
    >
      <div className="my-12"></div>
      {jdSystem?.[currentProject] ? (
        /**
         * Set up the main outer grid. This has a 6ch wide column which may or
         * may not display `000.` depending on the mode, and then the main
         * content.
         */
        // prettier-ignore
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "4ch auto",
            gridTemplateAreas: `'   .    breadcrumbs'
                                'project    main    '`,
          }}
        >
          <div style={{ gridArea: "breadcrumbs" }}>
            {/* <Breadcrumbs /> */}
          </div>

          <div style={{ gridArea: "project" }}>{/* Nothing here yet */}</div>

          <div style={{ gridArea: "main" }}>
            <Area>
              {currentArea ? (
                <Category>
                  {currentCategory ? (
                    <ID />
                  ) : (
                    <div>EEP</div>
                  )}
                </Category>
              ) : (
                <div>EEP</div>
              )}
            </Area>
          </div>
        </div>
      ) : (
        <div>jdSystem.currentProject does not yet exist.</div>
      )}
      <hr className="mt-24" />
      <button onClick={handleSignOut}>Sign out</button>
      {/*
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
 *    context.currentProject here on db.machine and `init`.
 * 2. We need to set user.profile.currentProject so that the next time they
 *    log in they're using this database. But we specifically do NOT want that
 *    change to propagate to any active sessions.
 *
 * Getting there, going to bed.
 */

/*
<div>JD App</div>
<hr className="my-2" />
<button onClick={handleSignOut}>Sign out</button>
<hr className="my-2" />
<div>User: {state.context.currentUsername}</div>
<hr className="my-2" />
<form onSubmit={handleSubmit}>
  <label>
    New project:
    <input id="new-project" ref={formRef} type="text" />
    <input type="submit" value="submit" />
  </label>
</form>
<hr className="my-2" />
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
<hr className="my-12" />
*/
