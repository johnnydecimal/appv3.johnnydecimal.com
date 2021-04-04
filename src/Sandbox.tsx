// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useLocation } from "react-router-dom";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const Sandbox = () => {
  let location = useLocation();
  console.debug(location);
  return (
    <div className="">
      <p className="mb-6 border-b-2 border-green">Johnny&bull;Decimal</p>
      <p className="">To login, enter your details.</p>
      <p className="mb-6">To sign up, type 'signup'.</p>
      <p>
        login: <span className="blink">_</span>
      </p>
    </div>
  );
};
