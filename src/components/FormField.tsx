interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  errors?: string[];
  step?: string;
  min?: string;
}

export default function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  errors,
  step,
  min,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      {errors?.map((e) => (
        <p key={e} className="text-xs text-red-600">
          {e}
        </p>
      ))}
    </div>
  );
}
