import { api, ApiError, NetworkError } from "@/lib/api/client";

export type KycStatus =
  | "NOT_SUBMITTED"
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";
export type SellerType = "INDIVIDUAL" | "HOUSEHOLD_BUSINESS" | "COMPANY";
export type DocumentType = "ID_FRONT" | "ID_BACK" | "SELFIE" | "BUSINESS_LICENSE";

/** Mirrors the backend's ShopRequest record. */
export type ShopRequest = {
  name: string;
  slug: string;
  description?: string;
  phone: string;
  email: string;
  pickupAddress: string;
};

/** Mirrors MyShopResponse: the owner's view, with the KYC state that decides what the seller does next. */
export type MyShop = Required<Omit<ShopRequest, "description">> & {
  id: number;
  description: string | null;
  kycStatus: KycStatus;
  rejectionReason: string | null;
};

type BusinessInfo = {
  businessName?: string;
  registrationNumber?: string;
  registrationDate?: string; // yyyy-MM-dd
  taxCode?: string;
  registeredAddress?: string;
  licenseKey?: string;
};
type BankAccount = {
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;
};

/** Mirrors KycRequest: a draft, so every field may be missing. Dates are yyyy-MM-dd. */
export type KycRequest = {
  sellerType?: SellerType;
  legalName?: string;
  idNumber?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  dateOfBirth?: string;
  permanentAddress?: string;
  idFrontKey?: string;
  idBackKey?: string;
  selfieKey?: string;
  business?: BusinessInfo;
  bank?: BankAccount;
};

/** Mirrors KycResponse. `documents` are presigned GET URLs that expire in a few minutes. */
export type Kyc = { [K in keyof KycRequest]-?: KycRequest[K] | null } & {
  shopId: number;
  status: KycStatus;
  documents: Partial<Record<DocumentType, string>>;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

type UploadUrl = {
  key: string;
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
};

/** 404 with code shop.not-found when the user has no shop yet. */
export function myShop(locale: string) {
  return api<MyShop>("/api/my-shop", { locale });
}

export function createShop(body: ShopRequest, locale: string) {
  return api<MyShop>("/api/my-shop", { method: "POST", body, locale });
}

/** Allowed in any KYC state: store details aren't part of the verified data. */
export function updateShop(body: ShopRequest, locale: string) {
  return api<MyShop>("/api/my-shop", { method: "PUT", body, locale });
}

/** 404 with code kyc.not-found until the first draft is saved. */
export function getKyc(locale: string) {
  return api<Kyc>("/api/my-shop/kyc", { locale });
}

/** Replaces the whole draft: send every field, documents included, or they are dropped. */
export function saveKyc(body: KycRequest, locale: string) {
  return api<Kyc>("/api/my-shop/kyc", { method: "PUT", body, locale });
}

/** DRAFT -> PENDING; 400 lists missing fields, kyc.account-holder-mismatch if the payout holder isn't the seller. */
export function submitKyc(locale: string) {
  return api<Kyc>("/api/my-shop/kyc/submission", { method: "POST", locale });
}

/** Uploads straight to S3 through a presigned URL and returns the key to put in the KYC draft. */
export async function uploadDocument(
  type: DocumentType,
  file: File,
  locale: string,
) {
  const { key, uploadUrl, headers } = await api<UploadUrl>(
    "/api/my-shop/kyc/upload-urls",
    {
      method: "POST",
      body: { type, contentType: file.type, size: file.size },
      locale,
    },
  );
  let res: Response;
  try {
    // Content-Length is signed too, but browsers forbid setting it: they derive it from the body (= file.size).
    res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": headers["Content-Type"] },
    });
  } catch {
    throw new NetworkError();
  }
  if (!res.ok) throw new ApiError({ status: res.status }); // S3 answers XML, not a problem detail
  return key;
}
