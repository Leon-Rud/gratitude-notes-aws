import { Dispatch, FormEvent } from 'react';
import { StatusState } from '../components/StatusBanner';
import { STATUS_TITLES } from '../config/constants';
import { callApi, ApiResponse } from './apiClient';
import { validateAndNormalize } from './idValidation';
import { CheckResponse, CreateResponse, DeleteResponse } from './types';

export type CustomerAction = 'create' | 'check' | 'delete';

type ActionConfig = {
  method: 'PUT' | 'GET' | 'DELETE';
  path: (id: string) => string;
  body?: (id: string) => Record<string, unknown>;
  allowedStatuses?: number[];
  onSuccess: (id: string, response: ApiResponse<any>) => StatusState;
  errorTitle: string;
  clearOnSuccess: boolean;
};

type SubmitHandlerConfig = {
  action: CustomerAction;
  getValue: () => string;
  setValue: (value: string) => void;
  setLoading: (value: boolean) => void;
  setStatus: Dispatch<StatusState | null>;
};

type ActionResult = {
  status: StatusState;
  clearInput: boolean;
};

const ACTION_CONFIG: Record<CustomerAction, ActionConfig> = {
  create: {
    method: 'PUT',
    path: () => '/customer-ids',
    body: (id) => ({ id }),
    onSuccess: (id, response: ApiResponse<CreateResponse>) => ({
      kind: 'success',
      title: STATUS_TITLES.createSuccess,
      message: `Saved ID: ${response.data.id ?? id}.`
    }),
    errorTitle: STATUS_TITLES.createError,
    clearOnSuccess: true
  },
  check: {
    method: 'GET',
    path: (id) => `/customer-ids/${id}`,
    allowedStatuses: [404],
    onSuccess: (id, response: ApiResponse<CheckResponse>) => {
      const { status, data } = response;
      if (status === 404 || !data.exists) {
        return {
          kind: 'info',
          title: STATUS_TITLES.checkMissing,
          message: `No record for ${id}.`
        };
      }
      return {
        kind: 'success',
        title: STATUS_TITLES.checkFound,
        message: `Customer ID ${data.id} exists.`
      };
    },
    errorTitle: STATUS_TITLES.checkError,
    clearOnSuccess: false
  },
  delete: {
    method: 'DELETE',
    path: (id) => `/customer-ids/${id}`,
    onSuccess: (id, response: ApiResponse<DeleteResponse>) => ({
      kind: 'success',
      title: STATUS_TITLES.deleteSuccess,
      message: response.data.message ?? `Removed customer ID ${id}.`
    }),
    errorTitle: STATUS_TITLES.deleteError,
    clearOnSuccess: true
  }
};

async function executeAction(action: CustomerAction, id: string): Promise<ActionResult> {
  const config = ACTION_CONFIG[action];
  try {
    const response = await callApi(config.path(id), config.method, {
      body: config.body?.(id),
      allowedStatuses: config.allowedStatuses
    });
    return {
      status: config.onSuccess(id, response),
      clearInput: config.clearOnSuccess
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: {
        kind: 'error',
        title: config.errorTitle,
        message
      },
      clearInput: false
    };
  }
}

export function createSubmitHandler(config: SubmitHandlerConfig) {
  return async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rawValue = config.getValue();
    const validation = validateAndNormalize(rawValue);
    if (!validation.ok) {
      config.setStatus(validation.status);
      return;
    }

    config.setLoading(true);
    try {
      const result = await executeAction(config.action, validation.id);
      config.setStatus(result.status);
      if (result.clearInput) {
        config.setValue('');
      }
    } finally {
      config.setLoading(false);
    }
  };
}
