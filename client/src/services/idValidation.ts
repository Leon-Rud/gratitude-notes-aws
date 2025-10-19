import { ID_PATTERN, STATUS_TITLES } from '../config/constants';
import { StatusState } from '../components/StatusBanner';

export function validateId(value: string): string | null {
  if (!value) {
    return 'ID is required.';
  }
  if (value.length < 3 || value.length > 100) {
    return 'ID must be between 3 and 100 characters.';
  }
  if (!ID_PATTERN.test(value)) {
    return 'Only letters, numbers, hyphen, and underscore are allowed.';
  }
  return null;
}

export function validateAndNormalize(rawId: string): { ok: true; id: string } | { ok: false; status: StatusState } {
  const trimmed = rawId.trim()
  const validationError = validateId(trimmed);
  if (validationError) {
    return {
      ok: false,
      status: {
        kind: 'warning',
        title: STATUS_TITLES.invalidId,
        message: validationError
      }
    };
  }
  return { ok: true, id: trimmed };
}
