import { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import createApiService, { Account, ApiService, } from '../services/ApiService';
import { columnDefsAccounts, defaultColDef } from '../utils/columnDefs';
import { formatNumber, getLastTimeForRequests, getAccountsWithRunStats } from '../utils/utils';
import { GridApi } from 'ag-grid-community';
import { Box, Stack, Typography } from '@mui/material';
import ConfirmationModal from './modals/ConfirmationModal';
import AccountsActivityActions from './partials/AccountsActivityActions';
import { useAuth } from '../AuthProvider';
import AdditionalSettingsModal from './modals/AdditionalSettingsModal';
import ChangeConfigModal from './modals/ChangeConfig';

const Table = () => {
  const auth = useAuth();

  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [isSettingsModalOpened, setIsSettingsModalOpened] = useState(false);
  const [isConfigModalOpened, setIsConfigModalOpened] = useState(false);

  const [rowData, setRowData] = useState<Account[]>([]);
  const [selectedRows, setSelectedRows] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  const gridRef = useRef({} as GridApi<Account>)
  const apiServiceRef = useRef({} as ApiService)

  useEffect(() => {
    (async function () {
      apiServiceRef.current = createApiService(auth.user?.token!)
      await fetchAccounts()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAccounts = async () => {
    const accounts = await apiServiceRef.current.getFullAccounts();
    const historyItems = await apiServiceRef.current.getHistoryItemsByTime(
      new Date(getLastTimeForRequests()),
      new Date(Date.now()),
      accounts.map((acc) => acc.id)
    );
    const accountsWithRequests = getAccountsWithRunStats(accounts, historyItems);
    console.log('accounts', accountsWithRequests.length);
    
    setRowData(accountsWithRequests);
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

  const onCellDataUpdated = async (acc: Account) => {
    await apiServiceRef.current.updateAccount(acc.id, acc)
  }

  const handleAccountDelete = async () => {
    const deleted = await apiServiceRef.current.deleteAccounts(selectedRows);
    console.log('deleted count', deleted)

    setIsDeleteModalOpened(false)

    const idsToDelete = selectedRows.map((r) => r.id);
    setRowData(rowData.filter((row) => !idsToDelete.includes(row.id)))
  };

  return (
    <>
      <Stack className='header' direction="row" spacing={'auto'} height={'8vh'} >
        <AccountsActivityActions
          accounts={selectedRows}
          fetchAccounts={fetchAccounts}
          openConfig={() => setIsConfigModalOpened(true)}
          openSettings={() => setIsSettingsModalOpened(true)}
          openDeleteConfirmation={() => setIsDeleteModalOpened(true)}
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

      <AdditionalSettingsModal
        open={isSettingsModalOpened}
        handleClose={() => setIsSettingsModalOpened(false)}
        apiService={apiServiceRef.current}
        selectedRows={selectedRows}
      />

      <ChangeConfigModal
        open={isConfigModalOpened}
        handleClose={() => setIsConfigModalOpened(false)}
        selectedRows={selectedRows}
      />

      <div className="ag-theme-alpine" style={{ height: '92vh', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          getRowId={(params) => params.data.id.toString()}
          columnDefs={columnDefsAccounts}
          defaultColDef={defaultColDef}
          rowGroupPanelShow={'always'}
          pivotPanelShow={'always'}
          suppressAggFuncInHeader={true}
          onGridReady={(value) => { gridRef.current = value.api; }}
          rowSelection={'multiple'}
          onCellValueChanged={(event) => onCellDataUpdated(event.data)}
          onSelectionChanged={onSelectionChanged}
          animateRows={true}
          onFilterChanged={() => { updateTotalBalanceInfo() }}
          enableRangeSelection={true}
          sideBar={{ toolPanels: ['columns'] }}
        >
        </AgGridReact>
      </div>
    </>
  );
}


export default Table;
