// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { Machine, assign, send } from "@xstate/compiled";
import { assign as immerAssign } from "@xstate/immer";
import userbase from "userbase-js";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// Can't import from components, breaks xstate-codegen
import { databaseMachine } from "../../app/DatabaseMachine/database.machine";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { UserResult } from "userbase-js";
import { ISignInFormData } from "../SignInForm/SignInForm";
import { ISignUpFormData } from "../SignUpForm/SignUpForm";

interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

interface AuthMachineContext {
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
  /**
   * A reference to the invoked `appMachine`.
   * // TODO: clean up the any.
   */
  appMachine?: any;
}

type AuthMachineEvent =
  // Initialising the machine
  | { type: "A USER IS SIGNED IN"; user: UserResult }
  | { type: "NO USER IS SIGNED IN"; info: string }
  | { type: "USERBASE.INIT() RAISED AN ERROR"; error: UserbaseError }
  // Signing in
  | { type: "ATTEMPT SIGNIN"; data: ISignInFormData }
  | { type: "USERBASE.SIGNIN() RAISED AN ERROR"; error: UserbaseError }
  // Signing out
  | { type: "ATTEMPT SIGNOUT" }
  | { type: "THE USER WAS SIGNED OUT" }
  | { type: "SIGNOUT FAILED, SO WE FORCE IT ANYWAY" }
  // Moving around the interface
  | { type: "SWITCH TO THE SIGNIN PAGE" }
  | { type: "SWITCH TO THE SIGNUP PAGE" }
  // Signing up
  | { type: "ACKNOWLEDGE DIRE WARNING ABOUT E2E ENCRYPTION" }
  | { type: "ATTEMPT SIGNUP"; data: ISignUpFormData }
  | { type: "SIGNUP WAS SUCCESSFUL"; user: UserResult }
  | { type: "SIGNUP FAILED"; error: UserbaseError }
  // Updating
  | { type: "UPDATE USER PROFILE"; profile: any }
  | { type: "CURRENT DATABASE UPDATED"; databaseName: string }
  // Helpers
  | { type: "WRITE TO THE LOG"; log: string }
  | { type: "CLEAR THE LOG" }
  // Errors
  | { type: "CATASTROPHIC_ERROR"; error: UserbaseError };

// === Utility functions    ===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * A standard function to write to the log, which is the thing that appears
 * on-screen as you're signing in/up.
 */
const addToLog = (
  context: AuthMachineContext, // Current machine context.
  message: string = "addToLog() was called without a `message` parameter.", // The new message to write to the log.
  className?: string // Optional className to style the event.
): string[] => {
  const newLog = context.log;
  const time = new Date().toTimeString().slice(0, 8);
  newLog.unshift(`${time}: <span class=${className}>${message}</span>`);
  return newLog;
};

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const authMachine = Machine<
  AuthMachineContext,
  AuthMachineEvent,
  "authMachine"
>(
  {
    id: "authMachine",
    initial: "init",
    context: {
      log: [`${new Date().toTimeString().slice(0, 8)}: Initialised.`],
    },
    on: {
      "WRITE TO THE LOG": {
        actions: [(context, event) => addToLog(context, event.log)],
      },
      "CLEAR THE LOG": {
        actions: [
          assign({
            log: (_context, _event) => [],
          }),
        ],
      },
      "CURRENT DATABASE UPDATED": {
        actions: [
          immerAssign((context, event) => {
            if (context.user && !context.user.profile) {
              /**
               * A signed-in user who has never had a database updated might
               * not yet have a user.profile object (it doesn't)
               */
              context.user.profile = {};
            }
            if (context.user && context.user.profile) {
              /**
               * Which it must as we just created it.
               */
              context.user.profile.currentDatabase = event.databaseName;
            }
          }),
        ],
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
          "A USER IS SIGNED IN": {
            target: "#authMachine.signedIn.idle",
            actions: [
              "assignUser",
              "clearError",
              send({
                type: "WRITE TO THE LOG",
                log: "Previous user still signed in.",
              }),
            ],
          },
          "NO USER IS SIGNED IN": {
            target: "#authMachine.signedOut.idle",
            actions: [
              "clearError",
              send({
                type: "WRITE TO THE LOG",
                log: "Database connection established. No user signed in.",
              }),
            ],
          },
          "USERBASE.INIT() RAISED AN ERROR": {
            /**
             * From idle, if we aren't signed in we just go to the idle
             * signedOut state, not signedOut.signInFailure. Because this isn't
             * a failure that we need to tell the user about.
             */
            target: "#authMachine.signedOut.idle",
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
              "ATTEMPT SIGNIN": {
                target: "tryingSignIn",
              },
              "SWITCH TO THE SIGNUP PAGE": {
                target: "#authMachine.signUp",
              },
            },
          },
          signInFailed: {
            on: {
              "ATTEMPT SIGNIN": {
                target: "tryingSignIn",
              },
              "SWITCH TO THE SIGNUP PAGE": {
                target:
                  "#authMachine.signUp.direWarningAboutE2EEncryptionNotAcknowledged",
              },
            },
          },
          tryingSignIn: {
            entry: [
              send({
                type: "WRITE TO THE LOG",
                log: "Trying sign in.",
              }),
            ],
            invoke: {
              src: "userbaseSignIn",
            },
            on: {
              "A USER IS SIGNED IN": {
                target: "#authMachine.signedIn.idle",
                actions: ["assignUser", "clearError"],
              },
              "USERBASE.SIGNIN() RAISED AN ERROR": {
                /**
                 * If we just tried to sign in, and it failed, go to the special
                 * signedOut.signInFailed state. We use this to report things to
                 * the hapless user.
                 */
                target: "#authMachine.signedOut.signInFailed",
                actions: ["clearUser", "assignAndLogError"],
              },
            },
          },
          tryingSignOut: {
            entry: [
              send({
                type: "WRITE TO THE LOG",
                log: "Trying sign out.",
              }),
            ],
            invoke: {
              src: "userbaseSignOut",
            },
            exit: [
              send({
                type: "WRITE TO THE LOG",
                log: "Sign out successful.",
              }),
            ],
            on: {
              "THE USER WAS SIGNED OUT": {
                /**
                 * userbase.signOut() did its job, so it has gracefully set the
                 * localStorage item to `signedIn: false`.
                 */
                target: "#authMachine.signedOut",
                actions: ["clearError", "clearUser"],
              },
              "SIGNOUT FAILED, SO WE FORCE IT ANYWAY": {
                /**
                 * userbase.signOut() couldn't do its job, so to be sure we
                 * remove the localStorage item ourselves. Not as graceful, so
                 * we don't do it by default.
                 */
                target: "#authMachine.signedOut",
                actions: ["clearError", "clearUser", "forceSignOut"],
              },
            },
          },
        },
      },
      signUp: {
        type: "compound",
        initial: "direWarningAboutE2EEncryptionNotAcknowledged",
        on: {
          "SWITCH TO THE SIGNIN PAGE": {
            target: "#authMachine.signedOut.idle",
            actions: [
              send({
                type: "CLEAR THE LOG",
              }),
              send({
                type: "WRITE TO THE LOG",
                log: "Switch to sign in page.",
              }),
            ],
          },
        },
        states: {
          direWarningAboutE2EEncryptionNotAcknowledged: {
            entry: [
              send({
                type: "CLEAR THE LOG",
              }),
              send({
                type: "WRITE TO THE LOG",
                log: 'Switch to sign up page. User needs to accept dire warning about end-to-end encryption. More information can be found <a href="https://userbase.com/docs/faq/" class="underline text-red">here</a>.',
              }),
            ],
            on: {
              "ACKNOWLEDGE DIRE WARNING ABOUT E2E ENCRYPTION": {
                target: "#authMachine.signUp.okayToTrySignUp",
              },
            },
          },
          okayToTrySignUp: {
            entry: [
              send({
                type: "WRITE TO THE LOG",
                log: 'User has accepted dire warning. (Seriously, use <a href="https://1password.com" class="underline text-red">a password manager</a>.)',
              }),
              () => {
                setTimeout(() => {
                  document.getElementById("username")?.focus();
                }, 50);
              },
            ],
            on: {
              "ATTEMPT SIGNUP": {
                target: "tryingSignUp",
              },
            },
          },
          tryingSignUp: {
            entry: [
              send({
                type: "WRITE TO THE LOG",
                log: "Attempting sign up.",
              }),
            ],
            invoke: {
              src: "userbaseSignUp",
            },
            on: {
              "SIGNUP WAS SUCCESSFUL": {
                target: "#authMachine.signedIn.idle",
                actions: [
                  send({
                    type: "WRITE TO THE LOG",
                    log: "Sign up successful.",
                  }),
                  assign({
                    user: (_, event) => event.user,
                  }),
                ],
              },
              "SIGNUP FAILED": {
                target: "#authMachine.signUp.signUpFailed",
              },
            },
          },
          signUpFailed: {
            entry: ["assignAndLogError"],
            on: {
              "ATTEMPT SIGNUP": {
                target: "#authMachine.signUp.tryingSignUp",
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
            entry: [
              send({ type: "WRITE TO THE LOG", log: "Sign in successful." }),
            ],
            invoke: {
              id: "databaseMachine",
              src: databaseMachine,
            },
          },
        },
        on: {
          "ATTEMPT SIGNOUT": {
            target: "signedOut.tryingSignOut",
          },
          "UPDATE USER PROFILE": {
            actions: [
              immerAssign((context, event) => {
                if (context.user) {
                  context.user.profile = event.profile;
                }
              }),
            ],
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
      assignAndLogError: assign({
        error: (_context, event) => event.error.message,
        log: (context, event) =>
          addToLog(context, event.error.message, "text-red"),
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
      userbaseInit:
        (context) => (sendBack: (event: AuthMachineEvent) => void) => {
          userbase
            .init({
              appId: "37c7462e-f79c-4ef3-bdb0-55968a34d572",
              updateUserHandler: ({ user }) => {
                assign({ user });
                /**
                 * If the current database has changed, send an update to the
                 * `databaseMachine`.
                 *
                 * This handles the situation where a user on
                 */
                if (
                  context.user?.profile?.currentDatabase !==
                  user.profile?.currentDatabase
                ) {
                  send(
                    {
                      type: "CURRENT DATABASE UPDATED",
                      currentDatabase: user.profile?.currentDatabase,
                    },
                    {
                      to: "databaseMachine",
                    }
                  );
                }
              },
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
                sendBack({
                  type: "A USER IS SIGNED IN",
                  user: session.user,
                });
              } else {
                /**
                 * There's no user, but this isn't an error. We just don't have
                 * a signed-in user.
                 */
                sendBack({
                  type: "NO USER IS SIGNED IN",
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
              sendBack({
                type: "USERBASE.INIT() RAISED AN ERROR",
                error,
              });
            });
        },

      // == userbaseSignIn   ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      // @ts-ignore
      userbaseSignIn:
        (_, event) => (sendBack: (event: AuthMachineEvent) => void) => {
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
                type: "A USER IS SIGNED IN",
                user,
              });
            })
            .catch((error) => {
              sendBack({
                type: "USERBASE.SIGNIN() RAISED AN ERROR",
                error,
              });
            });
        },

      // == userbaseSignUp   ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      // @ts-ignore
      userbaseSignUp:
        (_, event) => (sendBack: (event: AuthMachineEvent) => void) => {
          userbase
            .signUp({
              username: event.data.username,
              password: event.data.password,
            })
            .then((user) => {
              /**
               * Brand-new users need a first database.
               */
              user.profile = {
                currentDatabase: "001",
              };
              sendBack({
                type: "SIGNUP WAS SUCCESSFUL",
                user,
              });
            })
            .catch((error) => {
              sendBack({
                type: "SIGNUP FAILED",
                error,
              });
            });
        },

      // == userbaseSignOut  ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      // @ts-ignore
      userbaseSignOut: () => (sendBack: (event: AuthMachineEvent) => void) => {
        userbase
          .signOut()
          .then(() => {
            sendBack({
              type: "THE USER WAS SIGNED OUT",
            });
          })
          .catch((error) => {
            sendBack({
              type: "SIGNOUT FAILED, SO WE FORCE IT ANYWAY",
            });
          });
      },
    },
  }
);
