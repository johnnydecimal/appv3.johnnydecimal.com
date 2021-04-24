import { Machine } from "@xstate/compiled";
import userbase, { UserResult } from "userbase-js";

interface Context {}

type Event =
  | { type: "TESTER" }
  | { type: "TRY_SIGNIN" }
  | { type: "TRY_SIGNOUT" }
  | { type: "REPORT_SIGNIN_SUCCESS"; user: UserResult }
  | { type: "REPORT_SIGNIN_FAILURE" }
  | { type: "REPORT_SIGNOUT_SUCCESS" }
  | { type: "REPORT_SIGNOUT_FAILURE" }
  | { type: "WEIRD_ERROR"; error: any };

export const apr24MasterMachine = Machine<Context, Event, "apr24MasterMachine">(
  {
    id: "apr24MasterMachine",
    initial: "init",
    states: {
      init: {
        invoke: {
          src: "userbaseInit",
        },
        on: {
          REPORT_SIGNIN_SUCCESS: "signedIn",
          REPORT_SIGNIN_FAILURE: "notSignedIn",
        },
      },
      signedIn: {
        on: {
          TRY_SIGNOUT: {
            target: "tryingSignOut",
          },
        },
      },
      tryingSignOut: {
        invoke: {
          src: "userbaseSignOut",
        },
      },
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
            /**
             * This only tells us that the SDK initialised successfully, *not*
             * that there is an active user. For that we need `session.user`
             * to contain a user object.
             */
            console.log(session);
            if (session.user) {
              sendBack({ type: "REPORT_SIGNIN_SUCCESS", user: session.user });
            } else {
              sendBack({ type: "WEIRD_ERROR", error: session });
            }
          })
          .catch((error) => {
            console.log(error);
            sendBack({ type: "REPORT_SIGNIN_FAILURE" });
          });
      },
      userbaseSignOut: () => (sendBack: (event: Event) => void) => {
        userbase
          .signOut()
          .then(() => {
            sendBack({ type: "REPORT_SIGNOUT_SUCCESS" });
          })
          .catch((error) => {
            console.log(error);
            sendBack({ type: "REPORT_SIGNOUT_FAILURE" });
          });
      },
    },
  }
);
