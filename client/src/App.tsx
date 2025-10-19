import { useState } from 'react';
import { FormCard } from './components/FormCard';
import { StatusBanner, StatusState } from './components/StatusBanner';
import { API_BASE_URL, API_KEY } from './config/constants';
import { createSubmitHandler } from './services/customerActions';

export default function App() {
  const [status, setStatus] = useState<StatusState | null>(null);
  const [isCreateLoading, setCreateLoading] = useState(false);
  const [isCheckLoading, setCheckLoading] = useState(false);
  const [isDeleteLoading, setDeleteLoading] = useState(false);

  const [createId, setCreateId] = useState('');
  const [checkId, setCheckId] = useState('');
  const [deleteId, setDeleteId] = useState('');

  const missingConfig = !API_BASE_URL || !API_KEY;

  const handleCreate = createSubmitHandler({
    action: 'create',
    getValue: () => createId,
    setValue: setCreateId,
    setLoading: setCreateLoading,
    setStatus
  });

  const handleCheck = createSubmitHandler({
    action: 'check',
    getValue: () => checkId,
    setValue: setCheckId,
    setLoading: setCheckLoading,
    setStatus
  });

  const handleDelete = createSubmitHandler({
    action: 'delete',
    getValue: () => deleteId,
    setValue: setDeleteId,
    setLoading: setDeleteLoading,
    setStatus
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Mission 2</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Customer ID Console</h1>
        <p className="mt-2 text-sm text-slate-300">
          Add, check or delete you customer ID using the forms below
        </p>
      </header>

      <StatusBanner status={status} onClear={setStatus} />

      {missingConfig && (
        <div className="rounded-lg border border-amber-500/60 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Environment not configured</p>
          <p className="mt-1">
            Set <code className="font-mono">VITE_API_BASE_URL</code> and <code className="font-mono">VITE_API_KEY</code> in a{' '}
            <code className="font-mono">.env.local</code> file before using the forms.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <FormCard
          title="Add customer ID"
          description="Please add a new customer ID and click 'Save ID'."
          onSubmit={handleCreate}
          actionLabel="Save ID"
          isLoading={isCreateLoading}
        >
          <label htmlFor="create-id" className="block text-sm font-medium text-slate-200">
            Customer ID
          </label>
          <input
            id="create-id"
            type="text"
            value={createId}
            onChange={(event) => setCreateId(event.target.value)}
            placeholder="e.g. TEST123"
            disabled={isCreateLoading}
            className="field overflow-x-auto"
            aria-describedby="create-help"
          />
          <p id="create-help" className="text-xs text-slate-400">
            Must use 3-100 characters. Letters, numbers, hyphen, underscore.
          </p>
        </FormCard>

        <FormCard
          title="Check customer ID"
          description="Look up if customer ID already exists in DB."
          onSubmit={handleCheck}
          actionLabel="Check ID"
          isLoading={isCheckLoading}
        >
          <label htmlFor="check-id" className="block text-sm font-medium text-slate-200">
            Customer ID
          </label>
          <input
            id="check-id"
            type="text"
            value={checkId}
            onChange={(event) => setCheckId(event.target.value)}
            placeholder="e.g. TEST123"
            disabled={isCheckLoading}
            className="field overflow-x-auto"
            aria-describedby="check-help"
          />
          <p id="check-help" className="text-xs text-slate-400">
            Enter the ID you want to look up.
          </p>
        </FormCard>

        <FormCard
          title="Delete customer ID"
          description="Remove a customer ID if it is no longer needed."
          onSubmit={handleDelete}
          actionLabel="Delete ID"
          isLoading={isDeleteLoading}
        >
          <label htmlFor="delete-id" className="block text-sm font-medium text-slate-200">
            Customer ID
          </label>
          <input
            id="delete-id"
            type="text"
            value={deleteId}
            onChange={(event) => setDeleteId(event.target.value)}
            placeholder="e.g. TEST123"
            disabled={isDeleteLoading}
            className="field overflow-x-auto"
            aria-describedby="delete-help"
          />
          <p id="delete-help" className="text-xs text-slate-400">
            Deletes the ID permanently if it exists.
          </p>
        </FormCard>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-500">
        Copyright © 2025 Leon Rudnitsky. All rights reserved.
      </footer>
    </main>
  );
}
