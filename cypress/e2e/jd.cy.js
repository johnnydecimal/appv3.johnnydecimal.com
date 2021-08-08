import { nanoid } from "nanoid";
import userbase from "userbase-js";

describe("run it", () => {
  const userId = `cy_${nanoid(6)}`;

  afterEach(() => {
    userbase.deleteUser();
  });

  it("starts up", () => {
    cy.visit("/")
      .get("body")
      .contains("Sign up")
      .click()
      .get("body")
      .contains("Really important message")
      .click()
      .get("#username")
      .type(userId)
      .get("#password")
      .type("test123{enter}")
      .get("body")
      .contains("Sign out", { timeout: 10000 });
  });
});
