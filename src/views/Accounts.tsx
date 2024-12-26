import { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import createApiService, { Account, AggregatedHistory, ApiService, } from '../services/ApiService';
import { columnDefsAccountsAdmin, columnDefsAccountsDefault, defaultColDef } from '../utils/columnDefs';
import { formatNumber } from '../utils/utils';
import { GridApi } from 'ag-grid-community';
import { Box, Stack, Typography } from '@mui/material';
import ConfirmationModal from './modals/ConfirmationModal';
import AccountsActivityActions from './partials/AccountsActivityActions';
import { useAuth } from '../AuthProvider';
import AccountsEditModal from './modals/AccountsEditModalProps';
import UploadAccountsModal from './modals/UploadAccountsModal';
import { AlertData, CustomAlert } from './partials/CustomAlert';
import moment from 'moment';

type AccountExtended = Account & { history?: AggregatedHistory };

const HISTORY_OFFSET = moment.duration(24, 'hours').asMilliseconds();

const Accounts = () => {
  const auth = useAuth();

  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [isAccsEditModalOpened, setIsAccsEditModalOpened] = useState(false);
  const [isUploadModalOpened, setIsUploadModalOpened] = useState(false);

  const [rowData, setRowData] = useState<AccountExtended[]>([]);
  const [selectedRows, setSelectedRows] = useState<AccountExtended[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  const [alert, setAlert] = useState<AlertData>({ open: false });

  const [columnDefs, setColumnDefs] = useState<any[]>([]);

  const gridRef = useRef({} as GridApi<AccountExtended>)
  const apiServiceRef = useRef({} as ApiService)

  useEffect(() => {
    (async function () {
      apiServiceRef.current = createApiService(auth.user?.token!)

      if(auth.user?.role === 'sbc-admin') {
        setColumnDefs(columnDefsAccountsAdmin);
      } else {
        setColumnDefs(columnDefsAccountsDefault)
      }

      await fetchAccounts()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAccounts = async () => {
    if(auth.user?.role === 'sbc-admin') {
      const accounts = await apiServiceRef.current.getFullAccountsData();
      const historyItems = await apiServiceRef.current.getAllAggregatedHistory(HISTORY_OFFSET);
      const historyDict = new Map(historyItems.map((item) => [item.account_id, item]));
      
      const accountsWithHistory = accounts.map((acc) => ({ ...acc, history: historyDict.get(acc.id) }));
      setRowData(accountsWithHistory);
    } else {
      const accounts = await apiServiceRef.current.getDefaultAccountsData() as Account[];
      setRowData(accounts);
    }
    // console.log(accounts[0]);

    updateTotalBalanceInfo();
  }

  const updateTotalBalanceInfo = () => {
    const accs: Account[] = [];
    gridRef.current.forEachNodeAfterFilter((node) => {
      accs.push(node.data!);
    })

    const totalFreezedBalance = accs.reduce(
      (total, acc) => total + acc.freezed_balance,
      0);

    const totalAvailableBalance = accs.reduce(
      (total, acc) => total + acc.available_balance,
      0);
    setAvailableBalance(totalAvailableBalance);

    setTotalBalance(totalFreezedBalance + totalAvailableBalance);
  };

  const onSelectionChanged = async () => {
    const selectedRows = gridRef.current.getSelectedRows();
    setSelectedRows(selectedRows);
  }

  const handleAccountDelete = async () => {
    try {
      const deleted = await apiServiceRef.current.deleteAccounts(selectedRows);
      console.log('deleted count', deleted)

      setIsDeleteModalOpened(false)

      const idsToDelete = selectedRows.map((r) => r.id);
      setRowData(rowData.filter((row) => !idsToDelete.includes(row.id)))

      setAlert({ open: true, type: 'success', message: 'Success' })
    } catch (err: any) {
      setAlert({ open: true, type: 'error', message: err.toString() })
    }
  };

  return (
    <>
      <Stack direction="row" spacing={'auto'} height={'8vh'} >
        <AccountsActivityActions
          accounts={selectedRows}
          fetchAccounts={fetchAccounts}
          openAdvancedEditModal={() => setIsAccsEditModalOpened(true)}
          openDeleteConfirmation={() => setIsDeleteModalOpened(true)}
          openUploadModal={() => setIsUploadModalOpened(true)}
        />

        <Stack className='accounts-info' direction="row" spacing={6} px={2}>
          <Box >
            <Typography variant="body1">
              <b>Selected:</b> {selectedRows.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <b>Available balance:</b> {formatNumber(availableBalance)}
            </Typography>
            <Typography variant="body1">
              <b>Total balance:</b> {formatNumber(totalBalance)}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <ConfirmationModal
        text='Are you sure you want to delete these accounts?'
        open={isDeleteModalOpened}
        handleSubmit={() => handleAccountDelete()}
        handleClose={() => setIsDeleteModalOpened(false)}
      />

      <AccountsEditModal
        open={isAccsEditModalOpened}
        handleClose={() => setIsAccsEditModalOpened(false)}
        setAlertData={setAlert}
        apiService={apiServiceRef.current}
        selectedRows={selectedRows}
      />

      <UploadAccountsModal
        open={isUploadModalOpened}
        handleClose={() => setIsUploadModalOpened(false)}
        setAlertData={setAlert}
      />

      <div className="ag-theme-alpine" style={{ height: '92vh', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          getRowId={(params) => params.data.id.toString()}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={(value) => { gridRef.current = value.api; }}
          rowSelection={'multiple'}
          cellSelection={true}
          onSelectionChanged={onSelectionChanged}
          onFilterChanged={() => { updateTotalBalanceInfo() }}
          sideBar={{ toolPanels: ['columns'] }}
        >
        </AgGridReact>
      </div>

      <CustomAlert data={alert} onClose={() => setAlert({ open: false })} />
    </>
  );
}


export default Accounts;
