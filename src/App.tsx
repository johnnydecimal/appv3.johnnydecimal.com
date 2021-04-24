// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { inspect } from "@xstate/inspect";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// import { Sandbox } from "./playing/Sandbox";
// import { JargonLoader } from "./playing/JargonLoader";
import { MachineUser } from "./playing/MachineUser";
// import { SignInForm } from "./signIn";

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

export const App = () => {
  return (
    /* Bring everything in from the sides */
    <div className="mx-2 sm:mx-12">
      {/* Constrain the width, and centre */}
      <div className="max-w-4xl mx-auto mt-2 font-jdcode">
        <h1 className="border-b-2 border-black">Johnny&bull;Decimal</h1>
        {/* <JargonLoader /> */}
        {/* <Sandbox /> */}
        <MachineUser />
        {/* <SignInForm /> */}
      </div>
    </div>
  );
};
