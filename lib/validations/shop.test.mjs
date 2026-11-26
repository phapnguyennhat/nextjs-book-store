// Run: node --test lib/validations/shop.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createKycSchema,
  createShopSchema,
  emptyKycForm,
  fromKyc,
  toKycRequest,
} from "./shop.ts";

const t = (key) => key;

const complete = {
  ...emptyKycForm,
  sellerType: "INDIVIDUAL",
  legalName: "Nguyễn Văn An",
  idNumber: "001090012345",
  idIssueDate: new Date(2021, 3, 5),
  idIssuePlace: "Cục CS QLHC",
  dateOfBirth: new Date(1990, 0, 1),
  permanentAddress: "Hà Nội",
  idFrontKey: "kyc/1/ID_FRONT/a",
  idBackKey: "kyc/1/ID_BACK/b",
  selfieKey: "kyc/1/SELFIE/c",
  bank: { bankCode: "VCB", accountNumber: "0123456789", accountHolder: "NGUYEN VAN AN" },
};

test("draft body drops blanks so the backend's patterns don't reject empty strings", () => {
  const body = toKycRequest({ ...emptyKycForm, legalName: "  An " });
  assert.equal(body.legalName, "An");
  assert.equal(body.idNumber, undefined);
  assert.equal(body.idIssueDate, undefined);
  assert.equal(body.business, undefined);
  assert.equal(JSON.stringify(body.bank), "{}");
});

test("dates go out as local yyyy-MM-dd and come back as the same local day", () => {
  const body = toKycRequest(complete);
  assert.equal(body.idIssueDate, "2021-04-05");
  const back = fromKyc({ ...body, business: null, documents: {} });
  assert.equal(back.idIssueDate.getDate(), 5);
  assert.equal(back.idFrontKey, "kyc/1/ID_FRONT/a"); // keys round-trip, or a resave drops the documents
});

test("business details are sent and required only for business sellers", () => {
  assert.equal(toKycRequest({ ...complete, business: { ...complete.business, taxCode: "x" } }).business, undefined);
  assert.equal(createKycSchema(t, false).safeParse(complete).success, true);

  const company = { ...complete, sellerType: "COMPANY" };
  const r = createKycSchema(t, true).safeParse(company);
  assert.equal(r.success, false);
  assert.ok(r.error.issues.some((i) => i.path.join(".") === "business.taxCode"));
  assert.equal(toKycRequest(company).business.taxCode, undefined);
});

test("submission requires documents and well-formed numbers", () => {
  const r = createKycSchema(t, false).safeParse({ ...complete, selfieKey: "", idNumber: "123" });
  const paths = Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message]));
  assert.equal(paths.selfieKey, "documentRequired");
  assert.equal(paths.idNumber, "idNumberFormat");
});

test("shop slug must be lowercase words joined by single hyphens", () => {
  const shop = { name: "Nhà sách An", slug: "nha-sach-an", description: "", phone: "+84901234567", email: "a@vidu.com", pickupAddress: "Hà Nội" };
  const schema = createShopSchema(t);
  assert.equal(schema.safeParse(shop).success, true);
  assert.equal(schema.safeParse({ ...shop, slug: "Nha--sach" }).success, false);
});
