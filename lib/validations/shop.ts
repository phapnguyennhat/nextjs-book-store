import { format, parseISO } from "date-fns";
import { z } from "zod";

import type { Kyc, KycRequest, SellerType, ShopRequest } from "../api/shop.ts";
import { emailSchema, type ValidationT } from "./auth.ts";

// Limits and patterns mirror the backend's ShopRequest / KycRequest records.

const text = (t: ValidationT, max: number) =>
  z
    .string()
    .trim()
    .min(1, { error: t("required"), abort: true })
    .max(max, t("tooLong", { max }));

const pattern = (t: ValidationT, re: RegExp, key: Parameters<ValidationT>[0]) =>
  z
    .string()
    .trim()
    .min(1, { error: t("required"), abort: true })
    .regex(re, t(key));

export const createShopSchema = (t: ValidationT) =>
  z.object({
    name: text(t, 100),
    slug: z
      .string()
      .trim()
      .min(3, t("slugMin"))
      .max(50, t("tooLong", { max: 50 }))
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, t("slugFormat")),
    description: z.string().trim().max(2000, t("tooLong", { max: 2000 })),
    phone: pattern(t, /^\+?\d{9,15}$/, "phoneFormat"),
    email: emailSchema(t),
    pickupAddress: text(t, 500),
  });

export type ShopValues = z.output<ReturnType<typeof createShopSchema>>;

export function toShopRequest(v: ShopValues): ShopRequest {
  return { ...v, description: v.description || undefined };
}

export const SELLER_TYPES = [
  "INDIVIDUAL",
  "HOUSEHOLD_BUSINESS",
  "COMPANY",
] as const satisfies readonly SellerType[];

export const isBusiness = (type: SellerType | undefined) =>
  !!type && type !== "INDIVIDUAL";

/** Form shape: nested like KycRequest so server field errors ("bank.accountHolder") land on the right input. */
export type KycFormValues = {
  sellerType: SellerType | undefined;
  legalName: string;
  idNumber: string;
  idIssueDate: Date | undefined;
  idIssuePlace: string;
  dateOfBirth: Date | undefined;
  permanentAddress: string;
  idFrontKey: string;
  idBackKey: string;
  selfieKey: string;
  business: {
    businessName: string;
    registrationNumber: string;
    registrationDate: Date | undefined;
    taxCode: string;
    registeredAddress: string;
    licenseKey: string;
  };
  bank: { bankCode: string; accountNumber: string; accountHolder: string };
};

/** What submission requires. Business details are checked only for business sellers. */
export function createKycSchema(
  t: ValidationT,
  business: boolean,
): z.ZodType<KycFormValues, KycFormValues> {
  const pastDate = z
    .date({ error: t("dateRequired") })
    .refine((d) => d <= new Date(), t("dateFuture"));
  const doc = z.string().min(1, t("documentRequired"));
  const loose = z.object({
    businessName: z.string(),
    registrationNumber: z.string(),
    registrationDate: z.date().or(z.undefined()),
    taxCode: z.string(),
    registeredAddress: z.string(),
    licenseKey: z.string(),
  });
  return z.object({
    sellerType: z.enum(SELLER_TYPES, { error: t("sellerTypeRequired") }),
    legalName: text(t, 255),
    idNumber: pattern(t, /^\d{12}$/, "idNumberFormat"),
    idIssueDate: pastDate,
    idIssuePlace: text(t, 255),
    dateOfBirth: pastDate,
    permanentAddress: text(t, 500),
    idFrontKey: doc,
    idBackKey: doc,
    selfieKey: doc,
    business: business
      ? z.object({
          businessName: text(t, 255),
          registrationNumber: text(t, 50),
          registrationDate: pastDate,
          taxCode: pattern(t, /^\d{10}(-\d{3})?$/, "taxCodeFormat"),
          registeredAddress: text(t, 500),
          licenseKey: doc,
        })
      : loose,
    bank: z.object({
      bankCode: text(t, 20),
      accountNumber: pattern(t, /^\d{6,20}$/, "accountNumberFormat"),
      accountHolder: text(t, 255),
    }),
  });
}

export const emptyKycForm: KycFormValues = {
  sellerType: undefined,
  legalName: "",
  idNumber: "",
  idIssueDate: undefined,
  idIssuePlace: "",
  dateOfBirth: undefined,
  permanentAddress: "",
  idFrontKey: "",
  idBackKey: "",
  selfieKey: "",
  business: {
    businessName: "",
    registrationNumber: "",
    registrationDate: undefined,
    taxCode: "",
    registeredAddress: "",
    licenseKey: "",
  },
  bank: { bankCode: "", accountNumber: "", accountHolder: "" },
};

// Blank -> omitted: the backend's @Pattern rejects "" but accepts a missing field in a draft.
const str = (v: string) => v.trim() || undefined;
// LocalDate in local time; toISOString() would shift the day for UTC+ users.
const day = (v: Date | undefined) => (v ? format(v, "yyyy-MM-dd") : undefined);

/** Form -> draft body. Business details are left out for individuals (the backend would still validate them). */
export function toKycRequest(v: KycFormValues): KycRequest {
  const b = v.business;
  return {
    sellerType: v.sellerType,
    legalName: str(v.legalName),
    idNumber: str(v.idNumber),
    idIssueDate: day(v.idIssueDate),
    idIssuePlace: str(v.idIssuePlace),
    dateOfBirth: day(v.dateOfBirth),
    permanentAddress: str(v.permanentAddress),
    idFrontKey: str(v.idFrontKey),
    idBackKey: str(v.idBackKey),
    selfieKey: str(v.selfieKey),
    business: isBusiness(v.sellerType)
      ? {
          businessName: str(b.businessName),
          registrationNumber: str(b.registrationNumber),
          registrationDate: day(b.registrationDate),
          taxCode: str(b.taxCode),
          registeredAddress: str(b.registeredAddress),
          licenseKey: str(b.licenseKey),
        }
      : undefined,
    bank: {
      bankCode: str(v.bank.bankCode),
      accountNumber: str(v.bank.accountNumber),
      accountHolder: str(v.bank.accountHolder),
    },
  };
}

/** Saved draft -> form. parseISO reads yyyy-MM-dd as local midnight (new Date() would read it as UTC). */
export function fromKyc(k: Kyc): KycFormValues {
  const date = (v: string | null | undefined) => (v ? parseISO(v) : undefined);
  const b: NonNullable<Kyc["business"]> = k.business ?? {};
  const bank: NonNullable<Kyc["bank"]> = k.bank ?? {};
  return {
    sellerType: k.sellerType ?? undefined,
    legalName: k.legalName ?? "",
    idNumber: k.idNumber ?? "",
    idIssueDate: date(k.idIssueDate),
    idIssuePlace: k.idIssuePlace ?? "",
    dateOfBirth: date(k.dateOfBirth),
    permanentAddress: k.permanentAddress ?? "",
    idFrontKey: k.idFrontKey ?? "",
    idBackKey: k.idBackKey ?? "",
    selfieKey: k.selfieKey ?? "",
    business: {
      businessName: b.businessName ?? "",
      registrationNumber: b.registrationNumber ?? "",
      registrationDate: date(b.registrationDate),
      taxCode: b.taxCode ?? "",
      registeredAddress: b.registeredAddress ?? "",
      licenseKey: b.licenseKey ?? "",
    },
    bank: {
      bankCode: bank.bankCode ?? "",
      accountNumber: bank.accountNumber ?? "",
      accountHolder: bank.accountHolder ?? "",
    },
  };
}

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024; // KycService.MAX_FILE_SIZE
