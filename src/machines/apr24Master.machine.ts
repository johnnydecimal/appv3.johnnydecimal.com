import { Machine } from "@xstate/compiled";
import userbase from "userbase-js";

interface Context {}

type Event =
  | { type: "TESTER" }
  | { type: "TRY_SIGNIN" }
  | { type: "TRY_SIGNOUT" }
  | { type: "REPORT_SIGNIN_SUCCESS" }
  | { type: "REPORT_SIGNIN_FAILURE" };

export const apr24MasterMachine = Machine<Context, Event, "apr24MasterMachine">(
  {
    id: "apr24MasterMachine",
    initial: "init",
    states: {
      init: {},
      signedIn: {},
      notSignedIn: {},
    },
  },
  {
    services: {
      userbaseInit: () => (sendBack: (event: Event) => void) => {
        /**
         * So this is a regular callback. We do the userbase stuff, let it
         * resolve, then use `sendBack` to send an event to the machine.
         */
        userbase
          .init({
            appId: "37c7462e-f79c-4ef3-bdb0-55968a34d572",
          })
          .then((session) => {
            console.log(session);
            sendBack({ type: "REPORT_SIGNIN_SUCCESS" });
          })
          .catch((error) => {
            console.log(error);
            sendBack({ type: "REPORT_SIGNIN_FAILURE" });
          });
      },
    },
  }
);
