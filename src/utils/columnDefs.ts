import CustomArrayIntersectionFilter from '../views/partials/CustomFilter';
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
    width: 100,
    maxWidth: 100,
  },
  {
    field: 'email',
    headerName: 'Email',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'activity_status',
    headerName: 'Status',
    filter: 'agTextColumnFilter',
    width: 100,
    maxWidth: 100,
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
  },
  {
    field: 'scheduler_account_info.service_name',
    headerName: 'Service',
    enableRowGroup: false,
    hide: true,
    width: 90,
    maxWidth: 450,
  },
  {
    field: 'should_run',
    headerName: 'Should run',
    cellRenderer: (params: any) => params.value.toString(),
    width: 90,
    maxWidth: 90,
    hide: true,
  },
  {
    headerName: 'Freezed',
    filter: 'agNumberColumnFilter',
    valueGetter: (params: any) => params.data.available_balance,
    valueFormatter: (param: any) => formatNumber(param.data.freezed_balance),
    width: 120,
    maxWidth: 120,
  },
  {
    headerName: 'Available',
    filter: 'agNumberColumnFilter',
    valueGetter: (params: any) => params.data.available_balance,
    valueFormatter: (param: any) => formatNumber(param.data.available_balance),
    width: 120,
    maxWidth: 112,
  },
  {
    headerName: 'Total',
    filter: 'agNumberColumnFilter',
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
  },
  {
    field: 'proxy_id',
    headerName: 'Proxy id',
    filter: 'agNumberColumnFilter',
    hide: true,
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
    maxWidth: 200, 
  },
  {
    field: 'origin',
    headerName: 'Origin',
    hide: false,
    maxWidth: 200, 
  },
  {
    field: 'account_owner',
    headerName: 'Account Owner',
    hide: true,
  },
  {
    field: 'general_account.is_web_tm_opened',
    headerName: 'Has TM assess',
    hide: true,
  },
  {
    field: 'group',
    headerName: 'Group',
    hide: true,
  },
  {
    field: 'ban_analytics_info.ban_analytics_config_id',
    headerName: 'Ban Config',
    hide: true,
  },
  {
    field: 'scheduler_account_info.config_id',
    headerName: 'Scheduler Config',
    hide: true,
  },
  {
    field: 'workshift_id',
    headerName: 'Workshift',
    hide: true,
  },
  {
    field: 'requests',
    headerName: 'Requests',
    filter: 'agNumberColumnFilter',
  },
  {
    field: 'general_account.account_challenges_infos',
    headerName: 'Solved active sbcs',
    valueGetter: (params: any) => params.data.general_account.account_challenges_infos.map((x: any) => x.challenge_id),
    valueFormatter: (param: any) => param.data.general_account.account_challenges_infos.length,
    filter: CustomArrayIntersectionFilter,
  },
  {
    field: 'minutes_active',
    headerName: 'Minutes',
    filter: 'agNumberColumnFilter',
    hide: true,
  },
  {
    field: 'sbc_submits',
    headerName: 'Sbc submits',
    filter: 'agNumberColumnFilter',
    hide: true,
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
  },
  {
    field: 'maxWorkersCount',
    headerName: 'Max workers',
    filter: 'agNumberColumnFilter',
  }
]