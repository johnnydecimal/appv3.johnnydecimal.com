import { useEffect, useRef, useState } from "react";

const technicalJargon = [
  "Initialising sub-stack interface.",
  "Re-configuring port channels.",
  "Upgrading underlying protocols.",
  "Interface v4 establishing core protocols.",
  "Enhancing the temporal nacelles with antilepton communication.",
  "Reconfiguring the photon bank with sensing compositor.",
  "Controlling the focused enhancers with the phase emitter assembly.",
];

export const JargonLoader = () => {
  let [renderJargon, setRenderJargon] = useState([""]);

  useEffect(() => {
    const timeout = Math.random() * (1000 - 400) + 400;
    console.log("timeout", timeout);

    setTimeout(() => {
      const poppedJargon = technicalJargon.pop() || "no more";
      const newRenderJargon = [...renderJargon, poppedJargon];
      console.log(newRenderJargon);
      setRenderJargon(newRenderJargon);
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
