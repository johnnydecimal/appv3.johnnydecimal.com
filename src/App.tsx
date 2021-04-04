// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// import { Sandbox } from "./playing/Sandbox";
import { JargonLoader } from "./playing/JargonLoader";

export const App = () => {
  return (
    /* Bring everything in from the sides */
    <div className="mx-2 sm:mx-12">
      {/* Constrain the width, and centre */}
      <div className="max-w-4xl mx-auto mt-2 font-jdcode">
        {/* <Sandbox /> */}
        <JargonLoader />
      </div>
    </div>
  );
};
