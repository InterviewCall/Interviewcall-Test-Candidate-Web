import { Icon } from "./icon";

/** A form-level failure that doesn't belong to one field. */
export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-control bg-danger-tint px-3.5 py-3 text-sm text-danger">
      <Icon name="alert" size={17} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
