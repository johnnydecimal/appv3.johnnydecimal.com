import { nanoid } from "nanoid";

describe("new user first run", () => {
  const userId = `cy_${nanoid(6)}`;

  beforeEach(() => {
    sessionStorage.clear();
    cy.visit("/");
  });

  afterEach(() => {
    cy.window()
      .its("__handleDeleteUser__")
      .then((handleDeleteUser) => {
        handleDeleteUser();
      });
  });

  it("signs up a new user and creates project 001", () => {
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
      .contains("Sign out", { timeout: 10000 })
      .get("#project")
      .contains("001");
  });
});

describe("existing user", () => {
  const user = {
    username: "cypress_perm",
    password: "test123",
  };

  beforeEach(() => {
    sessionStorage.clear();
    cy.visit("/");
  });

  it("signs in an existing user account", () => {
    cy.get("#username")
      .type(user.username)
      .get("#password")
      .type(user.password)
      .type("{enter}")
      .get("body")
      .contains("Sign out", { timeout: 10000 });
  });
});
