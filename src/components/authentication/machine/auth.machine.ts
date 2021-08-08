// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { assign, ContextFrom, EventFrom, send as xstateSend } from "xstate";
import { createModel } from "xstate/lib/model";
import userbase, { UserProfile, UserResult } from "userbase-js";
import merge from "deepmerge";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { databaseMachine } from "components/database";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { ISignInFormData } from "../SignInForm/SignInForm";
import { ISignUpFormData } from "../SignUpForm/SignUpForm";

interface UserbaseError {
  name: string; // UsernameOrPasswordMismatch
  message: string; // Username or password mismatch.
  status: number; // 401
}

const authModel = createModel(
  {
    /**
     * The most recent error. This can be `undefined`, in the case where there
     * is no error.
     */
    error: undefined as undefined | UserbaseError,

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

      // -- From the signUp state
      SWITCH_TO_THE_SIGNIN_PAGE: () => ({}),
      ATTEMPT_SIGNUP: (formData: ISignUpFormData) => ({ formData }),
      SIGNUP_WAS_SUCCESSFUL: (user: UserResult) => ({ user }),
      SIGNUP_FAILED: (error: UserbaseError) => ({ error }),

      // -- From the signedIn state
      ATTEMPT_SIGNOUT: () => ({}),
      UPDATE_USER_PROFILE: (profile: UserProfile) => ({ profile }),
      USER_PROFILE_UPDATED: () => ({}),

      // == Catch-all error for the whole app ==-==-==
      /**
       * This is the only ERROR state; children also send their errors here.
       */
      ERROR: (error: UserbaseError) => ({ error }),
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

const send = (event: AuthMachineEvent) =>
  xstateSend<any, any, AuthMachineEvent>(event);

// === Actions  ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
const assignUser = authModel.assign<
  "A_USER_IS_SIGNED_IN" | "SIGNED_IN" | "SIGNUP_WAS_SUCCESSFUL"
>({
  user: (_context, event) => event.user,
});
const assignAndLogError = authModel.assign<"ERROR" | "SIGNUP_FAILED">({
  error: (_context, event) => event.error,
  log: (context, event) => addToLog(context, event.error.message, "text-red"),
});
const clearError = authModel.assign<
  | "A_USER_IS_SIGNED_IN"
  | "NO_USER_IS_SIGNED_IN"
  | "SIGNED_IN"
  | "THE_USER_WAS_SIGNED_OUT"
  | "SIGNOUT_FAILED_SO_WE_FORCE_IT_ANYWAY"
>({
  error: (_context, _event) => undefined,
});
const clearLog = authModel.assign({
  log: () => [],
});
const clearUser = authModel.assign<
  "ERROR" | "THE_USER_WAS_SIGNED_OUT" | "SIGNOUT_FAILED_SO_WE_FORCE_IT_ANYWAY"
>({
  user: (_context, _event) => undefined,
});
const forceSignOut = () => {
  window.localStorage.removeItem("userbaseCurrentSession");
};

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
      ERROR: {
        actions: [assignAndLogError],
        target: "#authMachine.error",
      },
    },
    states: {
      init: {
        entry: [
          send({
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
              send({
                type: "LOG",
                message: "Signed-in user detected.",
              }),
            ],
            target: "#authMachine.signedIn.databaseOpener",
          },
          NO_USER_IS_SIGNED_IN: {
            actions: [
              clearError,
              send({
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
              send({
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
                target: "#authMachine.signedIn.databaseOpener",
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
          signInFailed: {
            /**
             * Used for styling on the form.
             */
            on: {
              ATTEMPT_SIGNIN: {
                target: "tryingSignIn",
              },
              SWITCH_TO_THE_SIGNUP_PAGE: {
                target: "#authMachine.signUp",
              },
            },
          },
          tryingSignOut: {
            entry: [
              clearLog,
              send({
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
              SIGNOUT_FAILED_SO_WE_FORCE_IT_ANYWAY: {
                /**
                 * userbase.signOut() couldn't do its job, so to be sure we
                 * remove the localStorage item ourselves. Not as graceful, so
                 * we don't do it by default.
                 */
                target: "#authMachine.signedOut",
                actions: [clearError, clearUser, forceSignOut],
              },
            },
            exit: [
              send({
                type: "LOG",
                message: "Sign out successful.",
              }),
            ],
          },
        },
      },
      signUp: {
        type: "compound",
        initial: "direWarningAboutE2EEncryptionNotAcknowledged",
        entry: [
          clearLog,
          send({
            type: "LOG",
            message: `Switch to sign up page. User needs to accept dire warning
              about end-to-end encryption. More information can be found
              <a href="https://userbase.com/docs/faq/"
              class="underline text-red">here</a>.`,
          }),
        ],
        on: {
          SWITCH_TO_THE_SIGNIN_PAGE: {
            target: "#authMachine.signedOut.idle",
            actions: [
              clearLog,
              send({
                type: "LOG",
                message: "Switch to sign in page.",
              }),
            ],
          },
        },
        states: {
          direWarningAboutE2EEncryptionNotAcknowledged: {
            on: {
              ACKNOWLEDGE_DIRE_WARNING_ABOUT_E2E_ENCRYPTION: {
                target: "#authMachine.signUp.okayToTrySignUp",
              },
            },
          },
          okayToTrySignUp: {
            entry: [
              send({
                type: "LOG",
                message: `User has accepted dire warning. (Seriously, use
                    <a href="https://1password.com" class="underline text-red">
                    a password manager</a>.)`,
              }),
              () => {
                /**
                 * It seems to want a brief moment to render, after which we
                 * ensure that the username field has focus.
                 */
                setTimeout(() => {
                  document.getElementById("username")?.focus();
                }, 50);
              },
            ],
            on: {
              ATTEMPT_SIGNUP: {
                target: "tryingSignUp",
              },
            },
          },
          tryingSignUp: {
            entry: [
              send({
                type: "LOG",
                message: "Attempting sign up.",
              }),
            ],
            invoke: {
              src: "userbaseSignUp",
            },
            on: {
              SIGNUP_WAS_SUCCESSFUL: {
                target: "#authMachine.signedIn.databaseOpener",
                actions: [
                  assignUser,
                  send({
                    type: "LOG",
                    message: "Sign up successful.",
                  }),
                ],
              },
              SIGNUP_FAILED: {
                actions: [assignAndLogError],
                target: "#authMachine.signUp.signUpFailed",
              },
            },
          },
          signUpFailed: {
            /**
             * Used for styling on the form.
             */
            on: {
              ATTEMPT_SIGNUP: {
                target: "#authMachine.signUp.tryingSignUp",
              },
            },
          },
        },
      },
      signedIn: {
        type: "parallel",
        states: {
          databaseOpener: {
            type: "compound",
            initial: "idle",
            states: {
              idle: {
                entry: [
                  send({
                    type: "LOG",
                    message: "Sign in successful.",
                  }),
                ],
                invoke: {
                  id: "databaseMachine",
                  src: databaseMachine,
                  data: {
                    /**
                     * We tell TS that this property must exist because we create
                     * it when a new user is created, and only ever update (vs.
                     * delete) it.
                     */
                    currentProject: (context: AuthMachineContext) =>
                      context.user!.profile!.currentProject,
                    currentUsername: (context: AuthMachineContext) =>
                      context.user!.username,
                    databases: () => [],
                    userbaseItems: () => [],
                    jdSystem: () => {
                      return {};
                    },
                  },
                },
                on: {
                  ATTEMPT_SIGNOUT: {
                    target: "#authMachine.signedOut.tryingSignOut",
                  },
                },
              },
            },
          },
          profileUpdater: {
            type: "compound",
            initial: "idle",
            states: {
              idle: {
                on: {
                  UPDATE_USER_PROFILE: {
                    target: "updatingUserProfile",
                  },
                },
              },
              updatingUserProfile: {
                entry: [
                  /**
                   * Take event.profile, deepmerge it with context.user.profile,
                   * and update context.user.profile.
                   */
                  assign({
                    user: (context, event) => {
                      if (event.type !== "UPDATE_USER_PROFILE") {
                        return context.user;
                      }
                      const newUserProfile = merge(
                        context.user!.profile!,
                        event.profile
                      );
                      const newUser = {
                        ...(context.user as UserResult),
                        profile: {
                          ...newUserProfile,
                        } as UserProfile,
                      };
                      return newUser;
                    },
                  }),
                ],
                invoke: {
                  src: "userbaseUpdateUserProfile",
                },
                on: {
                  USER_PROFILE_UPDATED: {
                    target: "idle",
                  },
                },
              },
            },
          },
        },
      },
      catastrophicError: {},
      error: {
        type: "final",
      },
    },
  },
  {
    services: {
      // == userbaseInit  ==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
      userbaseInit: () => (sendBack: (event: AuthMachineEvent) => void) => {
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
               * We are *not* going to look for changes to `currentProject`
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
        (_, event: AuthMachineEvent) =>
        (sendBack: (event: AuthMachineEvent) => void) => {
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
      userbaseSignUp:
        (_, event: AuthMachineEvent) =>
        (sendBack: (event: AuthMachineEvent) => void) => {
          if (event.type !== "ATTEMPT_SIGNUP") {
            /**
             * Twist TypeScript's arm.
             */
            sendBack({
              type: "ERROR",
              error: {
                name: "UserbaseSignUpCallError",
                message: `userbaseSignUp() was invoked from a state that wasn't
                  reached by sending ATTEMPT_SIGNUP. As a result,
                  'event.formData' won't exist, so this function will now
                  return.`,
                status: 902, // Customise me later
              },
            });
            return;
          }
          userbase
            .signUp({
              username: event.formData.username,
              password: event.formData.password,
              profile: {
                currentProject: "001",
              },
            })
            .then((user) => {
              sendBack({
                type: "SIGNUP_WAS_SUCCESSFUL",
                user,
              });
            })
            .catch((error) => {
              sendBack({
                type: "SIGNUP_FAILED",
                error,
              });
            });
        },

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

      // == userbaseUpdateUserProfile ==-==-==-==-==-==-==-==-==-==-==-==-==-==
      userbaseUpdateUserProfile:
        (context: AuthMachineContext, event: AuthMachineEvent) =>
        (sendBack: (event: AuthMachineEvent) => void) => {
          if (event.type !== "UPDATE_USER_PROFILE") {
            /**
             * Twist TypeScript's arm.
             */
            sendBack({
              type: "ERROR",
              error: {
                name: "UserbaseUpdateUserProfileError",
                message: `userbaseUpdateUserProfile() was invoked from a state
                  that wasn't reached by sending UPDATE_USER_PROFILE. While
                  this probably won't cause any problems, it shouldn't
                  have happened.`,
                status: 903, // Customise me later
              },
            });
            return;
          }
          userbase
            .updateUser({
              profile: context.user!.profile,
            })
            .then(() => {
              sendBack({
                type: "USER_PROFILE_UPDATED",
              });
            })
            .catch((error) => {
              sendBack({ type: "ERROR", error });
            });
        },
    },
  }
);
