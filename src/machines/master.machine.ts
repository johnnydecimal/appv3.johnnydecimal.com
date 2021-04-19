// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { Machine, assign } from "@xstate/compiled";
import userbase, { UserResult } from "userbase-js";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export interface TheMachineContext {
  error?: string;
  user?: UserResult;
}

export type TheMachineEvent =
  | { type: "TRY_SIGNOUT" }
  | { type: "TRY_SIGNIN"; data: any }
  | { type: "done.invoke.userbaseInit"; data: any };
// | { type: "done.invoke.userbaseInit"; data: { user: UserResult } };

export const masterMachine = Machine<
  TheMachineContext,
  TheMachineEvent,
  "masterMachine"
>(
  {
    initial: "init",
    states: {
      init: {
        invoke: {
          src: "userbaseInit",
          onDone: [
            {
              target: "signedIn",
              cond: "isUserReturned",
            },
            {
              target: "signedOut",
            },
          ],
          onError: "signedOut",
        },
      },
      signedIn: {
        on: {
          TRY_SIGNOUT: "tryingSignOut",
        },
      },
      signedOut: {
        on: {
          TRY_SIGNIN: "tryingSignIn",
        },
      },
      tryingSignOut: {
        invoke: {
          src: "trySignOut",
          onDone: "signedOut",
          onError: {
            target: "error",
            actions: [(context, event) => console.log(event)],
          },
        },
      },
      tryingSignIn: {
        invoke: {
          src: "trySignIn",
          onDone: {
            target: "signedIn",
            actions: ["assignUserToContext"],
          },
          onError: {
            target: "error",
            actions: [(context, event) => console.log(event)],
          },
        },
      },
      error: {},
    },
  },
  {
    actions: {
      assignUserToContext: assign<TheMachineContext, TheMachineEvent>({
        user: (_, event) => {
          if (event.type === "done.invoke.userbaseInit") return event.data;
        },
        error: () => undefined,
      }),
    },
    guards: {
      isUserReturned: (_, event: { data: { user: UserResult } }) =>
        Boolean(event.data.user),
    },
    services: {
      userbaseInit: (_context, _event) => {
        return userbase.init({
          appId: "37c7462e-f79c-4ef3-bdb0-55968a34d572",
        });
      },
      trySignIn: (_context, _event) => {
        return userbase.signIn({
          username: "john",
          password: "test123",
          rememberMe: "local",
        });
      },
      trySignOut: (_context, _event) => {
        console.log("-> Trying signOut()");
        return userbase.signOut();
      },
    },
  }
);
