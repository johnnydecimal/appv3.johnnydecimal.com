import { assign, Machine } from "@xstate/compiled";
import { createContext } from "react";
import userbase, { UserResult } from "userbase-js";
import { SignInFormData } from "../signIn";

interface Context {
  error?: any;
  user?: UserResult;
}

type Event =
  | { type: "TRY_SIGNIN"; data: SignInFormData }
  | { type: "REPORT_SIGNIN_SUCCESS"; user: UserResult }
  | { type: "REPORT_SIGNIN_FAILURE"; error?: any }
  | { type: "TRY_SIGNOUT" }
  | { type: "REPORT_SIGNOUT_SUCCESS" }
  | { type: "REPORT_SIGNOUT_FAILURE" }
  | { type: "CATASTROPHIC_ERROR"; error: any };

export const apr24MasterMachine = Machine<Context, Event, "apr24MasterMachine">(
  {
    id: "apr24MasterMachine",
    initial: "init",
    states: {
      init: {
        invoke: {
          src: "userbaseInit",
          onError: {
            /**
             * This almost certainly isn't necessary. This is what happens if
             * the `userbaseInit` service fails at such a level that it doesn't
             * even send us an event. I dunno what that would be, given that
             * TS protects us from things like typos.
             */
            target: "catastrophicError",
          },
        },
        on: {
          REPORT_SIGNIN_SUCCESS: {
            target: "signedIn",
            actions: assign({
              user: (_context, event) => {
                return event.user;
              },
            }),
          },
          REPORT_SIGNIN_FAILURE: "signedOut",
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
          onError: {
            target: "catastrophicError",
          },
        },
        on: {
          REPORT_SIGNOUT_SUCCESS: "signedOut",
          /**
           * // TODO
           * I guess you'd get a failure if the service isn't available? In
           * which case, what? Perhaps divert via a `forceSignOut` state where
           * we clear local storage?
           */
          REPORT_SIGNOUT_FAILURE: "signedOut",
        },
      },
      signedOut: {
        on: {
          TRY_SIGNIN: "tryingSignIn",
        },
      },
      tryingSignIn: {
        invoke: {
          src: "userbaseSignIn",
          onDone: {
            actions: assign({
              user: (_context, event) => event.data,
            }),
          },
          onError: {
            actions: assign({
              user: (_context, _event) => undefined,
            }),
          },
        },
        on: {
          REPORT_SIGNIN_SUCCESS: "signedIn",
          REPORT_SIGNIN_FAILURE: "signedOut",
        },
      },
      catastrophicError: {},
    },
  },
  {
    services: {
      // == userbaseInit  ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      /**
       * - This is a function, which returns a function.
       * - That function has an argument, `sendBack`.
       * - That argument is a function! So we define its shape.
       * - It takes an argument, `event`, which is of type `Event`.
       * - It does not return a value.
       *
       * How the fuck you figured this out I do not know.
       */
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
            if (session.user) {
              /**
               * We have a user, so a user is signed in.
               */
              sendBack({ type: "REPORT_SIGNIN_SUCCESS", user: session.user });
            } else {
              /**
               * There's no user, but this isn't an error. We just don't have
               * a signed-in user.
               */
              sendBack({ type: "REPORT_SIGNIN_FAILURE" });
            }
          })
          .catch((error) => {
            console.log(error);
            /**
             * Now *this* is an error. Something janky happened with the `init`
             * call. We shit the bed at this stage.
             */
            sendBack({ type: "CATASTROPHIC_ERROR", error });
          });
      },

      // == userbaseSignOut  ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
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

      // == userbaseSignIn   ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      userbaseSignIn: (_, event) => (sendBack: (event: Event) => void) => {
        userbase
          .signIn({
            username: event.data.username,
            password: event.data.password,
            rememberMe: "local",
          })
          .then((user) => {
            console.log("userbaseSignIn.user:", user);
            sendBack({ type: "REPORT_SIGNIN_SUCCESS", user });
          })
          .catch((error) => {
            console.log(error);
            sendBack({ type: "REPORT_SIGNIN_FAILURE", error });
          });
      },
    },
  }
);

export const Apr24MasterContext = createContext<any>({});
