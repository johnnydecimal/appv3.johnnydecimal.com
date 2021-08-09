import { nanoid } from "nanoid";

import { JDProjectNumbers } from "../../../src/@types";

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

  it("signs up a new user and creates a bunch of items", () => {
    // Sign up
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

      // Default project 001 has been created
      .get("#project")
      .contains("Project 001")

      // Create project 002
      .get("#new-project")
      .type("002{enter}")
      .get("#project")
      .contains("Project 002")

      // Switch back to project 001
      .get("#new-project")
      .clear()
      .type("001{enter}")
      .get("#project")
      .contains("Project 001")

      // Using the function exposed on `window`, switch again
      .window()
      .its("DatabaseMachine.changeDatabase")
      .then((changeDatabase: (newDatabase: JDProjectNumbers) => void) => {
        changeDatabase("002");
      })
      .get("#project")
      .contains("Project 002");
  });
});

describe("switching between signup screens", () => {
  it("switches between the signin and signup pages", () => {
    cy.visit("/")
      .get("body")
      .contains("h1", "Sign in")
      .get("body")
      .contains("Sign up")
      .click()
      .get("body")
      .contains("h1", "Sign up")
      .get("body")
      .contains("Really important message")
      .get("body")
      .contains("Sign in")
      .click()
      .get("body")
      .contains("h1", "Sign in");
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
