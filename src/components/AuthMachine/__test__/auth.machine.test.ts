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
