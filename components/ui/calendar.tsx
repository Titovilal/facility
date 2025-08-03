/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import {
  DateRange,
  DayButton,
  DayPicker,
  getDefaultClassNames,
  OnSelectHandler,
} from "react-day-picker";

import { useTimeEntriesStore } from "@/components/dashboard/use-time-entries-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  showHours = false,
  selected,
  onSelect,
  mode = "single", // Default to single mode
  ...props
}: Omit<React.ComponentProps<typeof DayPicker>, "selected" | "onSelect"> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  showHours?: boolean;
  selected?: Date | Date[] | DateRange | undefined;
  onSelect?: (day: Date | undefined) => void;
}) {
  const defaultClassNames = getDefaultClassNames();

  // Determine if we need to use range mode based on the selected value
  const effectiveMode = React.useMemo(() => {
    if (selected && typeof selected === "object" && "from" in selected && selected.to) {
      return "range";
    }
    if (Array.isArray(selected) && selected.length > 1) {
      return "range";
    }
    return mode;
  }, [selected, mode]);

  // Convert selected to the format expected by DayPicker
  const normalizedSelected = React.useMemo(() => {
    if (!selected) return undefined;

    if (effectiveMode === "range") {
      if (Array.isArray(selected)) {
        // If it's an array, use the first and last dates as range
        if (selected.length > 1) {
          return {
            from: selected[0],
            to: selected[selected.length - 1],
          } as DateRange;
        } else if (selected.length === 1) {
          return { from: selected[0] } as DateRange;
        }
        return undefined;
      }

      // If it's a DateRange already, return as is
      if (typeof selected === "object" && "from" in selected) {
        return selected as DateRange;
      }

      // If it's a single Date
      return { from: selected } as DateRange;
    } else {
      // For single mode, just return the date
      if (Array.isArray(selected)) {
        return selected.length > 0 ? selected[0] : undefined;
      }
      if (typeof selected === "object" && "from" in selected) {
        return selected.from;
      }
      return selected;
    }
  }, [selected, effectiveMode]);

  // Create a custom onSelect handler that adapts to the DayPicker's expected type
  const handleDayPickerSelect = React.useCallback<OnSelectHandler<any>>(
    (selectedDay) => {
      if (!onSelect) return;

      // If nothing is selected or the selection is cleared
      if (!selectedDay) {
        onSelect(undefined);
        return;
      }

      // Handle deselection: if clicking the same date that's already selected, deselect it
      if (selected && selectedDay) {
        const currentSelected = Array.isArray(selected) ? selected[0] : 
          (typeof selected === "object" && "from" in selected) ? selected.from : selected;
        
        if (currentSelected && 
            currentSelected.getDate() === selectedDay.getDate() &&
            currentSelected.getMonth() === selectedDay.getMonth() &&
            currentSelected.getFullYear() === selectedDay.getFullYear()) {
          onSelect(undefined);
          return;
        }
      }

      // Handle the case based on mode
      if (effectiveMode === "range" && typeof selectedDay === "object" && "from" in selectedDay) {
        onSelect(selectedDay.from);
      } else {
        // For single mode
        onSelect(selectedDay);
      }
    },
    [onSelect, selected, effectiveMode]
  );

  return (
    <DayPicker
      mode={effectiveMode as any} // Type assertion to avoid TypeScript narrowing issues
      showOutsideDays={showOutsideDays}
      weekStartsOn={1} // Set Monday as the first day of the week
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      selected={normalizedSelected as any}
      onSelect={handleDayPickerSelect}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input has-focus:ring-ring/50 relative rounded-md border shadow-xs has-focus:ring-[3px]",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 rounded-md text-[0.8rem] font-normal select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground text-[0.8rem] select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
          }

          return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
        },
        DayButton: (props) => <CalendarDayButton {...props} showHours={showHours} />,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  showHours = false,
  ...props
}: React.ComponentProps<typeof DayButton> & { showHours?: boolean }) {
  const defaultClassNames = getDefaultClassNames();

  // Create a stable selector that only re-renders when the specific day's data changes
  const dateKey = React.useMemo(() => {
    // Use the same formatDateKey logic as in the store to ensure consistency
    if (!day.date || !(day.date instanceof Date) || isNaN(day.date.getTime())) {
      throw new Error("Invalid date provided to formatDateKey");
    }
    // Use UTC to avoid timezone issues when formatting dates
    const year = day.date.getFullYear();
    const month = String(day.date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day.date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  }, [day.date]);

  const dayData = useTimeEntriesStore(
    React.useCallback((state) => state.monthlyData[dateKey], [dateKey])
  );

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const dailyEarnings = dayData?.totalEarnings || 0;
  const dailyHours = dayData?.hourBreakdown?.total || 0;
  const vacationType = dayData?.vacationType || "none";
  const isVacationDay = vacationType !== "none";

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
        isVacationDay ? "bg-blue-300/30" : ""
      )}
      {...props}
    >
      <span className="text-sm font-bold">{day.date.getDate()}</span>
      {isVacationDay ? (
        <span className="text-xs font-normal opacity-70">VAC</span>
      ) : showHours ? (
        dailyHours > 0 && (
          <span className="text-xs font-normal text-orange-600 opacity-70">
            {dailyHours.toFixed(1)}h
          </span>
        )
      ) : (
        dailyEarnings > 0 && (
          <span className="text-xs font-normal text-green-600 opacity-70">
            €{dailyEarnings.toFixed(0)}
          </span>
        )
      )}
    </Button>
  );
}

export { Calendar, CalendarDayButton };
