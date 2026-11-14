"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function PasswordInput(
  props: Omit<React.ComponentProps<"input">, "type">,
) {
  const t = useTranslations("PasswordInput");
  const [visible, setVisible] = React.useState(false);

  return (
    <InputGroup>
      <InputGroupInput type={visible ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? t("hide") : t("show")}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
