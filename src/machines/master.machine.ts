// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { createContext } from "react";
import userbase from "userbase-js";
import { Machine, assign } from "@xstate/compiled";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { UserResult } from "userbase-js";
import { SignInFormData } from "../signIn";

interface Context {
  error?: any;
  user?: UserResult;
}

type Event =
  | { type: "TRY_SIGNIN"; data: SignInFormData }
  | { type: "REPORT_SIGNIN_SUCCESS"; user: UserResult }
  | { type: "REPORT_SIGNIN_FAILURE"; error: any }
  | { type: "TRY_SIGNOUT" }
  | { type: "REPORT_SIGNOUT_SUCCESS" }
  | { type: "REPORT_SIGNOUT_FAILURE" }
  | { type: "CATASTROPHIC_ERROR"; error: any };

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const masterMachine = Machine<Context, Event, "masterMachine">(
  {
    id: "master",
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
            actions: ["assignUser", "clearError"],
          },
          REPORT_SIGNIN_FAILURE: {
            target: "signedOut",
            actions: ["assignError", "clearUser"],
          },
        },
      },
      signedIn: {
        on: {
          TRY_SIGNOUT: {
            target: "#master.signedOut.tryingSignOut",
          },
        },
      },
      signedOut: {
        type: "compound",
        on: {
          TRY_SIGNIN: {
            target: ".tryingSignIn",
          },
        },
        states: {
          init: {},
          tryingSignIn: {
            invoke: {
              src: "userbaseSignIn",
            },
            on: {
              REPORT_SIGNIN_SUCCESS: {
                target: "#master.signedIn",
                actions: ["assignUser", "clearError"],
              },
              REPORT_SIGNIN_FAILURE: {
                target: "#master.signedOut.init",
                actions: ["clearUser", "assignError"],
              },
            },
          },
          tryingSignUp: {},
          tryingSignOut: {
            invoke: {
              src: "userbaseSignOut",
            },
            on: {
              REPORT_SIGNOUT_SUCCESS: {
                /**
                 * userbase.signOut() did its job, so it's gracefully set the
                 * localStorage item to `signedIn: false`.
                 */
                target: "#master.signedOut",
                internal: false,
              },
              REPORT_SIGNOUT_FAILURE: {
                /**
                 * userbase.signOut() couldn't do its job, so to be sure we
                 * remove the localStorage item ourselves. Not as graceful.
                 */
                target: "#master.signedOut",
                internal: false,
                actions: "forceSignOut",
              },
              TRY_SIGNIN: {
                /**
                 * Catch this event and make it do nothing, as it's also an
                 * event on the parent which we don't want triggered from here.
                 */
                target: undefined,
              },
            },
          },
        },
      },
      catastrophicError: {},
    },
  },
  {
    actions: {
      assignUser: assign({
        user: (_context, event) => {
          return event.user;
        },
      }),
      assignError: assign({
        error: (_context, event) => {
          return event.error;
        },
      }),
      clearUser: assign({
        user: (_context, _event) => {
          return undefined;
        },
      }),
      clearError: assign({
        error: (_context, _event) => {
          return undefined;
        },
      }),
      forceSignOut: (_context, _event) => {
        window.localStorage.removeItem("userbaseCurrentSession");
      },
    },
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
              sendBack({
                type: "REPORT_SIGNIN_FAILURE",
                error:
                  "Info: userbase.init() call succeeded, but a user is not logged in.",
              });
            }
          })
          .catch((error) => {
            /**
             * Now *this* is an error. Something janky happened with the `init`
             * call. We shit the bed at this stage.
             * // TODO: test this, can you loopback the userbase URL?
             */
            sendBack({ type: "CATASTROPHIC_ERROR", error });
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

      // == userbaseSignOut  ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      userbaseSignOut: () => (sendBack: (event: Event) => void) => {
        console.log("Just about to try signing out.");
        userbase
          .signOut()
          .then(() => {
            console.log("Signed out!");
            sendBack({ type: "REPORT_SIGNOUT_SUCCESS" });
          })
          .catch((error) => {
            console.log("Sign out failed!");
            sendBack({ type: "REPORT_SIGNOUT_FAILURE" });
          });
      },
    },
  }
);

export const MasterMachineContext = createContext<any>({});
