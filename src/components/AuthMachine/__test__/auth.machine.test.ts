import { interpret } from "xstate";
import { authMachine } from "../auth.machine";

it("should reach signedOut.idle", (done) => {
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

  // Send events here if needed, but we shouldn't have to because of the invoke
});

it("should reach signedIn.idle", (done) => {
  const mockAuthMachine = authMachine.withConfig({
    services: {
      userbaseInit: () => (sendBack) => {
        sendBack({ type: "A_USER_IS_SIGNED_IN", user: undefined });
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

  // Send events here if needed, but we shouldn't have to because of the invoke
});

it("should spawn the database.machine", (done) => {
  const mockAuthMachine = authMachine.withConfig({
    services: {
      userbaseInit: () => (sendBack) => {
        sendBack({ type: "A_USER_IS_SIGNED_IN", user: undefined });
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

  // Send events here if needed, but we shouldn't have to because of the invoke
});
