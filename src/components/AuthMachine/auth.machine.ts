// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { ContextFrom, EventFrom, send } from "xstate";
import { createModel } from "xstate/lib/model";
// import { assign as immerAssign } from "@xstate/immer";
import userbase from "userbase-js";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { databaseMachine } from "../DatabaseMachine/database.machine";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { UserResult } from "userbase-js";
import { ISignInFormData } from "../authentication/SignInForm/SignInForm";
// import { ISignUpFormData } from "../authentication/SignUpForm/SignUpForm";

interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

const authModel = createModel(
  {
    // /**
    //  * A reference to the invoked `appMachine`.
    //  */
    // appMachine: undefined,

    /**
     * The most recent error. This can be `undefined`, in the case where there
     * is no error.
     */
    error: undefined as undefined | UserbaseError,

    // /**
    //  * The most recent information (not called 'event' to avoid confusion).
    //  *
    //  * We separate the two to allow us to log them differently
    //  * (e.g. errors appear in red).
    //  */
    // info: undefined as string | undefined,

    /**
     * The log is the list of errors and events as they occurred.
     */
    log: [] as string[],

    /**
     * The user object, if signed in. This can be `undefined`, in the case
     * where there is no signed in user.
     */
    user: undefined as undefined | UserResult,
  },
  {
    events: {
      // == Native to this machine ==-==-==

      // -- Sent from anywhere
      LOG: (message: string) => ({ message }),

      // -- From services.userbaseInit()
      A_USER_IS_SIGNED_IN: (user: UserResult) => ({ user }),
      NO_USER_IS_SIGNED_IN: () => ({}),

      // -- From the signedOut state
      ATTEMPT_SIGNIN: (formData: ISignInFormData) => ({ formData }),
      SIGNED_IN: (user: UserResult) => ({ user }),
      SWITCH_TO_THE_SIGNUP_PAGE: () => ({}),
      ACKNOWLEDGE_DIRE_WARNING_ABOUT_E2E_ENCRYPTION: () => ({}),
      THE_USER_WAS_SIGNED_OUT: () => ({}),
      SIGNOUT_FAILED_SO_WE_FORCE_IT_ANYWAY: () => ({}),

      // -- From the signedIn state
      ATTEMPT_SIGNOUT: () => ({}),

      // == Sent up from databaseMachine ==-==-==
      /**
       * If the user changes the current database, this event is sent here so
       * we can update their profile.
       *
       * At this stage this doesn't affect any other signed in sessions: we send
       * `currentDatabase` to `databaseMachine` when we invoke it, but never
       * again during its life. Otherwise we're affecting state on one session
       * from another and that's not what we want.
       */
      CURRENT_DATABASE_UPDATED: (databaseName: string) => ({ databaseName }),

      // == Catch-all error for the whole app ==-==-==
      /**
       * This is the only ERROR state; children also send their errors here.
       */
      ERROR: (error: UserbaseError) => ({ error }),

      // == All the old shit
      // "A USER IS SIGNED IN": (value: UserResult) => ({ value }),
      // "NO USER IS SIGNED IN": (value: string) => ({ value }),
      // "USERBASE.INIT() RAISED AN ERROR": (value: UserbaseError) => ({ value }),
      // "ATTEMPT SIGNIN": (formData: ISignInFormData) => ({ formData }),
      // "USERBASE.SIGNIN() RAISED AN ERROR": (value: UserbaseError) => ({
      //   value,
      // }),
      // "ATTEMPT SIGNOUT": () => ({}),
      // "THE USER WAS SIGNED OUT": () => ({}),
      // "SIGNOUT FAILED, SO WE FORCE IT ANYWAY": () => ({}),
      // "SWITCH TO THE SIGNIN PAGE": () => ({}),
      // "SWITCH TO THE SIGNUP PAGE": () => ({}),
      // "ACKNOWLEDGE DIRE WARNING ABOUT E2E ENCRYPTION": () => ({}),
      // "ATTEMPT SIGNUP": (formData: ISignUpFormData) => ({ formData }),
      // "SIGNUP WAS SUCCESSFUL": (value: UserResult) => ({ value }),
      // "SIGNUP FAILED": (value: UserbaseError) => ({ value }),
      // "UPDATE USER PROFILE": (profile: any) => ({ profile }),
      // "WRITE TO THE LOG": (value: string) => ({ value }),
      // "CLEAR THE LOG": () => ({}),
    },
  }
);

// === Utility functions    ===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * A function to write to the log, which is the thing that appears
 * on-screen as you're signing in/up.
 */
const addToLog = (
  context: AuthMachineContext,
  message: string = "addToLog() was called without a `message` parameter.",
  className?: string // Optional className to style the event.
): string[] => {
  const newLog = context.log;
  const time = new Date().toTimeString().slice(0, 8);
  newLog.unshift(`${time}: <span class=${className}>${message}</span>`);
  return newLog;
};

export type AuthMachineContext = ContextFrom<typeof authModel>;
export type AuthMachineEvent = EventFrom<typeof authModel>;
// export type AuthMachineContext = ContextFrom<typeof authModel>;
// export type AuthMachineEvent = EventFrom<typeof authModel>;

// === Actions  ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
const assignUser = authModel.assign<"A_USER_IS_SIGNED_IN" | "SIGNED_IN">({
  user: (_, event) => event.user,
});
const assignAndLogError = authModel.assign<"ERROR">({
  error: (_context, event) => event.error,
  log: (context, event) => addToLog(context, event.error.message, "text-red"),
});
const clearError = authModel.assign<
  | "A_USER_IS_SIGNED_IN"
  | "NO_USER_IS_SIGNED_IN"
  | "SIGNED_IN"
  | "THE_USER_WAS_SIGNED_OUT"
>({
  error: (_context, _event) => undefined,
});
const clearLog = authModel.assign({
  log: () => [],
});
const clearUser = authModel.assign<"ERROR" | "THE_USER_WAS_SIGNED_OUT">({
  user: (_context, _event) => undefined,
});

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const authMachine = authModel.createMachine(
  {
    id: "authMachine",
    initial: "init",
    context: authModel.initialContext,
    on: {
      LOG: {
        actions: [(context, event) => addToLog(context, event.message)],
      },
      /*
      // "CLEAR THE LOG": {
      //   actions: [
      //     assign({
      //       log: (_context, _event) => [],
      //     }),
      //   ],
      // },
      // "CURRENT DATABASE UPDATED": {
      //   actions: [
      //     immerAssign((context, event) => {
      //       if (context.user && !context.user.profile) {
      //         /**
      //          * A signed-in user who has never had a database updated doesn't
      //          * have a user.profile object yet. (The first 'update' happens
      //          * after the automatic creation of their first database.)
      //          
      //         context.user.profile = {};
      //       }
      //       if (context.user && context.user.profile) {
      //         /**
      //          * Which it must as we just created it.
      //          
      //         context.user.profile.currentDatabase = event.value;
      //       }
      //     }),
      //   ],
      // },
      */
    },
    states: {
      init: {
        entry: [
          send<any, any, AuthMachineEvent>({
            type: "LOG",
            message: "Initialised.",
          }),
        ],
        invoke: {
          src: "userbaseInit",
          onError: {
            /**
             * This almost certainly isn't necessary. This is what happens if
             * the `userbaseInit` service fails at such a level that it doesn't
             * even send us an event. I dunno what that would be.
             *
             * Everything else is handled in the `userbaseInit` service.
             *
             * // TODO: Actually handle this. Or probably just route it to
             * the normal error state.
             */
            target: "catastrophicError",
          },
        },
        on: {
          A_USER_IS_SIGNED_IN: {
            actions: [
              assignUser,
              clearError,
              send<any, any, AuthMachineEvent>({
                type: "LOG",
                message: "Signed-in user detected.",
              }),
            ],
            target: "#authMachine.signedIn",
          },
          NO_USER_IS_SIGNED_IN: {
            actions: [
              clearError,
              send<any, any, AuthMachineEvent>({
                type: "LOG",
                message: "Connection established. No user signed in.",
              }),
            ],
            target: "#authMachine.signedOut",
          },
        },
      },
      signedOut: {
        type: "compound",
        initial: "idle",
        states: {
          idle: {
            on: {
              ATTEMPT_SIGNIN: {
                target: "tryingSignIn",
              },
              SWITCH_TO_THE_SIGNUP_PAGE: {
                target: "#authMachine.signUp",
              },
            },
          },
          tryingSignIn: {
            entry: [
              send<any, any, AuthMachineEvent>({
                type: "LOG",
                message: "Trying sign in.",
              }),
            ],
            invoke: {
              src: "userbaseSignIn",
            },
            on: {
              SIGNED_IN: {
                actions: [assignUser, clearError],
                target: "#authMachine.signedIn",
              },
              ERROR: {
                /**
                 * We're using the generic ERROR event, and in this case we're
                 * catching it here as it indicates that the signIn process
                 * didn't work.
                 */
                actions: [clearUser, assignAndLogError],
                target: "#authMachine.signedOut.signInFailed",
              },
            },
          },
          signInFailed: {},
          tryingSignOut: {
            entry: [
              send<any, any, AuthMachineEvent>({
                type: "LOG",
                message: "Trying sign out.",
              }),
            ],
            invoke: {
              src: "userbaseSignOut",
            },
            on: {
              THE_USER_WAS_SIGNED_OUT: {
                /**
                 * userbase.signOut() did its job, so it has gracefully set the
                 * localStorage item to `signedIn: false`.
                 */
                target: "#authMachine.signedOut",
                actions: [clearError, clearUser],
              },
            },
            exit: [
              send<any, any, AuthMachineEvent>({
                type: "LOG",
                message: "Sign out successful.",
              }),
            ],
          },
        },
        //   signInFailed: {
        //     on: {
        //       "ATTEMPT SIGNIN": {
        //         target: "tryingSignIn",
        //       },
        //       "SWITCH TO THE SIGNUP PAGE": {
        //         target:
        //           "#authMachine.signUp.direWarningAboutE2EEncryptionNotAcknowledged",
        //       },
        //     },
        //   },
        //   tryingSignIn: {
        //     on: {
        //       "A USER IS SIGNED IN": {
        //         target: "#authMachine.signedIn.idle",
        //         actions: ["assignUser", "clearError"],
        //       },
        //       "USERBASE.SIGNIN() RAISED AN ERROR": {
        //         /**
        //          * If we just tried to sign in, and it failed, go to the special
        //          * signedOut.signInFailed state. We use this to report things to
        //          * the hapless user.
        //          */
        //         target: "#authMachine.signedOut.signInFailed",
        //         actions: ["clearUser", "assignAndLogError"],
        //       },
        //     },
        //   },
        // tryingSignOut: {
        //     on: {
        //       "THE USER WAS SIGNED OUT": {
        //         /**
        //          * userbase.signOut() did its job, so it has gracefully set the
        //          * localStorage item to `signedIn: false`.
        //          */
        //         target: "#authMachine.signedOut",
        //         actions: ["clearError", "clearUser"],
        //       },
        //       "SIGNOUT FAILED, SO WE FORCE IT ANYWAY": {
        //         /**
        //          * userbase.signOut() couldn't do its job, so to be sure we
        //          * remove the localStorage item ourselves. Not as graceful, so
        //          * we don't do it by default.
        //          */
        //         target: "#authMachine.signedOut",
        //         actions: ["clearError", "clearUser", "forceSignOut"],
        //       },
        //     },
        // },
        // },
      },
      signUp: {
        type: "compound",
        initial: "direWarningAboutE2EEncryptionNotAcknowledged",
        entry: [
          clearLog,
          send<any, any, AuthMachineEvent>({
            type: "LOG",
            message: `Switch to sign up page. User needs to accept dire warning
              about end-to-end encryption. More information can be found
              <a href="https://userbase.com/docs/faq/"
              class="underline text-red">here</a>.`,
          }),
        ],
        // on: {
        //   "SWITCH TO THE SIGNIN PAGE": {
        //     target: "#authMachine.signedOut.idle",
        //     actions: [
        //       send({
        //         type: "CLEAR THE LOG",
        //       }),
        //       send({
        //         type: "WRITE TO THE LOG",
        //         log: "Switch to sign in page.",
        //       }),
        //     ],
        //   },
        // },
        states: {
          direWarningAboutE2EEncryptionNotAcknowledged: {
            on: {
              ACKNOWLEDGE_DIRE_WARNING_ABOUT_E2E_ENCRYPTION: {
                target: "#authMachine.signUp.okayToTrySignUp",
              },
            },
          },
          okayToTrySignUp: {
            //     entry: [
            //       send({
            //         type: "WRITE TO THE LOG",
            //         log: 'User has accepted dire warning. (Seriously, use <a href="https://1password.com" class="underline text-red">a password manager</a>.)',
            //       }),
            //       () => {
            //         setTimeout(() => {
            //           document.getElementById("username")?.focus();
            //         }, 50);
            //       },
            //     ],
            //     on: {
            //       "ATTEMPT SIGNUP": {
            //         target: "tryingSignUp",
            //       },
            //     },
          },
          //   tryingSignUp: {
          //     entry: [
          //       send({
          //         type: "WRITE TO THE LOG",
          //         log: "Attempting sign up.",
          //       }),
          //     ],
          //     invoke: {
          //       src: "userbaseSignUp",
          //     },
          //     on: {
          //       "SIGNUP WAS SUCCESSFUL": {
          //         target: "#authMachine.signedIn.idle",
          //         actions: [
          //           send({
          //             type: "WRITE TO THE LOG",
          //             log: "Sign up successful.",
          //           }),
          //           authModel.assign({
          //             user: (_, event) => event.value,
          //           }),
          //         ],
          //       },
          //       "SIGNUP FAILED": {
          //         target: "#authMachine.signUp.signUpFailed",
          //       },
          //     },
          //   },
          //   signUpFailed: {
          //     entry: ["assignAndLogError"],
          //     on: {
          //       "ATTEMPT SIGNUP": {
          //         target: "#authMachine.signUp.tryingSignUp",
          //       },
          //     },
          //   },
        },
      },
      signedIn: {
        type: "compound",
        initial: "idle",
        states: {
          idle: {
            entry: [
              send<any, any, AuthMachineEvent>({
                type: "LOG",
                message: "Sign in successful.",
              }),
            ],
            invoke: {
              id: "databaseMachine",
              src: databaseMachine,
            },
            on: {
              ATTEMPT_SIGNOUT: {
                target: "#authMachine.signedOut.tryingSignOut",
              },
              //   "UPDATE USER PROFILE": {
              //     actions: [
              //       immerAssign((context, event) => {
              //         if (context.user) {
              //           context.user.profile = event.profile;
              //         }
              //       }),
              //     ],
              // },
            },
          },
        },
      },
      catastrophicError: {},
    },
  },
  {
    actions: {
      // assignUser: authModel.assign(
      //   {
      //     user: (_, event) => event.user,
      //   },
      //   "A_USER_IS_SIGNED_IN"
      // ),
      // assignAndLogError: authModel.assign({
      //   error: (_context, event) => event.error.message,
      //   log: (context, event) =>
      //     addToLog(context, event.value.message, "text-red"),
      // }),
      // clearUser: authModel.assign({
      //   user: (_context, _event) => undefined,
      // }),
      // clearError: authModel.assign({
      //   error: (_context, _event) => undefined,
      // }),
      // forceSignOut: (_context, _event) => {
      //   window.localStorage.removeItem("userbaseCurrentSession");
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
      userbaseInit:
        (context: AuthMachineContext) =>
        (sendBack: (event: AuthMachineEvent) => void) => {
          userbase
            .init({
              appId: "37c7462e-f79c-4ef3-bdb0-55968a34d572",
              updateUserHandler: ({ user: updatedUser }) => {
                /**
                 * This is the update user handler, so when we're executing this
                 * function we know that we must have a signedIn user.
                 *
                 * Assign the updated user to context.
                 */
                authModel.assign({ user: updatedUser });

                /**
                 * We are *not* going to look for changes to `currentDatabase`
                 * and send them down to the databaseMachine.
                 *
                 * You thought about it but what if the user on this session is
                 * half-way through an edit? Yeah, theoretically it was them
                 * that changed the database on another machine, but this could
                 * still result in data loss. And why *not* be able to have two
                 * databases open on two separate machines? You're doing one
                 * thing at work and another at home.
                 */
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
                  type: "A_USER_IS_SIGNED_IN",
                  user: session.user,
                });
              } else {
                /**
                 * There's no user, but this isn't an error. We just don't have
                 * a signed-in user.
                 */
                sendBack({
                  type: "NO_USER_IS_SIGNED_IN",
                });
              }
            })
            .catch((error: UserbaseError) => {
              /**
               * Now *this* is an error. Something janky happened with the
               * `init` call. We shit the bed at this stage.
               *
               * Update: change from CATASTROPHIC_ERROR to a regular error. Hmm
               * no. What we need to do is examine the error, and depending on
               * which one it is, act accordingly. They're all documented.
               *
               * // TODO: sort this out.
               */
              sendBack({
                type: "ERROR",
                error,
              });
            });
        },

      // == userbaseSignIn   ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      userbaseSignIn:
        (_, event) => (sendBack: (event: AuthMachineEvent) => void) => {
          if (event.type !== "ATTEMPT_SIGNIN") {
            /**
             * Twist TypeScript's arm.
             */
            sendBack({
              type: "ERROR",
              error: {
                name: "UserbaseSignInCallError",
                message: `userbaseSignIn() was invoked from a state that wasn't
                  reached by sending ATTEMPT_SIGNIN. As a result,
                  'event.formData' won't exist, so this function will now
                  return.`,
                status: 901, // Customise me later
              },
            });
            return;
          }
          /**
           * If we're testing this using the inspector, the button-click isn't
           * sending formData. Pick that up, and load some dummy values.
           * // TODO: this is just for testing, pull it out in prod.
           */
          if (!event.formData) {
            event.formData = {
              username: "john",
              password: "test123",
            };
          }
          userbase
            .signIn({
              username: event.formData.username,
              password: event.formData.password,
              rememberMe: "local",
            })
            .then((user) => {
              sendBack({
                type: "SIGNED_IN",
                user,
              });
            })
            .catch((error: UserbaseError) => {
              sendBack({
                type: "ERROR",
                error,
              });
            });
        },

      // == userbaseSignUp   ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      // @ts-ignore
      // userbaseSignUp:
      //   // TODO: 4.22.1
      //   (_, event) => (sendBack: (event: any) => void) => {
      //     // (_, event) => (sendBack: (event: AuthMachineEvent) => void) => {
      //     userbase
      //       .signUp({
      //         username: event.value.username,
      //         password: event.value.password,
      //       })
      //       .then((user) => {
      //         /**
      //          * Brand-new users need a first database.
      //          */
      //         user.profile = {
      //           currentDatabase: "001",
      //         };
      //         sendBack({
      //           type: "SIGNUP WAS SUCCESSFUL",
      //           user,
      //         });
      //       })
      //       .catch((error) => {
      //         sendBack({
      //           type: "SIGNUP FAILED",
      //           error,
      //         });
      //       });
      //   },

      // == userbaseSignOut  ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      userbaseSignOut: () => (sendBack: (event: AuthMachineEvent) => void) => {
        userbase
          .signOut()
          .then(() => {
            sendBack({
              type: "THE_USER_WAS_SIGNED_OUT",
            });
          })
          .catch((error) => {
            sendBack({
              type: "SIGNOUT_FAILED_SO_WE_FORCE_IT_ANYWAY",
            });
          });
      },
    },
  }
);
