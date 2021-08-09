import { jdMachine, testUserbaseItems } from "../jd.machine";

describe("jd.machine", () => {
  it("should exist", () => {
    expect(typeof jdMachine).toMatch("object");
  });

  it("should immediately transition to 'error' if no userbaseItems", () => {
    const expectedState = "error";
    const actualState = jdMachine.initialState;
    expect(actualState.matches(expectedState)).toBeTruthy();
  });

  it("should have an empty 'userbaseItems[]' on context", () => {
    const actualContext = jdMachine.initialState.context.userbaseItems;
    expect(typeof actualContext).toBe("object");
  });

  it("should have test 'userbaseItems[]' on context", () => {
    const jdMachineWithUserbaseItems = jdMachine.withContext({
      userbaseItems: testUserbaseItems,
    });
    expect(
      jdMachineWithUserbaseItems.initialState.context.userbaseItems.length
    ).toBe(4);
  });

  it("should transition to 'checkingProject'", () => {
    const jdMachineWithUserbaseItems = jdMachine.withContext({
      userbaseItems: testUserbaseItems,
    });
    expect(
      jdMachineWithUserbaseItems.initialState.matches("checkingProject")
    ).toBeTruthy();
  });
});
