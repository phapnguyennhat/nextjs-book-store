import assert from "node:assert/strict";
import { test } from "node:test";

import { initials } from "./initials.ts";

test("first and last word", () => {
  assert.equal(initials("Nguyễn Văn An"), "NA");
  assert.equal(initials("  trần   thị   ánh  "), "TÁ");
});

test("single word and empty", () => {
  assert.equal(initials("An"), "A");
  assert.equal(initials("   "), "?");
});

test("decomposed diacritics stay one letter", () => {
  assert.equal(initials("ẫn Lê".normalize("NFD")), "ẪL".normalize("NFD"));
});
