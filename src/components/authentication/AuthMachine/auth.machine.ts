// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { createContext } from "react";
import { Machine, assign, send } from "@xstate/compiled";
import userbase from "userbase-js";

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
  // Initialising the machine
  | { type: "a user is signed in"; info: string; user: UserResult }
  | { type: "no user is signed in"; info: string }
  | { type: "userbase.init() raised an error"; error: UserbaseError }
  // Signing in
  | { type: "attempt signin"; data: ISignInFormData }
  | { type: "userbase.signIn() raised an error"; error: UserbaseError }
  // Signing out
  | { type: "attempt signout" }
  | { type: "the user was signed out" }
  | { type: "signout failed, so we force it anyway" }
  // Moving around the interface
  | { type: "switch to the signin page" }
  | { type: "switch to the signup page" }
  // Signing up
  | { type: "acknowledge dire warning about e2e encryption" }
  | { type: "attempt signup"; data: ISignUpFormData }
  | { type: "signup was successful"; user: UserResult }
  | { type: "signup failed"; error: UserbaseError }
  // Helpers
  | { type: "write to the log"; log: string }
  // Errors
  | { type: "CATASTROPHIC_ERROR"; error: UserbaseError };

// === Utility functions    ===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * A standard function to write to the log, which is the thing that appears
 * on-screen as you're signing in/up.
 */
const addToLog = (
  context: Context, // Current machine context.
  message: string = "addToLog() was called without a `message` parameter.", // The new message to write to the log.
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
    on: {
      "write to the log": {
        actions: [(context, event) => addToLog(context, event.log)],
      },
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
              "switch to the signup page": {
                target: "#master.signUp",
              },
            },
          },
          signInFailed: {
            on: {
              "attempt signin": {
                target: "tryingSignIn",
              },
              "switch to the signup page": {
                target:
                  "#master.signUp.direWarningAboutE2EEncryptionNotAcknowledged",
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
                actions: ["assignUser", "clearError"],
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
            invoke: {
              src: "userbaseSignOut",
            },
            exit: ["logSignOutSuccess"],
            on: {
              "the user was signed out": {
                /**
                 * userbase.signOut() did its job, so it has gracefully set the
                 * localStorage item to `signedIn: false`.
                 */
                target: "#master.signedOut",
                actions: ["clearError", "clearUser"],
              },
              "signout failed, so we force it anyway": {
                /**
                 * userbase.signOut() couldn't do its job, so to be sure we
                 * remove the localStorage item ourselves. Not as graceful, so
                 * we don't do it by default.
                 */
                target: "#master.signedOut",
                actions: ["clearError", "clearUser", "forceSignOut"],
              },
            },
          },
        },
      },
      signUp: {
        type: "compound",
        initial: "direWarningAboutE2EEncryptionNotAcknowledged",
        states: {
          direWarningAboutE2EEncryptionNotAcknowledged: {
            entry: [
              send({
                type: "write to the log",
                log: 'Switch to sign up page. User needs to accept dire warning about end-to-end encryption. More information can be found <a href="#" class="underline text-red">here</a>.',
              }),
            ],
            on: {
              "acknowledge dire warning about e2e encryption": {
                target: "#master.signUp.okayToTrySignUp",
              },
              "switch to the signin page": {
                target: "#master.signedOut.idle",
                actions: [
                  send({
                    type: "write to the log",
                    log: "Switch to sign in page.",
                  }),
                ],
              },
            },
          },
          okayToTrySignUp: {
            entry: [
              send({
                type: "write to the log",
                log: 'User has accepted dire warning. (Seriously, use <a href="https://1password.com" class="underline text-red">a password manager</a>.)',
              }),
              () => {
                setTimeout(() => {
                  document.getElementById("username")?.focus();
                }, 50);
              },
            ],
            on: {
              "attempt signup": {
                target: "tryingSignUp",
              },
              "switch to the signin page": {
                target: "#master.signedOut.idle",
                actions: [
                  send({
                    type: "write to the log",
                    log: "Switch to sign in page.",
                  }),
                ],
              },
            },
          },
          tryingSignUp: {
            entry: [
              send({
                type: "write to the log",
                log: "Attempting sign up.",
              }),
            ],
            invoke: {
              src: "userbaseSignUp",
            },
            on: {
              "signup was successful": {
                target: "#master.signedIn.idle",
              },
              "signup failed": {
                target: "#master.signUp.signUpFailed",
              },
            },
          },
          signUpFailed: {
            entry: ["assignAndLogError"],
            on: {
              "attempt signup": {
                target: "#master.signUp.tryingSignUp",
              },
              "switch to the signin page": {
                target: "#master.signedOut.idle",
              },
            },
          },
        },
      },
      signedIn: {
        type: "compound",
        initial: "idle",
        states: {
          idle: {
            entry: ["logSignInSuccess"],
          },
        },
        on: {
          "attempt signout": {
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
      // logEventDotLog: assign({
      //   log: (context, event) => addToLog(context, event.log),
      // }),
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
      // @ts-ignore
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
      userbaseSignIn:
        (_context, event) => (sendBack: (event: Event) => void) => {
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

      // == userbaseSignUp   ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      // @ts-ignore
      userbaseSignUp:
        (_context, event) => (sendBack: (event: Event) => void) => {
          userbase
            .signUp({
              username: event.data.username,
              password: event.data.password,
            })
            .then((user) => {
              sendBack({ type: "signup was successful", user });
            })
            .catch((error) => {
              sendBack({ type: "signup failed", error });
            });
        },

      // == userbaseSignOut  ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      // TODO: figure out why this is needed - appeared after a `yarn upgrade`
      // @ts-ignore
      userbaseSignOut: () => (sendBack: (event: Event) => void) => {
        userbase
          .signOut()
          .then(() => {
            sendBack({ type: "the user was signed out" });
          })
          .catch((error) => {
            sendBack({ type: "signout failed, so we force it anyway" });
          });
      },
    },
  }
);

export const MasterMachineContext = createContext<any>({});
