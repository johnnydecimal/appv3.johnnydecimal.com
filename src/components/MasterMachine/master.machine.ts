// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { createContext } from "react";
import userbase from "userbase-js";
import { Machine, assign } from "@xstate/compiled";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { UserResult } from "userbase-js";
import { ISignInFormData } from "../SignInForm";

interface Context {
  /**
   * The most recent error.
   */
  error?: string;
  /**
   * The most recent information (not called 'event' to avoid confusion).
   *
   * We separate the two to allow us to log them differently
   * (e.g. errors appear in red).
   */
  info?: string;
  /**
   * The log is the list of errors and events as they occurred.
   *
   * Each action should log to the log as it handles the error/event.
   */
  log: string[];
  user?: UserResult;
}

type Event =
  | { type: "TRY_SIGNIN"; data: ISignInFormData }
  | { type: "REPORT_SIGNIN_SUCCESS"; info: string; user: UserResult }
  | { type: "REPORT_SIGNIN_FAILURE"; error: string }
  | { type: "REPORT_NO_USER_SIGNED_IN"; info: string }
  | { type: "TRY_SIGNOUT" }
  | { type: "REPORT_SIGNOUT_SUCCESS" }
  | { type: "REPORT_SIGNOUT_FAILURE" }
  | { type: "CATASTROPHIC_ERROR"; error: string };

// === Utility functions    ===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * A standard function to write to the log, which is the thing that appears
 * on-screen as you're signing in/up.
 */
const addToLog = (
  context: Context, // Current machine context.
  message: string, // The new message to write to the log.
  className?: string // Optional className to style the event.
): string[] => {
  const tempLog = context.log;
  tempLog.unshift(
    `${new Date()
      .toTimeString()
      .slice(0, 8)}: <span class=${className}>${message}</span>`
  );
  return tempLog;
};

/**
 * Userbase messages/errors look like:
 * `ShortErrorCode: A longer description of the error.`
 *
 * We usually want the second half of the message to display to the user. This
 * function just splits on `: `, returning an array with the two parts.
 */
const splitUserbaseMessage = (userbaseMessage: string): string[] => {
  return userbaseMessage.split(": ");
};

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const masterMachine = Machine<Context, Event, "masterMachine">(
  {
    id: "master",
    initial: "init",
    context: {
      log: [`${new Date().toTimeString().slice(0, 8)}: Initialised.`],
    },
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
             *
             * Everything else is handled in the `userbaseInit` service.
             */
            target: "catastrophicError",
          },
        },
        on: {
          REPORT_SIGNIN_SUCCESS: {
            target: "#master.signedIn.idle",
            actions: ["assignUser", "clearError"],
          },
          REPORT_SIGNIN_FAILURE: {
            /**
             * From idle, if we aren't signed in we just go to the idle
             * signedOut state, not signedOut.signInFailure. Because this isn't
             * a failure that we need to tell the user about.
             */
            target: "#master.signedOut.idle",
            actions: ["assignError", "clearUser"],
          },
          REPORT_NO_USER_SIGNED_IN: {
            target: "#master.signedOut.idle",
            actions: ["assignInfo", "clearError"],
          },
        },
      },
      signedOut: {
        type: "compound",
        initial: "idle",
        states: {
          idle: {
            on: {
              TRY_SIGNIN: {
                target: "tryingSignIn",
              },
            },
          },
          signInFailed: {
            on: {
              TRY_SIGNIN: {
                target: "tryingSignIn",
              },
            },
          },
          tryingSignIn: {
            entry: ["logTryingSignIn"],
            invoke: {
              src: "userbaseSignIn",
            },
            on: {
              REPORT_SIGNIN_SUCCESS: {
                target: "#master.signedIn.idle",
                actions: ["assignUser", "clearError"],
              },
              REPORT_SIGNIN_FAILURE: {
                /**
                 * If we just tried to sign in, and it failed, go to the special
                 * signedOut.signInFailed state. We use this to report things to
                 * the hapless user.
                 */
                target: "#master.signedOut.signInFailed",
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
                 * userbase.signOut() did its job, so it has gracefully set the
                 * localStorage item to `signedIn: false`.
                 */
                target: "#master.signedOut",
                actions: ["clearError", "clearUser"],
              },
              REPORT_SIGNOUT_FAILURE: {
                /**
                 * userbase.signOut() couldn't do its job, so to be sure we
                 * remove the localStorage item ourselves. Not as graceful, so
                 * we don't do it by default.
                 */
                target: "#master.signedOut",
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
      signedIn: {
        type: "compound",
        initial: "idle",
        states: {
          idle: {},
        },
        on: {
          TRY_SIGNOUT: {
            target: "signedOut.tryingSignOut",
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
      logTryingSignIn: assign({
        log: (context, _event) => addToLog(context, "Trying signin."),
      }),
      assignError: assign({
        error: (_context, event) => {
          return event.error;
        },
        log: (context, event) => addToLog(context, event.error, "text-red"),
      }),
      assignInfo: assign({
        info: (_context, event) => {
          return event.info;
        },
        log: (context, event) => addToLog(context, event.info),
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
            console.log(session);
            /**
             * This only tells us that the SDK initialised successfully, *not*
             * that there is an active user. For that we need `session.user`
             * to contain a user object.
             */
            if (session.user) {
              /**
               * We have a user, so a user is signed in.
               */
              sendBack({
                type: "REPORT_SIGNIN_SUCCESS",
                info: "Signin success.",
                user: session.user,
              });
            } else {
              /**
               * There's no user, but this isn't an error. We just don't have
               * a signed-in user.
               */
              sendBack({
                type: "REPORT_NO_USER_SIGNED_IN",
                info: "Database connection established. No user signed in.",
              });
            }
          })
          .catch((error) => {
            /**
             * Now *this* is an error. Something janky happened with the `init`
             * call. We shit the bed at this stage.
             *
             * Update: change from CATASTROPHIC_ERROR to a regular error. Hmm
             * no. What we need to do is examine the error, and depending on
             * which one it is, act accordingly. They're all documented.
             *
             * // TODO: sort this out.
             */
            sendBack({ type: "REPORT_SIGNIN_FAILURE", error });
          });
      },

      // == userbaseSignIn   ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      // TODO: figure out why this is needed - appeared after a `yarn upgrade`
      // @ts-ignore
      userbaseSignIn: (_, event) => (sendBack: (event: Event) => void) => {
        /**
         * If we're testing this using the inspector, the button-click isn't
         * sending any event.data. Pick that up, and load some dummy values.
         * // TODO: this is just for testing, pull it out in prod.
         */
        if (!event.data) {
          event.data = {
            username: "john",
            password: "test123",
          };
        }

        /**
         * Clear any errors.
         */

        userbase
          .signIn({
            username: event.data.username,
            password: event.data.password,
            rememberMe: "local",
          })
          .then((user) => {
            sendBack({
              type: "REPORT_SIGNIN_SUCCESS",
              info: "Signin success.",
              user,
            });
          })
          .catch((error) => {
            sendBack({ type: "REPORT_SIGNIN_FAILURE", error });
          });
      },

      // == userbaseSignOut  ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      // TODO: figure out why this is needed - appeared after a `yarn upgrade`
      // @ts-ignore
      userbaseSignOut: () => (sendBack: (event: Event) => void) => {
        userbase
          .signOut()
          .then(() => {
            sendBack({ type: "REPORT_SIGNOUT_SUCCESS" });
          })
          .catch((error) => {
            sendBack({ type: "REPORT_SIGNOUT_FAILURE" });
          });
      },
    },
  }
);

export const MasterMachineContext = createContext<any>({});
