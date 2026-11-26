"use client";

import * as React from "react";
import { enUS, vi } from "react-day-picker/locale";
import { CalendarIcon } from "lucide-react";
import { useFormatter, useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const calendarLocales = { vi, en: enUS };

/** Past-date picker (today allowed), same look as the sign-up date of birth. */
export function DateField({
  id,
  value,
  onChange,
  invalid,
  disabled,
  placeholder,
  defaultYearsAgo = 5,
}: {
  id: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  invalid?: boolean;
  disabled?: boolean;
  placeholder: string;
  defaultYearsAgo?: number;
}) {
  const format = useFormatter();
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            className="w-full justify-between bg-transparent font-normal"
          />
        }
      >
        <span className={value ? undefined : "text-muted-foreground"}>
          {value
            ? format.dateTime(value, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : placeholder}
        </span>
        <CalendarIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <PastCalendar
          value={value}
          defaultYearsAgo={defaultYearsAgo}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

// Mounted only while the popover is open, so "today" is read at interaction time, not at prerender.
function PastCalendar({
  value,
  defaultYearsAgo,
  onSelect,
}: {
  value: Date | undefined;
  defaultYearsAgo: number;
  onSelect: (date: Date | undefined) => void;
}) {
  const locale = useLocale();
  const today = new Date();
  return (
    <Calendar
      mode="single"
      locale={calendarLocales[locale as "vi" | "en"]}
      className="[--cell-size:--spacing(9)]"
      captionLayout="dropdown"
      selected={value}
      defaultMonth={
        value ??
        new Date(today.getFullYear() - defaultYearsAgo, today.getMonth())
      }
      startMonth={new Date(1920, 0)}
      endMonth={today}
      disabled={{ after: today }}
      onSelect={onSelect}
    />
  );
}
