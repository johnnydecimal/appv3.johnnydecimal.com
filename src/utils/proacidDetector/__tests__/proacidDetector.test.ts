import { proacidDetector } from "../proacidDetector";

it("should detect a project", () => {
  expect(proacidDetector("000")).toBe("project");
  expect(proacidDetector("a000")).not.toBe("project");
  expect(proacidDetector("a000a")).not.toBe("project");
  expect(proacidDetector("000a")).not.toBe("project");
  expect(proacidDetector("0000")).not.toBe("project");
  expect(proacidDetector("00 0")).not.toBe("project");
  expect(proacidDetector("00")).not.toBe("project");
});

it("should detect an area", () => {
  expect(proacidDetector("00-09")).toBe("area");
  expect(proacidDetector("90-99")).toBe("area");
  expect(proacidDetector("a90-99")).not.toBe("area");
  expect(proacidDetector("a90-99a")).not.toBe("area");
  expect(proacidDetector("90-99a")).not.toBe("area");
  expect(proacidDetector("90a99")).not.toBe("area");
  expect(proacidDetector("90 99")).not.toBe("area");
  expect(proacidDetector("01-09")).not.toBe("area");
  expect(proacidDetector("10-09")).not.toBe("area");
  expect(proacidDetector("00-19")).not.toBe("area");
  expect(proacidDetector("00-08")).not.toBe("area");
  expect(proacidDetector("0-9")).not.toBe("area");
});

it("should detect a category", () => {
  expect(proacidDetector("00")).toBe("category");
  expect(proacidDetector("99")).toBe("category");
  expect(proacidDetector("a00")).not.toBe("category");
  expect(proacidDetector("a00a")).not.toBe("category");
  expect(proacidDetector("00a")).not.toBe("category");
  expect(proacidDetector("0 0")).not.toBe("category");
  expect(proacidDetector("a0")).not.toBe("category");
  expect(proacidDetector("0a")).not.toBe("category");
  expect(proacidDetector("0")).not.toBe("category");
  expect(proacidDetector("000")).not.toBe("category");
});

it("should detect an id", () => {
  expect(proacidDetector("00.00")).toBe("id");
  expect(proacidDetector("12.34")).toBe("id");
  expect(proacidDetector("99.99")).toBe("id");
  expect(proacidDetector("a99.99")).not.toBe("id");
  expect(proacidDetector("a99.99a")).not.toBe("id");
  expect(proacidDetector("99.99a")).not.toBe("id");
  expect(proacidDetector("99a99")).not.toBe("id");
  expect(proacidDetector("99 99")).not.toBe("id");
  expect(proacidDetector("9.99")).not.toBe("id");
  expect(proacidDetector("99.9")).not.toBe("id");
});

it("should return an error in all sorts of situations", () => {
  expect(proacidDetector("")).toBe("error");
  expect(proacidDetector("a")).toBe("error");
  expect(proacidDetector("a000")).toBe("error");
  expect(proacidDetector("a00-09")).toBe("error");
  expect(proacidDetector("a00")).toBe("error");
  expect(proacidDetector("a00.00")).toBe("error");
  expect(proacidDetector(undefined)).toBe("error");
  expect(proacidDetector(null)).toBe("error");
  // @ts-expect-error
  expect(proacidDetector({})).toBe("error");
  // @ts-expect-error
  expect(proacidDetector([])).toBe("error");
});
