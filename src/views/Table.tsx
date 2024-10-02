import { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Form from 'react-bootstrap/Form';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import ChangeConfigModal from './modals/ChangeConfig';
import apiService, { Account, AccountImportInput, AccountToDisplay, } from '../services/ApiService';
import { columnDefsAccounts, defaultColDef } from '../utils/columnDefs';
import { balanceStringToNumber, formatNumber, getLastTimeForRequests, getAccountsWithRunStats, getAccGroup, chunkArray } from '../utils/utils';
import { GridApi } from 'ag-grid-community';
import { accounts_insert_input, accounts_updates } from '../generated/trade';
import { Box, Button, Modal, Stack, Typography } from '@mui/material';
import { VisuallyHiddenInput } from './partials/HiddenInput';
import ConfirmationModal from './modals/ConfirmationModal';
import AccountsActivityActions from './partials/AccountsActivityActions';

const Table = () => {
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isMoreModalOpened, setIsMoreModalOpened] = useState(false);
  const [isConfigModalOpened, setIsConfigModalOpened] = useState(false);

  const [totalBalance, setTotalBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  const [strategyToSet, setStrategyToSet] = useState('');
  const [targetConfig, setTargetConfig] = useState(0);
  const [serviceName, setServiceName] = useState('');
  const [serviceNames, setServiceNames] = useState<string[]>([]);

  const [secondsBetweenAccsStart, setSecondsBetweenAccsStart] = useState(Number(localStorage.getItem('secondsBetweenAccsStart')) || 6);
  const [maxAccsToStart, setMaxAccsToStart] = useState(Number(localStorage.getItem('maxAccsToStart')) || 120);

  const [rowData, setRowData] = useState<AccountToDisplay[]>([]);
  const [selectedRows, setSelectedRows] = useState<AccountToDisplay[]>([]);
  const [isAnyRowSelected, setIsAnyRowSelected] = useState(false);

  const gridRef = useRef({} as GridApi<AccountToDisplay>)

  // @todo: useRef for api clients?

  useEffect(() => {
    (async function () {
      const activeServices = await apiService.getActiveServices();
      setServiceNames(activeServices.map((s) => s.service_name));

      await fetchAccounts()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAccounts = async () => {
    const accounts = await apiService.getFullAccounts();

    const historyItems = await apiService.getHistoryItemsByTime(
      new Date(getLastTimeForRequests()),
      new Date(Date.now()),
      accounts.map((acc) => acc.id)
    );

    const accountsWithRequests = getAccountsWithRunStats(accounts, historyItems);
    // console.log(accountsWithRequests);
    setRowData(accountsWithRequests.map((d: Account): AccountToDisplay => ({
      ...d,
      freezed_balance: formatNumber(d.freezed_balance),
      available_balance: formatNumber(d.available_balance)
    })));
    updateTotalBalanceInfo();
  }

  const updateTotalBalanceInfo = () => {
    const totalFreezedBalance = selectedRows.reduce(
      (total, acc) => total + balanceStringToNumber(acc.freezed_balance.toString()),
      0);

    const totalAvailableBalance = selectedRows.reduce(
      (total, acc) => total + balanceStringToNumber(acc.available_balance.toString()),
      0);
    setAvailableBalance(totalAvailableBalance);

    setTotalBalance(totalFreezedBalance + totalAvailableBalance);
  };

  const importAccountsFromCSV = async (event: any) => {
    const csv = event.target.files[0];
    const accsToCreate: AccountImportInput[] = [];

    const reader = new FileReader();
    reader.readAsText(csv);
    reader.onload = async (e) => {
      const data = e.target!.result! as string;
      const rows = data.split('\n');
      for (let i = 1; i < rows.length; i++) {
        const rowValues = rows[i].split(',');
        const newObject = {
          accountOwner: rowValues[0], // use username?
          origin: rowValues[1],
          email: rowValues[2].toLowerCase(),
          password: rowValues[3],
          gauth: rowValues[4],
          proxyIp: rowValues[5],
          proxyPort: rowValues[6],
          proxyLogin: rowValues[7],
          proxyPass: rowValues[8],
        };
        accsToCreate.push(newObject);
      }
    };

    await createOrUpdateAccs(accsToCreate);

    await fetchAccounts();
  }

  const createOrUpdateAccs = async (accs: AccountImportInput[]) => {
    const existingAccs = await apiService.getAccountsByEmails(accs.map((acc) => acc.email))
    const existingEmails = new Set(existingAccs.map((acc) => acc.email))

    const allProxies = await apiService.getProxiesByHosts(accs.map((acc) => acc.proxyIp));

    const insertData: accounts_insert_input[] = [];
    const updateData: accounts_updates[] = [];

    for (const acc of accs) {
      if (!existingEmails.has(acc.email)) {
        const newAcc: accounts_insert_input = {
          email: acc.email,
          password: acc.password,
          gauth: acc.gauth,
          group: getAccGroup(acc.proxyIp, acc.proxyPort),
          origin: acc.origin,
          general_account: {
            data: {
              email: acc.email
            }
          },
          scheduler_account_info: {
            data: {
              config_id: 24,
            }
          },
          ban_analytics_info: {
            data: {
              ban_analytics_config_id: 9
            }
          },
          // @todo: tbd get account_owner from precreated?
          account_owner: acc.accountOwner,
        };

        const proxy = allProxies.find((p) => p.host === acc.proxyIp && p.port === acc.proxyPort);
        if (proxy) {
          newAcc.proxy_id = proxy.id;
        } else {
          newAcc.proxy = {
            data: {
              host: acc.proxyIp,
              port: acc.proxyPort,
              username: acc.proxyLogin,
              password: acc.proxyPass,
            }
          };
        }

        insertData.push(newAcc);
      } else {

        const proxy = allProxies.find((p) => p.host === acc.proxyIp && p.port === acc.proxyPort);
        const proxyId = proxy?.id ?? await apiService.createNewProxy({
          host: acc.proxyIp,
          port: acc.proxyPort,
          username: acc.proxyLogin,
          password: acc.proxyPass,
        });
        if (!proxyId) {
          throw new Error('Cannot create proxy');
        }

        const updatedAcc: accounts_updates = {
          where: {
            email: { _eq: acc.email }
          },
          _set: {
            password: acc.password,
            gauth: acc.gauth,
            group: getAccGroup(acc.proxyIp, acc.proxyPort),
            origin: acc.origin,
            proxy_id: proxyId
          }
        }

        updateData.push(updatedAcc);
      }
    }

    // @todo progressbar?
    const insertChunks = chunkArray(insertData, 100);
    for (const chunk of insertChunks) {
      await apiService.createAccounts(chunk);
    }

    const updateChunks = chunkArray(updateData, 100);
    for (const chunk of updateChunks) {
      await apiService.updateAccountsBatch(chunk)
    }
  }

  const onSelectionChanged = async () => {
    const selectedRows = gridRef.current.getSelectedRows();
    setSelectedRows(selectedRows);
    setIsAnyRowSelected(selectedRows.length > 0)
  }

  const onCellDataUpdated = async (acc: AccountToDisplay) => {
    await apiService.updateAccount(acc.id, acc)
  }

  const handleAccountDelete = async () => {
    const deleted = await apiService.deleteAccounts(selectedRows);
    console.log('deleted count', deleted)

    setIsModalOpened(false)

    const idsToDelete = selectedRows.map((r) => r.id);
    setRowData(rowData.filter((row) => !idsToDelete.includes(row.id)))
  };

  return (
    <div>
      <Stack direction="row" spacing={'auto'} className="buttons">
        <Stack direction="row" height={50} spacing={2} width={100}>
          <Button
            variant='contained'
            size="medium"
            onClick={() => fetchAccounts()}
          >
            Refresh
          </Button>

          <Button
            variant='contained'
            size="medium"
            disabled={!isAnyRowSelected}
            onClick={() => setIsModalOpened(true)}
          >
            Delete
          </Button>

          <Button
            component="label"
            size="medium"
            role={undefined}
            variant="contained"
            tabIndex={-1}
          // startIcon={<CloudUploadIcon />}
          >
            Upload
            <VisuallyHiddenInput
              type="file"
              onChange={importAccountsFromCSV}
              multiple
            />
          </Button>
        </Stack>

        <Box width={350} paddingTop={1}>
          <AccountsActivityActions
            disabled={!isAnyRowSelected}
            accounts={selectedRows}
            chunkSizeToStart={maxAccsToStart}
            secondsBetweenStart={secondsBetweenAccsStart}
          />
        </Box>

        <ConfirmationModal
          text='Are you sure you want to delete these accounts?'
          open={isModalOpened}
          handleSubmit={() => handleAccountDelete()}
          handleClose={() => setIsModalOpened(false)}
        />

        <Button color='info' size="medium" variant="contained" onClick={() => setIsMoreModalOpened(true)}>
          More
        </Button>

        <div>
          <b>Selected:</b> {selectedRows.length}
        </div>
        <div>
          <div>
            <b>Available balance:</b>{' '}
            {formatNumber(availableBalance)}
          </div>
          <div>
            <b>Total balance:</b>{' '}
            {formatNumber(totalBalance)}
          </div>
        </div>
      </Stack>

      <ChangeConfigModal
        show={isConfigModalOpened}
        onHide={() => setIsConfigModalOpened(false)}
        accounts={selectedRows}
      />

      <Modal
        open={isMoreModalOpened}
        onClose={() => setIsMoreModalOpened(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Additional settings
          </Typography>
          <Stack id="modal-modal-description">
            <Stack direction={'row'}>
              <input
                className="input"
                type="number"
                placeholder="Seconds before accs start"
                value={secondsBetweenAccsStart}
                onChange={(event) => setSecondsBetweenAccsStart(Number(event.target.value))}
              />
              <input
                className="input"
                type="number"
                placeholder="Accounts to start in one step"
                value={maxAccsToStart}
                onChange={(event) => setMaxAccsToStart(Number(event.target.value))}
              />
            </Stack>
            <Stack>
              <input
                className="input"
                type="text"
                placeholder="strategy"
                value={strategyToSet}
                onChange={(event) => setStrategyToSet(event.target.value)}
              />
              <Button onClick={() => apiService.updateAccounts(selectedRows, { strategy_name: strategyToSet })}>
                Set strategy
              </Button>
            </Stack>

            <input
              className="input"
              type="number"
              placeholder="ban config"
              value={targetConfig}
              onChange={(event) => setTargetConfig(Number(event.target.value))}
            />
            <Stack direction={'row'}>
              <Button onClick={() => apiService.updateAccountBansConfig(selectedRows, targetConfig)}>
                Set ban config
              </Button>
              <Button onClick={() => apiService.updateAccountSchedulerInfo(selectedRows, { config_id: targetConfig })}>
                Set scheduler config
              </Button>
            </Stack>

            <Form.Select onChange={(event) => setServiceName(event.target.value)}>
              {
                serviceNames.map((name) => <option value={name}>{name}</option>)
              }
            </Form.Select>
            <Button onClick={() => apiService.updateAccountSchedulerInfo(selectedRows, { service_name: serviceName })}>
              Update service name
            </Button>

            <Button color='warning' variant="contained">
              Change config
            </Button>
          </Stack>
        </Box>
      </Modal>

      <div className="ag-theme-alpine" style={{ height: 780, width: '100%' }}>
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
          onFilterChanged={() => updateTotalBalanceInfo()}
          enableRangeSelection={true}
          sideBar={{ toolPanels: ['columns'] }}
        ></AgGridReact>
      </div>
    </div>
  );
}


export default Table;
