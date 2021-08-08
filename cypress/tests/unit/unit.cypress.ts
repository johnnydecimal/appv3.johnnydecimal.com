import { insert } from "../../../src/components/crud";

describe("unit tests", () => {
  before(() => {
    expect(insert, "insert").to.be.a("function");
  });

  it("returns true", () => {
    expect(insert("item")).to.be.true;
  });
});
