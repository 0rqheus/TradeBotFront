const LOCALE_VALUE = "en";

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
  // {
  //   field: 'activityStatusDescription',
  //   headerName: 'Status description',
  //   editable: true,
  //   enableRowGroup: true,
  //   valueGetter: (params) => {
  //     return params.data.activityStatusDescription;
  //   },
  //   valueSetter: (params) => {
  //     var newVal = params.newValue;
  //     var valueChanged = params.data.activityStatusDescription !== newVal;
  //     if (valueChanged) {
  //       params.data.activityStatusDescription = newVal;
  //     }
  //     return valueChanged;
  //   },
  // },
  // {
  //   field: 'backups',
  //   headerName: 'Backups',
  //   editable: true,
  //   enableRowGroup: true,
  //   valueGetter: (params) => {
  //     return params.data.backups;
  //   },
  //   valueSetter: (params) => {
  //     var newVal = params.newValue;
  //     var valueChanged = params.data.backups !== newVal;
  //     if (valueChanged) {
  //       params.data.backups = newVal;
  //     }
  //     return valueChanged;
  //   },
  // },
  // {
  //   field: 'currentTask',
  //   headerName: 'Task',
  //   editable: true,
  //   enableRowGroup: true,
  //   valueGetter: (params) => {
  //     return params.data.currentTask;
  //   },
  //   valueSetter: (params) => {
  //     var newVal = params.newValue;
  //     var valueChanged = params.data.currentTask !== newVal;
  //     if (valueChanged) {
  //       params.data.currentTask = newVal;
  //     }
  //     return valueChanged;
  //   },
  // },
  // {
  //   field: 'gAuthSecret',
  //   headerName: 'GAUTH',
  //   editable: true,
  //   enableRowGroup: true,
  //   valueGetter: (params) => {
  //     return params.data.gAuthSecret;
  //   },
  //   valueSetter: (params) => {
  //     var newVal = params.newValue;
  //     var valueChanged = params.data.gAuthSecret !== newVal;
  //     if (valueChanged) {
  //       params.data.gAuthSecret = newVal;
  //     }
  //     return valueChanged;
  //   },
  // },
  // {
  //   field: 'notes',
  //   headerName: 'Notes',
  //   editable: true,
  //   enableRowGroup: true,
  //   valueGetter: (params) => {
  //     return params.data.notes;
  //   },
  //   valueSetter: (params) => {
  //     var newVal = params.newValue;
  //     var valueChanged = params.data.notes !== newVal;
  //     if (valueChanged) {
  //       params.data.notes = newVal;
  //     }
  //     return valueChanged;
  //   },
  // },
  // {
  //   field: 'password',
  //   headerName: 'Password',
  //   editable: true,
  //   enableRowGroup: true,
  //   valueGetter: (params) => {
  //     return params.data.password;
  //   },
  //   valueSetter: (params) => {
  //     var newVal = params.newValue;
  //     var valueChanged = params.data.password !== newVal;
  //     if (valueChanged) {
  //       params.data.password = newVal;
  //     }
  //     return valueChanged;
  //   },
  // },
  // {
  //   field: 'platform',
  //   headerName: 'Platform',
  //   editable: true,
  //   enableRowGroup: true,
  // },
  // {
  //   field: 'profileId',
  //   headerName: 'Profile ID',
  //   editable: true,
  //   enableRowGroup: true,
  //   valueGetter: (params) => {
  //     return params.data.profileId;
  //   },
  //   valueSetter: (params) => {
  //     var newVal = params.newValue;
  //     var valueChanged = params.data.profileId !== newVal;
  //     if (valueChanged) {
  //       params.data.profileId = newVal;
  //     }
  //     return valueChanged;
  //   },
  // },
  // {
  //   field: 'scheduler_config',
  //   headerName: 'Config',
  //   editable: true,
  //   enableRowGroup: true,
  // },
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
    valueFormatter: (param) => param.data.freezed_balance.toLocaleString(LOCALE_VALUE),
  },
  {
    field: 'available_balance',
    headerName: 'Available Balance',
    filter: 'agNumberColumnFilter',
    editable: true,
    enableRowGroup: true,
    valueFormatter: (param) => param.data.available_balance.toLocaleString(LOCALE_VALUE),
  },
  {
    headerName: 'Total balance',
    valueGetter: function sumField(params) {
      return params.data.freezed_balance + params.data.available_balance
    },
    filter: 'agNumberColumnFilter',
    editable: true,
    enableRowGroup: true,
    valueFormatter: (param) => (param.data.freezed_balance + param.data.available_balance).toLocaleString(LOCALE_VALUE),
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
  }
];

export default columnDefsAccounts;
