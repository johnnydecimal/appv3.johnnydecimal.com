import { useContext } from "react";
import {
  JdSystem,
  JDProjectNumbers,
  JdAreaNumbers,
  JDCategoryNumbers,
  JDIdNumbers,
} from "@types";
import { DatabaseMachineReactContext } from "../DatabaseMachine/context";

export const ID = ({
  jdSystem,
  currentProject,
  currentArea,
  currentCategory,
  currentId,
}: // children,
{
  jdSystem: JdSystem;
  currentProject: JDProjectNumbers;
  currentArea: JdAreaNumbers;
  currentCategory: JDCategoryNumbers;
  currentId: JDIdNumbers | null;
  // children: React.ReactNode;
}) => {
  const {
    openId,
  }: {
    openId: (id: JDIdNumbers) => void;
  } = useContext(DatabaseMachineReactContext);
  if (currentId) {
    /**
     * If there's a current ID, the user has selected an ID.
     *
     * We show this ID as a header, and render some sort of view of the ID --
     * which we haven't built yet -- below.
     *
     * This header isn't clickable, as there's nothing 'below' to reveal.
     */
    return (
      <div className="grid" style={{ gridTemplateColumns: "3ch auto" }}>
        {/**
         * Spanned across all columns, the ID number + title.
         */}
        <div className="col-span-full">
          {currentId}{" "}
          {
            jdSystem[currentProject]!.areas[currentArea]!.categories[
              currentCategory
            ]!.ids[currentId]!.title
          }
        </div>
        <div className="text-base col-span-full">
          The contents of this ID will be here when we've built this.
        </div>
      </div>
    );
  }

  /**
   * If there isn't a current ID, the user has not selected an ID.
   *
   * We render a list of all IDs, each of which is clickable. Doing so makes
   * that ID the `currentId`.
   */
  const ids = Object.keys(
    jdSystem[currentProject]!.areas[currentArea]!.categories[currentCategory]!
      .ids
  ).sort((a, b) => {
    return Number(a) - Number(b);
  }) as JDIdNumbers[];

  return (
    <div>
      {ids.map((id, i) => (
        <div className="cursor-pointer" key={i} onClick={() => openId(id)}>
          {id}{" "}
          {
            jdSystem[currentProject]!.areas[currentArea]!.categories[
              currentCategory
            ]!.ids[id]!.title
          }
        </div>
      ))}
    </div>
  );
};
