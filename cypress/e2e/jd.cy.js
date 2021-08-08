import { nanoid } from "nanoid";
import userbase from "userbase-js";

describe("run it", () => {
  const userId = `cy_${nanoid(6)}`;

  beforeEach(() => {
    sessionStorage.clear();
    cy.visit("/").clearLocalStorage();
  });

  afterEach(() => {
    cy.window()
      .its("__handleDeleteUser__")
      .then((handleDeleteUser) => {
        handleDeleteUser();
      });
  });

  it("starts up", () => {
    cy.get("body")
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

  it("starts again from the beginning", () => {
    cy.get("body");
  });
});
