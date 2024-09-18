import { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import ChangeConfigModal from './modals/ChangeConfig';
import apiService, { Account, AccountImportInput, AccountToDisplay, } from '../services/ApiService';
import { apiServiceCustomResolvers } from '../services/ApiCustomResolvers';
import { columnDefsAccounts, defaultColDef } from '../utils/columnDefs';
import { balanceStringToNumber, formatNumber, getLastTimeForRequests, getAccountsWithRunStats, getAccGroup } from '../utils/utils';
import { GridApi } from 'ag-grid-community';
import { accounts_insert_input, accounts_updates } from '../../generated/trade';

const Table = () => {
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isConfigModalOpened, setIsConfigModalOpened] = useState(false);

  const [totalBalance, setTotalBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  const [strategyToSet, setStrategyToSet] = useState('');
  const [targetConfig, setTargetConfig] = useState(0);
  const [serviceName, setServiceName] = useState('');
  const [serviceNames, setServiceNames] = useState([] as string[]);

  const [secondsBetweenAccsStart, setSecondsBetweenAccsStart] = useState(Number(localStorage.getItem('secondsBetweenAccsStart')) || 6);
  const [maxAccsToStart, setMaxAccsToStart] = useState(Number(localStorage.getItem('maxAccsToStart')) || 120);

  const [rowData, setRowData] = useState([] as AccountToDisplay[]);
  const [selectedRows, setSelectedRows] = useState([] as AccountToDisplay[]);
  const [isAnyRowSelected, setIsAnyRowSelected] = useState(false);

  const gridRef = useRef({} as GridApi<AccountToDisplay>)

  // @todo: useRef for api clients?

  useEffect(() => {
    // @todo: move to router
    (async function () {
      const adminSecret = localStorage.getItem('adminSecret');
      if (!adminSecret) {
        window.location.href = '/';
      }

      const activeServices = await apiService.getActiveServices();
      setServiceNames(activeServices.map((s) => s.service_name));

      await fetchAccounts()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAccounts = async () => {
    //  @todo remove????
    // await apiService.refresh();
    const accounts = await apiService.getFullAccounts();

    const historyItems = await apiService.getHistoryItemsByTime(
      new Date(getLastTimeForRequests()),
      new Date(Date.now()),
      accounts.map((acc) => acc.id)
    );

    const accountsWithRequests = getAccountsWithRunStats(accounts, historyItems);
    console.log(accountsWithRequests);
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
              // @todo: tbd use correct
              config_id: 1,
            }
          },
          ban_analytics_info: {
            data: {
              // @todo: tbd use correct
              ban_analytics_config_id: 1
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

    // @todo: chunk?
    await apiService.createAccounts(insertData);
    await apiService.updateAccountsBatch(updateData)
  }

  const onSelectionChanged = async () => {
    const selectedRows = gridRef.current.getSelectedRows();
    setSelectedRows(selectedRows);
    setIsAnyRowSelected(selectedRows.length > 0)
  }

  const handleCloseAndDelete = async () => {
    await apiService.deleteAccounts(selectedRows);
    setIsModalOpened(false)
  };

  return (
    <div>
      <div className="buttons">
        <Row style={{ width: '100%' }}>
          <Col xs={5}>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => setIsModalOpened(true)}
              variant="danger"
            >
              Delete
            </Button>
            <Button
              className="addButton"
              onClick={() => fetchAccounts()}
              variant="primary"
            >
              Refresh
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => apiServiceCustomResolvers.startAccounts(selectedRows, 'START')}
              variant="warning"
            >
              Universal start
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => apiServiceCustomResolvers.stopAccounts(selectedRows)}
              variant="warning"
            >
              Stop
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => apiServiceCustomResolvers.blockAccounts(selectedRows)}
              variant="warning"
            >
              Block
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => apiServiceCustomResolvers.resetAccounts(selectedRows)}
              variant="warning"
            >
              Reset
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => apiServiceCustomResolvers.startAccounts(selectedRows, 'KICKSTART')}
              variant="warning"
            >
              Kickstart accounts
            </Button>
            <Button
              className="addButton"
              onClick={() => setIsConfigModalOpened(true)}
              variant="warning"
            >
              Change config
            </Button>
          </Col>
          <Col xs={1}>
            <input
              className="input"
              type="number"
              placeholder="Seconds before accs start"
              value={secondsBetweenAccsStart}
              onChange={(event) => setSecondsBetweenAccsStart(Number(event.target.value))}
            />
          </Col>
          <Col xs={2}>
            <input
              className="input"
              type="number"
              placeholder="Accounts to start in one step"
              value={maxAccsToStart}
              onChange={(event) => setMaxAccsToStart(Number(event.target.value))}
            />
          </Col>
          <Col xs={2}>
            <div>
              <b>Selected:</b> {selectedRows.length}
            </div>
            <div>
              <b>Available balance:</b>{' '}
              {formatNumber(availableBalance)}
            </div>
            <div>
              <b>Total balance:</b>{' '}
              {formatNumber(totalBalance)}
            </div>
          </Col>
          <Col xs={1}>
            <Dialog
              open={isModalOpened}
              onClose={() => setIsModalOpened(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {'Are you sure you want to delete these accounts?'}
              </DialogTitle>
              <DialogActions>
                <Button variant="primary" onClick={() => setIsModalOpened(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => handleCloseAndDelete()}>
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
            <input type="file" onChange={importAccountsFromCSV} />
          </Col>
        </Row>
        <Row style={{ width: '100%' }}>
          <Col xs="2">
            <input
              className="input"
              type="text"
              placeholder="strategy"
              value={strategyToSet}
              onChange={(event) => setStrategyToSet(event.target.value)}
            />
            <ButtonGroup aria-label="Basic example">
              <Button onClick={() => apiService.updateAccounts(selectedRows, { strategy_name: strategyToSet })}>
                Set strategy
              </Button>
            </ButtonGroup>
          </Col>
          <Col xs="3">
            <input
              className="input"
              type="number"
              placeholder="ban config"
              value={targetConfig}
              onChange={(event) => setTargetConfig(Number(event.target.value))}
            />
            <ButtonGroup aria-label="Basic example">
              <Button onClick={() => apiService.updateAccountBansConfig(selectedRows, targetConfig)}>
                Set ban config
              </Button>
              <Button onClick={() => apiService.updateAccountSchedulerInfo(selectedRows, { config_id: targetConfig })}>
                Set scheduler config
              </Button>
            </ButtonGroup>
          </Col>
          <Col xs="2">
            <Form.Select onChange={(event) => setServiceName(event.target.value)}>
              {
                serviceNames.map((name) => <option value={name}>{name}</option>)
              }
            </Form.Select>
            <ButtonGroup aria-label="Basic example">
              <Button onClick={() => apiService.updateAccountSchedulerInfo(selectedRows, { service_name: serviceName })}>
                Update service name
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
      <ChangeConfigModal
        show={isConfigModalOpened}
        onHide={() => setIsConfigModalOpened(false)}
        accounts={selectedRows}
      />
      <div className="ag-theme-alpine" style={{ height: 780, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          // ref={gridRef}
          // immutableData={true}
          getRowId={(params) => params.data.id.toString()}
          columnDefs={columnDefsAccounts}
          defaultColDef={defaultColDef}
          rowGroupPanelShow={'always'}
          pivotPanelShow={'always'}
          suppressAggFuncInHeader={true}
          // autoGroupColumnDef={autoGroupColumnDef}
          onGridReady={(value) => { gridRef.current = value.api; }}
          rowSelection={'multiple'}
          // @todo?
          // onCellValueChanged={(event) => apiService.updateAccount(event.data.id, event.data)}
          onSelectionChanged={onSelectionChanged}
          animateRows={true}
          onFilterChanged={() => updateTotalBalanceInfo()}
          enableRangeSelection={true}
          sideBar={'columns'}
        ></AgGridReact>
      </div>
    </div>
  );
}


export default Table;
