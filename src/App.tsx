// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { Sandbox } from "./playing/Sandbox";
import { JargonLoader } from "./playing/JargonLoader";

export const App = () => {
  return (
    /* Bring everything in from the sides */
    <div className="mx-2 sm:mx-12">
      {/* Constrain the width, and centre */}
      <div className="max-w-4xl mx-auto mt-2 font-jdcode">
        <h1 className="border-b-2 border-black">Johnny&bull;Decimal</h1>
        {/* <JargonLoader /> */}
        {/* <Sandbox /> */}
      </div>
    </div>
  );
};
