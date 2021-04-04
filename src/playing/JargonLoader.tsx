import arrayShuffle from "array-shuffle";
import { useEffect, useRef, useState } from "react";

const initialJargon = [
  "Initialising sub-stack interface.",
  "Re-configuring port channels.",
  "Upgrading underlying protocols.",
  "Interface v4 establishing core protocols.",
  "Registering 0F:AE:4F globally.",
  "De-coupling network interface.",
  "Setting CPU throttling to maximum.",
  "Configuring MTU=1200 on central link.",
  "Transitioning packets to meta-frames.",
];

export const JargonLoader = () => {
  const jargonRemains = useRef(true);
  const remainingJargon = useRef(initialJargon);
  const [renderJargon, setRenderJargon] = useState([""]);

  useEffect(() => {
    const timeout = Math.random() * (1000 - 400) + 400;
    console.log("timeout", timeout);

    setTimeout(() => {
      if (remainingJargon.current.length === 0) {
        jargonRemains.current = false;
        // And transition to an error state, this has taken too long.
      }
      if (jargonRemains.current) {
        remainingJargon.current = arrayShuffle(remainingJargon.current);
        const newJargonItem =
          remainingJargon.current.pop() ||
          "This will never happen but TypeScript needs it";
        const newRenderJargon = [...renderJargon, newJargonItem];
        console.log(newRenderJargon);
        setRenderJargon(newRenderJargon);
      }
    }, timeout);
  }, [renderJargon]);

  return (
    <div className="text-sm">
      JargonLoader
      {renderJargon.map((jargonLine, i) => {
        return <p key={i}>{jargonLine}</p>;
      })}
    </div>
  );
};
