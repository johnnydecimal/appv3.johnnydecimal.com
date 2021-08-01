import { InternalJdSystem, JDAreaNumbers } from "@types";

export const Area = ({
  children,
  currentArea,
  currentProject,
  internalJdSystem,
}: {
  children: React.ReactNode;
  currentArea: JDAreaNumbers | null;
  currentProject: string;
  internalJdSystem: InternalJdSystem;
}) => {
  /**
   * If `props.currentArea`, we show that area and then the categories
   * will show below.
   *
   * If not, show the *list of areas* that the user can select.
   */
  if (currentArea) {
    return (
      <div className="flex flex-initial">
        <div>.{currentArea}</div>
        <div>{children}</div>
      </div>
    );
  } else {
    // Generate the list of areas to show
    // @ts-ignore
    const areas = Object.keys(internalJdSystem[currentProject].areas);
    return (
      <div>
        {areas.map((area, i) => (
          <div key={i}>{area}</div>
        ))}
      </div>
    );
  }
};
