import { formatNumber } from './utils';

export const defaultColDef = {
  resizable: true,
  sortable: true,
  flex: 1,
  filter: true,
}

export const columnDefsAccounts = [
  {
    field: 'id',
    headerName: 'ID',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    width: 100,
    maxWidth: 100,
  },
  {
    field: 'general_account_id',
    headerName: 'G_ID',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
    width: 100,
    maxWidth: 100,
  },
  {
    field: 'email',
    headerName: 'Email',
    filter: 'agTextColumnFilter',
    enableRowGroup: true,
    valueGetter: (params: any) => params.data.email,
    valueSetter: (params: any) => {
      const newVal = params.newValue;
      const valueChanged = params.data.email !== newVal;
      if (valueChanged) {
        params.data.email = newVal;
      }
      return valueChanged;
    },
  },
  {
    field: 'activity_status',
    headerName: 'Status',
    filter: 'agTextColumnFilter',
    enableRowGroup: true,
    valueGetter: (params: any) => params.data.activity_status,
    valueSetter: (params: any) => {
      const newVal = params.newValue;
      const valueChanged = params.data.activity_status !== newVal;
      if (valueChanged) {
        params.data.activity_status = newVal;
      }
      return valueChanged;
    },
    width: 90,
    maxWidth: 90,
  },
  {
    field: 'scheduler_account_info.block_reason',
    headerName: 'Reason',
    enableRowGroup: false,
    hide: true,
    width: 90,
    maxWidth: 450,
  },
  {
    field: 'scheduler_account_info.blocked_at',
    headerName: 'Blocked at',
    filter: 'agNumberColumnFilter',
    hide: true,
    enableRowGroup: true,
  },
  {
    field: 'scheduler_account_info.service_name',
    headerName: 'Service',
    enableRowGroup: false,
    editable: false,
    width: 90,
    maxWidth: 450,
  },
  {
    field: 'should_run',
    headerName: 'Should run',
    enableRowGroup: true,
    editable: false,
    cellRenderer: (params: any) => params.value.toString(),
    width: 90,
    maxWidth: 90,
    hide: true,
  },
  {
    headerName: 'Freezed',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
    valueGetter: (params: any) => params.data.available_balance,
    valueFormatter: (param: any) => formatNumber(param.data.freezed_balance),
    width: 110,
    maxWidth: 110,
  },
  {
    headerName: 'Available',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
    valueGetter: (params: any) => params.data.available_balance,
    valueFormatter: (param: any) => formatNumber(param.data.available_balance),
    width: 110,
    maxWidth: 110,
  },
  {
    headerName: 'Total',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
    valueFormatter: (param: any) => formatNumber(param.data.freezed_balance + param.data.available_balance),
    hide: true,
    width: 100,
    maxWidth: 100,
  },
  {
    field: 'proxy.host',
    headerName: 'Proxy ip',
    filter: 'agTextColumnFilter',
    hide: true,
    enableRowGroup: true,
  },
  {
    field: 'proxy_id',
    headerName: 'Proxy id',
    filter: 'agNumberColumnFilter',
    hide: true,
    editable: false,
    enableRowGroup: true,
  },
  {
    field: 'proxy.port',
    headerName: 'Port',
    filter: 'agNumberColumnFilter',
    hide: true,
    enableRowGroup: false,
    width: 90,
    maxWidth: 90,
  },
  {
    field: 'strategy_name',
    headerName: 'Strategy',
    enableRowGroup: true,
    editable: false,
  },
  {
    field: 'origin',
    headerName: 'Origin',
    hide: false,
    enableRowGroup: true,
    editable: false,
  },
  {
    field: 'account_owner',
    headerName: 'Account Owner',
    hide: true,
    enableRowGroup: true,
    editable: false,
  },
  {
    field: 'group',
    headerName: 'Group',
    hide: true,
    enableRowGroup: true,
    editable: false,
  },
  {
    valueGetter: (params: any) => params.data.objectives_progress
      ? params.data.objectives_progress.list
      : 0,
    headerName: 'List',
    filter: 'agNumberColumnFilter',
    hide: true,
    enableRowGroup: true,
    width: 80,
    maxWidth: 80,
  },
  {
    valueGetter: (params: any) => params.data.objectives_progress
      ? params.data.objectives_progress.buy_now
      : 0,
    headerName: 'Buy now',
    filter: 'agNumberColumnFilter',
    hide: true,
    enableRowGroup: true,
    width: 110,
    maxWidth: 110,
  },
  {
    field: 'ban_analytics_info.ban_alalytics_config.id',
    headerName: 'Ban Config',
    hide: true,
    enableRowGroup: true,
  },
  {
    field: 'scheduler_account_info.scheduler_config.id',
    headerName: 'Scheduler Config',
    hide: true,
    enableRowGroup: true,
  },
  {
    field: 'workshift_id',
    headerName: 'Workshift',
    hide: true,
    enableRowGroup: true,
  },
  {
    field: 'requests',
    headerName: 'Requests',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
  },
  {
    field: 'minutes_active',
    headerName: 'Minutes',
    filter: 'agNumberColumnFilter',
    hide: true,
    enableRowGroup: true,
  },
  {
    field: 'sbc_submits',
    headerName: 'Sbc submits',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
  },
];


export const columnDefsWorkers = [
  {
    field: 'serviceName',
    headerName: 'Service',
    width: 300,
    maxWidth: 450,
  },
  {
    field: 'currentWorkersCount',
    headerName: 'Current workers',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
  },
  {
    field: 'maxWorkersCount',
    headerName: 'Max workers',
    filter: 'agNumberColumnFilter',
    enableRowGroup: true,
  }
]