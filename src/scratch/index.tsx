/* eslint-disable no-unused-vars */
// @ts-ignore
const JDProject = ({ children, number }) => (
  <div className="p-4 border border-black">
    <div>Project number: {number}</div>
    {children}
  </div>
);

// @ts-ignore
const JDArea = ({ children, number }) => (
  <div className="p-4 border border-black">
    <div>Area number: {number}</div>
    {children}
  </div>
);

// @ts-ignore
const JDCategory = ({ children, number }) => (
  <div className="p-4 border border-black">
    <div>Category number: {number}</div>
    {children}
  </div>
);

// @ts-ignore
const JDID = ({ children, number }) => (
  <div className="p-4 border border-black">
    <div>ID number: {number}</div>
    {children}
  </div>
);

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface IJDID {
  title: string;
  meta?: { [key: string]: any };
}

interface IJDCategory {
  title: string;
  meta?: { [key: string]: any };
  ids?: { [key: string]: IJDID };
}

interface IJDArea {
  title: string;
  meta?: { [key: string]: any };
  categories?: { [key: string]: IJDCategory };
}

interface IJDProject {
  title: string;
  meta?: { [key: string]: any };
  areas?: { [key: string]: IJDArea };
}

interface IJDSysytem {
  /**
   * Could improve this by defining 000-999 as a type. And all of the other
   * strings as their actual numbers. :-)
   */

  [key: string]: IJDProject;
}

export const currentSystem: IJDSysytem = {
  "001": {
    /**
     * This needs to be an object with a key as the project number so we have
     * somewhere to store the title.
     *
     * Also this gives us the flexibility of loading multiple projects at once,
     * which we might want to do if we do an all-system search, say.
     */
    title: "Project 001",
    /**
     * Rather than just putting "00-09" right on the object, if we put them in
     * an `areas` key we get more flexibility with doing things like
     * `Object.keys(currentSystem[currentProject].areas).length` to determine
     * if there are any areas. And so on.
     */
    areas: {
      "00-09": {
        title: "Area 00-09",
        meta: {
          inlineComment: "A great first area!",
        },
        categories: {
          "00": {
            title: "Category 00",
            meta: {
              location: "https://example.com",
            },
            ids: {
              "00.00": {
                title: "ID 00.00",
                meta: {
                  blankLinesAbove: 4,
                  commentAbove: "This is a comment above the item.",
                  commentBelow: "This is a comment below the item.",
                  isTheLastId: false,
                },
              },
            },
          },
          "01": {
            /**
             * An 'empty' category for testing.
             */
            title: "Category 01",
          },
        },
      },
      "10-19": {
        /**
         * An 'empty' area for testing.
         */
        title: "Area 10-19",
      },
    },
  },
};

const currentProject = "001";
const currentArea = "00-09";
// const currentArea = undefined;
const currentCategory = "00";

export const Scratch = () => {
  return (
    <div className="m-12">
      {/* There's always a project open. */}
      <JDProject number={currentProject}>
        {/* Is there a current area? This doesn't mean that there aren't any
            areas in the system, just that you don't have one actively open. */}
        {currentArea ? /* yes */ : /* no */ }
        <JDArea number="00-09">
          <JDCategory number="00">
            <JDID number="00.00">Children</JDID>
          </JDCategory>
        </JDArea>
      </JDProject>
    </div>
  );
};
