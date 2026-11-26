"use client";

import * as React from "react";
import {
  BadgeCheckIcon,
  CircleAlertIcon,
  HourglassIcon,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { useSession } from "@/components/session-provider";
import { KycForm } from "@/components/shop/kyc-form";
import { ShopForm } from "@/components/shop/shop-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { getKyc, myShop, type Kyc, type MyShop } from "@/lib/api/shop";
import { cn } from "@/lib/utils";

type State =
  | { step: "loading" }
  | { step: "error" }
  | { step: "shop" } // no shop yet
  // editingShop: back on step 1. KYC stays mounted (hidden) so unsaved answers survive the detour.
  | { step: "kyc"; shop: MyShop; kyc: Kyc | null; editingShop: boolean };

const notFound = (e: unknown) => e instanceof ApiError && e.status === 404;

/** Seller onboarding: create the store, fill in KYC, then wait for (or see) the review. */
export function Sell() {
  const t = useTranslations("Sell");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSession();
  const [state, setState] = React.useState<State>({ step: "loading" });

  const load = React.useCallback(async () => {
    setState({ step: "loading" });
    try {
      const shop = await myShop(locale);
      // No KYC row yet (NOT_SUBMITTED) is a 404 too: just an empty form.
      const kyc =
        shop.kycStatus === "NOT_SUBMITTED"
          ? null
          : await getKyc(locale).catch((e) => {
              if (notFound(e)) return null;
              throw e;
            });
      setState({ step: "kyc", shop, kyc, editingShop: false });
    } catch (e) {
      setState(notFound(e) ? { step: "shop" } : { step: "error" });
    }
  }, [locale]);

  // Client-side guard: the access cookie may be gone while the refresh cookie still holds the session.
  React.useEffect(() => {
    if (user === null) router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on sign-in, like SessionProvider
    else if (user) void load();
  }, [user, router, pathname, load]);

  if (!user || state.step === "loading") {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-6" aria-label={t("loading")} />
      </div>
    );
  }

  if (state.step === "error") {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>{t("loadError")}</AlertTitle>
        <AlertDescription>
          <Button variant="outline" className="mt-2" onClick={() => void load()}>
            {t("retry")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const progress =
    state.step === "shop"
      ? 0
      : state.kyc?.status === "PENDING" || state.kyc?.status === "APPROVED"
        ? 2
        : 1;

  if (state.step === "shop") {
    return (
      <div className="flex flex-col gap-8">
        <Steps progress={0} viewing={0} done={false} />
        <Panel>
          <Heading title={t("shop.title")} lead={t("shop.lead")} />
          <ShopForm
            defaultEmail={user.email}
            onSaved={(shop) =>
              setState({ step: "kyc", shop, kyc: null, editingShop: false })
            }
          />
        </Panel>
      </div>
    );
  }

  const editShop = (editingShop: boolean) => setState({ ...state, editingShop });
  return (
    <div className="flex flex-col gap-8">
      <Steps
        progress={progress}
        viewing={state.editingShop ? 0 : progress}
        done={state.kyc?.status === "APPROVED"}
        // The store can be edited in any KYC state (the backend allows it); the review step itself can't be left.
        onSelect={(i) => editShop(i === 0)}
      />
      <Panel>
        {state.editingShop && (
          <>
            <Heading title={t("editShop.title")} lead={t("editShop.lead")} />
            <ShopForm
              shop={state.shop}
              defaultEmail={user.email}
              onSaved={(shop) => setState({ ...state, shop, editingShop: false })}
            />
          </>
        )}
        <div hidden={state.editingShop}>
          <KycStage
            shop={state.shop}
            kyc={state.kyc}
            onSubmitted={(kyc) => setState({ ...state, kyc })}
            onBack={() => editShop(true)}
          />
        </div>
      </Panel>
    </div>
  );
}

function KycStage({
  shop,
  kyc,
  onSubmitted,
  onBack,
}: {
  shop: MyShop;
  kyc: Kyc | null;
  onSubmitted: (kyc: Kyc) => void;
  onBack: () => void;
}) {
  const t = useTranslations("Sell");
  const format = useFormatter();
  const status = kyc?.status ?? "NOT_SUBMITTED";

  if (status === "PENDING" || status === "APPROVED") {
    const approved = status === "APPROVED";
    const Icon = approved ? BadgeCheckIcon : HourglassIcon;
    const when = approved ? kyc?.reviewedAt : kyc?.submittedAt;
    return (
      <div className="flex flex-col items-start gap-4">
        <Icon aria-hidden="true" className={cn("size-10", approved ? "text-teal" : "text-gold")} />
        <Heading
          title={t(approved ? "approved.title" : "pending.title", { shop: shop.name })}
          lead={t(approved ? "approved.lead" : "pending.lead")}
        />
        {when && (
          <p className="-mt-6 text-sm text-muted-foreground">
            {t(approved ? "approved.on" : "pending.on", {
              date: format.dateTime(new Date(when), { dateStyle: "medium" }),
            })}
          </p>
        )}
      </div>
    );
  }

  // Shown until resubmitted, even after the rejected KYC is reopened as a draft.
  const reason = kyc?.rejectionReason ?? shop.rejectionReason;
  return (
    <>
      <Heading title={t("kyc.title", { shop: shop.name })} lead={t("kyc.lead")} />
      {reason && (
        <Alert variant="destructive" className="mb-8">
          <CircleAlertIcon />
          <AlertTitle>{t("kyc.rejected")}</AlertTitle>
          <AlertDescription>{reason}</AlertDescription>
        </Alert>
      )}
      <KycForm initial={kyc} onSubmitted={onSubmitted} onBack={onBack} />
    </>
  );
}

/**
 * Progress through onboarding. `progress` is how far the seller got, `viewing` the step on screen. With
 * onSelect, step 1 and the step in progress are buttons, so the seller can go back to the store and return.
 */
function Steps({
  progress,
  viewing,
  done,
  onSelect,
}: {
  progress: number;
  viewing: number;
  done: boolean;
  onSelect?: (step: number) => void;
}) {
  const t = useTranslations("Home.sellSteps");
  const steps = ["register", "kyc", "review"] as const;
  return (
    <ol className="grid gap-4 sm:grid-cols-3">
      {steps.map((step, i) => {
        const state = i < progress || done ? "done" : i === progress ? "current" : "todo";
        const content = (
          <>
            <span className="text-xs font-semibold tabular-nums text-night-ink">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-semibold">{t(`${step}.title`)}</span>
            <span className="text-sm text-night-ink">{t(`${step}.body`)}</span>
          </>
        );
        const navigable = onSelect && i !== viewing && (i === 0 || i === progress);
        return (
          <li
            key={step}
            aria-current={i === viewing ? "step" : undefined}
            className={cn(
              "border-t-2",
              i === viewing || state === "done" ? "border-gold" : "border-night-line",
              state === "todo" && "text-night-ink",
            )}
          >
            {navigable ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                className="flex w-full flex-col gap-1 px-2 pt-3 pb-2 text-left transition-colors hover:bg-night-raised/60 focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none [&>span:nth-child(2)]:underline-offset-4 hover:[&>span:nth-child(2)]:underline"
              >
                {content}
              </button>
            ) : (
              <div className="flex flex-col gap-1 px-2 pt-3 pb-2">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-[0_24px_48px_-24px_rgb(0_0_0/0.55)]">
      <div aria-hidden="true" className="h-1 bg-gold" />
      <div className="p-6 sm:p-10">{children}</div>
    </section>
  );
}

function Heading({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="mb-8 flex flex-col gap-1.5">
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">{lead}</p>
    </div>
  );
}
