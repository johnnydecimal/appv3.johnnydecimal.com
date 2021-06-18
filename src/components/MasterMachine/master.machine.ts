// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { createContext } from "react";
import userbase from "userbase-js";
import { Machine, assign } from "@xstate/compiled";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { UserResult } from "userbase-js";
import { ISignInFormData } from "../SignInForm";
import { ISignUpFormData } from "../SignUpForm";

interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

interface Context {
  /**
   * The most recent error. (This is the `message` part of `UserbaseError`.)
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
  /**
   * The user object, if signed in.
   */
  user?: UserResult;
}

type Event =
  | { type: "a user is signed in"; info: string; user: UserResult }
  | { type: "no user is signed in"; info: string }
  | { type: "userbase.init() raised an error"; error: UserbaseError }
  | { type: "attempt signin"; data: ISignInFormData }
  | { type: "userbase.signIn() raised an error"; error: UserbaseError }
  | { type: "TRY_SIGNOUT" }
  | { type: "REPORT_SIGNOUT_SUCCESS" }
  | { type: "REPORT_SIGNOUT_FAILURE" }
  | { type: "TRY_SIGNUP"; data: ISignUpFormData }
  | { type: "CATASTROPHIC_ERROR"; error: UserbaseError };

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
  const newLog = context.log;
  const time = new Date().toTimeString().slice(0, 8);
  newLog.unshift(`${time}: <span class=${className}>${message}</span>`);
  return newLog;
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
        // entry: ["checkPathForSignup"],
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
          "a user is signed in": {
            target: "#master.signedIn.idle",
            actions: ["assignUser", "clearError"],
          },
          "no user is signed in": {
            target: "#master.signedOut.idle",
            actions: ["assignAndLogInfo", "clearError"],
          },
          "userbase.init() raised an error": {
            /**
             * From idle, if we aren't signed in we just go to the idle
             * signedOut state, not signedOut.signInFailure. Because this isn't
             * a failure that we need to tell the user about.
             */
            target: "#master.signedOut.idle",
            actions: ["assignAndLogError", "clearUser"],
          },
        },
      },
      signedOut: {
        type: "compound",
        initial: "idle",
        states: {
          idle: {
            on: {
              "attempt signin": {
                target: "tryingSignIn",
              },
            },
          },
          signInFailed: {
            on: {
              "attempt signin": {
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
              "a user is signed in": {
                target: "#master.signedIn.idle",
                actions: ["assignUser", "clearError", "logSignInSuccess"],
              },
              "userbase.signIn() raised an error": {
                /**
                 * If we just tried to sign in, and it failed, go to the special
                 * signedOut.signInFailed state. We use this to report things to
                 * the hapless user.
                 */
                target: "#master.signedOut.signInFailed",
                actions: ["clearUser", "assignAndLogError"],
              },
            },
          },
          tryingSignOut: {
            entry: ["logTryingSignOut"],
            exit: ["logSignOutSuccess"], // We force it either way
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
              "attempt signin": {
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
      signUp: {},
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
        user: (_context, event) => event.user,
      }),
      logTryingSignIn: assign({
        log: (context, _event) => addToLog(context, "Trying sign in."),
      }),
      logSignInSuccess: assign({
        log: (context, _event) => addToLog(context, "Sign in successful."),
      }),
      logTryingSignOut: assign({
        log: (context, _event) => addToLog(context, "Trying sign out."),
      }),
      logSignOutSuccess: assign({
        log: (context, _event) => addToLog(context, "Sign out successful."),
      }),
      assignAndLogError: assign({
        error: (_context, event) => event.error.message,
        log: (context, event) =>
          addToLog(context, event.error.message, "text-red"),
      }),
      assignAndLogInfo: assign({
        info: (_context, event) => event.info,
        log: (context, event) => addToLog(context, event.info),
      }),
      clearUser: assign({
        user: (_context, _event) => undefined,
      }),
      clearError: assign({
        error: (_context, _event) => undefined,
      }),
      forceSignOut: (_context, _event) => {
        window.localStorage.removeItem("userbaseCurrentSession");
      },
      // checkPathForSignup: () => {
      //   console.log("👩🏽‍🎤 checkPathForSignup");
      //   if (window.location.pathname === "/signup") {
      //     send({
      //       type: "REPORT_SIGNUP_URL",
      //     });
      //   }
      // },
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

        /**
         * In the special case where the user has arrived directly at `/signup`,
         * send them to the part of the machine that handles that.
         if (window.location.pathname.indexOf("signup") > 0) {
           sendBack({
             type: "REPORT_SIGNUP_URL",
            });
          }
        */

        /**
         * Otherwise check sign in status with Userbase and react accordingly.
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
                type: "a user is signed in",
                info: "Sign in success.",
                user: session.user,
              });
            } else {
              /**
               * There's no user, but this isn't an error. We just don't have
               * a signed-in user.
               */
              sendBack({
                type: "no user is signed in",
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
            sendBack({ type: "userbase.init() raised an error", error });
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

        userbase
          .signIn({
            username: event.data.username,
            password: event.data.password,
            rememberMe: "local",
          })
          .then((user) => {
            sendBack({
              type: "a user is signed in",
              info: "Sign in success.",
              user,
            });
          })
          .catch((error) => {
            sendBack({ type: "userbase.signIn() raised an error", error });
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
