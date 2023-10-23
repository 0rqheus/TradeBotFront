const LOCALE_VALUE = 'en';

const columnDefsAccounts = [
  {
    field: 'id',
    headerName: 'ID',
    editable: true,
    enableRowGroup: true,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
  },
  {
    field: 'email',
    headerName: 'Email',
    filter: 'agTextColumnFilter',
    editable: true,
    enableRowGroup: true,
    valueGetter: (params) => {
      return params.data.email;
    },
    valueSetter: (params) => {
      var newVal = params.newValue;
      var valueChanged = params.data.email !== newVal;
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
    editable: true,
    enableRowGroup: true,
    valueGetter: (params) => {
      return params.data.activity_status;
    },
    valueSetter: (params) => {
      var newVal = params.newValue;
      var valueChanged = params.data.activity_status !== newVal;
      if (valueChanged) {
        params.data.activity_status = newVal;
      }
      return valueChanged;
    },
  },
  {
    field: 'should_run',
    headerName: 'Should run',
    editable: true,
    enableRowGroup: true,
    cellRenderer: (params) => {
      return params.value.toString();
    },
  },
  {
    field: 'freezed_balance',
    headerName: 'Freezed Balance',
    filter: 'agNumberColumnFilter',
    editable: true,
    enableRowGroup: true,
    valueFormatter: (param) =>
      param.data.freezed_balance.toLocaleString(LOCALE_VALUE),
  },
  {
    field: 'available_balance',
    headerName: 'Available Balance',
    filter: 'agNumberColumnFilter',
    editable: true,
    enableRowGroup: true,
    valueFormatter: (param) =>
      param.data.available_balance.toLocaleString(LOCALE_VALUE),
  },
  {
    headerName: 'Total balance',
    valueGetter: function sumField(params) {
      return params.data.freezed_balance + params.data.available_balance;
    },
    filter: 'agNumberColumnFilter',
    editable: true,
    enableRowGroup: true,
    valueFormatter: (param) =>
      (
        param.data.freezed_balance + param.data.available_balance
      ).toLocaleString(LOCALE_VALUE),
  },
  {
    field: 'proxy.host',
    headerName: 'Proxy ip',
    filter: 'agTextColumnFilter',
    editable: true,
    enableRowGroup: true,
  },
  {
    field: 'proxy.port',
    headerName: 'Proxy port',
    filter: 'agNumberColumnFilter',
    editable: true,
    enableRowGroup: false,
  },
  {
    field: 'strategy_name',
    headerName: 'Strategy',
    editable: true,
    enableRowGroup: true,
  },
  {
    field: 'group',
    headerName: 'Group',
    editable: true,
    enableRowGroup: true,
  },
  {
    valueGetter: function sumField(params) {
      return params.data.objectives_progress
        ? params.data.objectives_progress.list
        : 0;
    },
    headerName: 'Progress list',
    filter: 'agNumberColumnFilter',
    suppressToolPanel: true,
    editable: true,
    enableRowGroup: true,
  },
  {
    valueGetter: function sumField(params) {
      return params.data.objectives_progress
        ? params.data.objectives_progress.buy_now
        : 0;
    },
    headerName: 'Progress buy now',
    filter: 'agNumberColumnFilter',
    suppressToolPanel: true,
    editable: true,
    enableRowGroup: true,
  },
];

export default columnDefsAccounts;
