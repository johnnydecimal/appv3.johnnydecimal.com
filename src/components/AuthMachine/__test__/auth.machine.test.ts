import { UserResult } from "userbase-js";
import { interpret } from "xstate";
import { authMachine } from "../auth.machine";

const user: UserResult = {
  username: "john",
  userId: "dummy",
  authToken: "dummy",
  creationDate: new Date(),
  paymentsMode: "disabled",
};

it("should reach signedOut.idle if no user is signed in", (done) => {
  const mockAuthMachine = authMachine.withConfig({
    services: {
      userbaseInit: () => (sendBack) => {
        sendBack({ type: "NO_USER_IS_SIGNED_IN" });
      },
    },
  });

  const authService = interpret(mockAuthMachine).onTransition((state) => {
    // this is where we expect it to end up
    if (state.matches({ signedOut: "idle" })) {
      done();
    }
  });

  authService.start();
});

it("should reach signedIn.idle if a user is signed in", (done) => {
  const mockAuthMachine = authMachine.withConfig({
    services: {
      userbaseInit: () => (sendBack) => {
        sendBack({ type: "A_USER_IS_SIGNED_IN", user });
      },
    },
  });

  const authService = interpret(mockAuthMachine).onTransition((state) => {
    // this is where we expect it to end up
    if (state.matches({ signedIn: "idle" })) {
      done();
    }
  });

  authService.start();
});

it("should spawn the database.machine if a user is signed in", (done) => {
  const mockAuthMachine = authMachine.withConfig({
    services: {
      userbaseInit: () => (sendBack) => {
        sendBack({ type: "A_USER_IS_SIGNED_IN", user });
      },
    },
  });

  const authService = interpret(mockAuthMachine).onTransition((state) => {
    // this is where we expect it to end up
    if (state.children.databaseMachine) {
      done();
    }
  });

  authService.start();
});

it("should switch to the signup page from the signin page", (done) => {
  const mockAuthMachine = authMachine.withConfig({
    services: {
      userbaseInit: () => (sendBack) => {
        sendBack({ type: "NO_USER_IS_SIGNED_IN" });
      },
    },
  });

  const authService = interpret(mockAuthMachine).onTransition((state) => {
    // this is where we expect it to end up
    if (
      state.matches({ signUp: "direWarningAboutE2EEncryptionNotAcknowledged" })
    ) {
      done();
    }
  });

  authService.start();
  authService.send({ type: "SWITCH_TO_THE_SIGNUP_PAGE" });
});

it("should sign out a user", (done) => {
  const mockAuthMachine = authMachine.withConfig({
    services: {
      userbaseInit: () => (sendBack) => {
        sendBack({ type: "A_USER_IS_SIGNED_IN", user });
      },
      userbaseSignOut: () => (sendBack) => {
        sendBack({ type: "THE_USER_WAS_SIGNED_OUT" });
      },
    },
  });

  const authService = interpret(mockAuthMachine).onTransition((state) => {
    // this is where we expect it to end up
    if (state.matches({ signedOut: "idle" })) {
      done();
    }
  });

  authService.start();
  authService.send({ type: "ATTEMPT_SIGNOUT" });
});

// figure out how to do this. later.
// it("should open a database if a user is signed in", (done) => {
//   const mockAuthMachine = authMachine.withConfig({
//     services: {
//       userbaseInit: () => (sendBack) => {
//         sendBack({ type: "A_USER_IS_SIGNED_IN", user });
//       },
//     },
//   });

//   const authService = interpret(mockAuthMachine).onTransition((state) => {
//     // this is where we expect it to end up
//     if (state.children.databaseMachine) {
//       done();
//     }
//   });

//   authService.start();
// });