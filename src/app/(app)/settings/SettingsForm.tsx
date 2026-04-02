"use client";

import { useFormState } from "react-dom";
import { updateSettings } from "@/actions/settings";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

export default function SettingsForm({ defaultThreshold }: { defaultThreshold: number }) {
  const [state, action] = useFormState(updateSettings, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField
        label="Default Low Stock Threshold"
        name="defaultLowStockThreshold"
        type="number"
        min="0"
        defaultValue={defaultThreshold}
        required
        errors={state.fieldErrors?.defaultLowStockThreshold}
      />
      <p className="text-xs text-gray-400 -mt-2">
        Products without a custom threshold will use this value. Default is 5.
      </p>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          Settings saved successfully.
        </p>
      )}

      <div>
        <SubmitButton label="Save Settings" loadingLabel="Saving..." />
      </div>
    </form>
  );
}
