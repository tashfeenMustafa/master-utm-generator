"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toSnakeCase } from "@/lib/utils/to-snake-case";
import { getValues, addValue, deleteValue } from "@/lib/storage";
import type { ManageableParameter, UtmValue } from "@/lib/types";

const PARAMETER_LABELS: Record<ManageableParameter, string> = {
  utm_campaign: "Campaign",
  utm_term: "Term",
  utm_content: "Content",
};

interface ValueSectionProps {
  parameter: ManageableParameter;
}

export function ValueSection({ parameter }: ValueSectionProps) {
  const [values, setValues] = useState<UtmValue[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setValues(getValues(parameter));
  }, [parameter]);

  const preview = toSnakeCase(input);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const snakeValue = toSnakeCase(trimmed);
    const result = addValue({
      parameter,
      value: snakeValue,
      label: trimmed,
      source: "manual",
      sourceRef: null,
    });

    if (result === null) {
      toast.error(`"${snakeValue}" already exists for ${PARAMETER_LABELS[parameter]}.`);
      return;
    }

    setValues(getValues(parameter));
    setInput("");
    toast.success(`Added "${snakeValue}" to ${PARAMETER_LABELS[parameter]}.`);
  }

  function handleDelete(id: string, value: string) {
    deleteValue(id);
    setValues(getValues(parameter));
    toast.success(`Removed "${value}" from ${PARAMETER_LABELS[parameter]}.`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{PARAMETER_LABELS[parameter]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Input
              placeholder={`Add a ${PARAMETER_LABELS[parameter].toLowerCase()} value...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={`New ${PARAMETER_LABELS[parameter].toLowerCase()} value`}
            />
            {input.trim() && (
              <p className="text-xs text-muted-foreground" data-testid="snake-preview">
                Value: <code>{preview}</code>
              </p>
            )}
          </div>
          <Button onClick={handleAdd} disabled={!input.trim()}>
            Add
          </Button>
        </div>

        {values.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="empty-state">
            No values yet. Add your first value or connect a data source.
          </p>
        ) : (
          <ul className="space-y-2" role="list">
            {values.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium">{v.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {v.value}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(v.id, v.value)}
                  aria-label={`Delete ${v.value}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
