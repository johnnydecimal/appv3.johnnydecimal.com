// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { inspect } from "@xstate/inspect";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { AuthMachine } from "components/authentication";
// import { Scratch } from "components/Scratch";

/**
 * The XState inspector popup.
 inspect({
   // options
   // url: 'https://statecharts.io/inspect', // (default)
   iframe: false, // open in new window
  });
  */

export const App = () => {
  // return <Scratch />;
  return (
    /* Bring everything in from the sides */
    <div className="mx-2 sm:mx-12">
      {/* Constrain the width, and centre */}
      <div className="max-w-4xl mx-auto mt-2 font-jdcode">
        <h1 className="border-b-2 border-black">Johnny&bull;Decimal</h1>
        <AuthMachine />
      </div>
    </div>
  );
};
