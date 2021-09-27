import { useContext } from "react";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const ID = () => {
  const {
    jdSystem,
    currentProject,
    currentArea,
    currentCategory,
    currentId,
    // selectArea,
    // selectCategory,
    selectId,
  } = useContext(DatabaseMachineReactContext);

  if (currentArea && currentCategory && !currentId) {
    /**
     * If there isn't a current ID, the user has not selected an ID.
     *
     * We render a list of all IDs, each of which is clickable. Doing so makes
     * that ID the `currentId`.
     */
    const ids = Object.keys(
      jdSystem[currentProject]!.areas[currentArea!]!.categories[
        currentCategory!
      ]!.ids
    ).sort((a, b) => {
      return Number(a) - Number(b);
    }) as JdIdNumbers[];

    return (
      <div className="id">
        {ids.map((id, i) => (
          <div key={i}>
            {/* prettier-ignore */}
            <span
              className="cursor-pointer"
              onClick={() => selectId(id)}
            >
              {id}
              {" "}
              {jdSystem[currentProject]!
                .areas[currentArea]!
                .categories[currentCategory]!
                .ids[id]!
                .title
              }
            </span>
          </div>
        ))}
      </div>
    );
  } else if (currentArea && currentCategory && currentId) {
    /**
     * If there's a current ID, the user has selected an ID.
     *
     * We show this ID as a header, and render some sort of view of the ID --
     * which we haven't built yet -- below.
     *
     * This header isn't clickable, as there's nothing 'below' to reveal.
     */
    return (
      <div className="id">
        <div>
          {/* prettier-ignore */}
          <span className="selected">
          {currentId}
          {" "}
          {jdSystem[currentProject]!
            .areas[currentArea]!
            .categories[currentCategory]!
            .ids[currentId]!
            .title
          }
          </span>
          <div>This is where your ID and stuff will be shown.</div>
        </div>
      </div>
    );
  } else {
    return <div>Impossible</div>; // TODO: test/handle.
  }
};
