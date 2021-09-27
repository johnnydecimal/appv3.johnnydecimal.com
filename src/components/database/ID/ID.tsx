import { ChangeEvent, SyntheticEvent, useContext, useState } from "react";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const ID = () => {
  const {
    jdSystem,
    currentProject,
    currentArea,
    currentCategory,
    currentId,
    insertItem,
    // selectArea,
    // selectCategory,
    selectId,
  } = useContext(DatabaseMachineReactContext);

  const [newId, setNewId] = useState("");

  if (currentArea && currentCategory && !currentId) {
    /**
     * If there isn't a current ID, the user has not selected an ID.
     *
     * We render a list of all IDs, each of which is clickable. Doing so makes
     * that ID the `currentId`.
     */

    // Get the list of existing IDs.
    const ids = Object.keys(
      jdSystem[currentProject]!.areas[currentArea!]!.categories[
        currentCategory!
      ]!.ids
    ).sort((a, b) => {
      return Number(a) - Number(b);
    }) as JdIdNumbers[];

    // Find the next available ID. It might be in the middle of the range.
    let nextAvailableId: any; // TODO: FIX - any other value TS errors
    // prettier-ignore
    for (let i = 1; i <= 99; i++) {
      let id;
      if (i < 10) {
        id = '0' + i.toString();
      } else {
        id = i.toString();
      }

      const idToTest = currentCategory + "." + id as JdIdNumbers;
      if (
        !jdSystem[currentProject]!
          .areas[currentArea]!
          .categories[currentCategory]!
          .ids[idToTest]
      ) {
        nextAvailableId = idToTest;
        break;
      }
    }

    // Set up the add-a-new-thing handlers.
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setNewId(event.target.value);
    };
    const handleSubmit = (event: SyntheticEvent) => {
      event.preventDefault();
      insertItem({
        jdType: "id",
        jdNumber: nextAvailableId,
        jdTitle: newId,
      });
      setNewId("");
    };

    return (
      <div className="id">
        {/* The list of existing IDs, if there are any. */}
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
        {/* The add-a-new-ID line, if there are any spare. */}
        {ids.length <= 99 && nextAvailableId ? (
          <form onSubmit={handleSubmit}>
            <span className="text-grey-light">{nextAvailableId} </span>
            <input
              className="text-black outline-none w-96"
              placeholder="Add a new ID here..."
              onChange={handleChange}
              value={newId}
            />
          </form>
        ) : null}
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
