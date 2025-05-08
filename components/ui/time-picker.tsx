"use client";

import { Clock } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

interface TimePickerProps {
  className?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  disabled?: boolean;
}

export function TimePicker({
  className,
  value,
  onChange,
  disabled,
}: TimePickerProps) {
  const [selectedHour, setSelectedHour] = React.useState<string>(
    value ? String(value.getHours()).padStart(2, "0") : "12",
  );
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    value ? String(value.getMinutes()).padStart(2, "0") : "00",
  );

  // Generate hours and minutes options
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  // Update the time when hour or minute changes
  React.useEffect(() => {
    if (onChange && value) {
      const newHour = Number.parseInt(selectedHour, 10);
      const newMinute = Number.parseInt(selectedMinute, 10);

      // Only update if the hour or minute has actually changed
      if (value.getHours() !== newHour || value.getMinutes() !== newMinute) {
        const newDate = new Date(value);
        newDate.setHours(newHour);
        newDate.setMinutes(newMinute);
        onChange(newDate);
      }
    }
  }, [selectedHour, selectedMinute, onChange, value]);

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="grid gap-1.5">
        <Label htmlFor="hours">Hour</Label>
        <Select
          value={selectedHour}
          onValueChange={setSelectedHour}
          disabled={disabled}
        >
          <SelectTrigger id="hours" className="w-[70px]" aria-label="Hours">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="minutes">Minute</Label>
        <Select
          value={selectedMinute}
          onValueChange={setSelectedMinute}
          disabled={disabled}
        >
          <SelectTrigger id="minutes" className="w-[70px]" aria-label="Minutes">
            <SelectValue placeholder="Minute" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
