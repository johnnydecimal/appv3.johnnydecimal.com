// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useLocation } from "react-router-dom";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const Sandbox = () => {
  let location = useLocation();
  console.debug(location);
  return (
    <div className="p-4 m-12 border-2 border-red-500 font-jdbody">
      Tailwind installed.
      <p className="font-jdcode">
        I am <span className="text-red-900">code</span>!
      </p>
    </div>
  );
};
