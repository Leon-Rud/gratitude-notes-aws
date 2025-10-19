import { ReactNode } from 'react';

type FormCardProps = {
  title: string;
  description: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  actionLabel: string;
  isLoading?: boolean;
};

export function FormCard({ title, description, onSubmit, children, actionLabel, isLoading }: FormCardProps) {
  return (
    <section className="flex h-full flex-col rounded-xl bg-slate-800/80 p-6 shadow-lg ring-1 ring-slate-700">
      <div className="min-h-[88px] space-y-1">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-300">{description}</p>
      </div>
      <form className="mt-4 flex flex-1 flex-col gap-4" onSubmit={onSubmit} aria-busy={isLoading}>
        <div className="flex flex-1 flex-col gap-4">{children}</div>
        <button
          type="submit"
          disabled={isLoading}
          aria-disabled={isLoading}
          className="mt-auto inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? 'Working…' : actionLabel}
        </button>
      </form>
    </section>
  );
}
