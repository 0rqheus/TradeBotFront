import React, { useEffect, useState, useRef } from 'react';
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
import { apiService } from '../services/ApiService';
import { apiServiceCustomResolvers } from '../services/ApiCustomResolvers';
import createAccs from '../services/utils/checkNewAcc';
import { columnDefsAccounts, defaultColDef } from '../services/utils/columnDefs';
import { sleep, balanceStringToNumber, formatNumber, getLastTimeForRequests } from '../services/utils/utils';

const reader = new FileReader();

const Table = () => {
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isConfigModalOpened, setIsConfigModalOpened] = useState(false);

  const [totalBalance, setTotalBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  const [strategyToSet, setStrategyToSet] = useState('');
  const [targetConfig, setTargetConfig] = useState(0);
  const [serviceName, setServiceName] = useState('');
  const [serviceNames, setServiceNames] = useState([]);

  const [secondsBetweenAccsStart, setSecondsBetweenAccsStart] = useState(0);
  const [maxAccsToStart, setMaxAccsToStart] = useState(0);

  const [rowData, setRowData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAnyRowSelected, setIsAnyRowSelected] = useState(false);

  const gridRef = useRef({})

  useEffect(async () => {
    // @todo: move to router
    const adminSecret = localStorage.getItem('adminSecret');
    if (!adminSecret) {
      window.location.href = '/';
    }

    setSecondsBetweenAccsStart(localStorage.getItem('secondsBetweenAccsStart') || 6)
    setMaxAccsToStart(localStorage.getItem('maxAccsToStart') || 120);

    const activeServices = await apiService.getActiveServices();
    setServiceNames(activeServices.map((s) => s.service_name));

    const accounts = await apiService.getAccounts();
    const accountsWithRequests = await getAccountsWithRunStats(accounts);
    setRowData(accountsWithRequests.map((d) => ({
      ...d,
      freezed_balance: formatNumber(d.freezed_balance),
      available_balance: formatNumber(d.available_balance)
    })));

    await fetchTotalBalanceInfo();
  }, [])

  const deleteAccount = async () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const idsToDelete = selectedRows.map((acc) => acc.id);
    await apiService.deleteAccounts(idsToDelete);
  }

  const fetchAccounts = async () => {
    await apiService.refresh();
    const accounts = await apiService.getAccounts();

    const accountsWithRequests = await getAccountsWithRunStats(accounts);
    console.log(accountsWithRequests);
    setRowData(accountsWithRequests.map((d) => ({
      ...d,
      freezed_balance: formatNumber(d.freezed_balance),
      available_balance: formatNumber(d.available_balance)
    })));
    await fetchTotalBalanceInfo();
  }

  const sendRabbitCommand = async (id, email, status) => {
    const toSend = {
      id,
      email: email,
      type: status,
      rabbitUrl: localStorage.getItem('rabbitUrl'),
    };
    await apiServiceCustomResolvers.sendHttpCommand(toSend);
  }

  const startAccounts = async (type) => {
    // const selectedAccs = gridRef.current.api.getSelectedRows();
    const accsToStartByServer = selectedAccs
      .filter((acc) => acc.scheduler_account_info.service_name)
      .map((acc) => ({
        id: acc.id,
        email: acc.email,
        service_name: acc.scheduler_account_info.service_name
      }));

    await apiServiceCustomResolvers.startByServers({
      accounts: accsToStartByServer,
      type,
      secondsBetween: 12,
      maxAccsToStart: 93,
      rabbitUrl: localStorage.getItem('rabbitUrl'),
    });
  }

  const stopAccounts = async () => {
    // const selectedRows = gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      await sendRabbitCommand(row.id, row.email, 'STOP');
      await sleep(100);
    });
  }

  const blockAccounts = async () => {
    // const selectedRows = gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      await sendRabbitCommand(row.id, row.email, 'BLOCK');
    });
  }

  const resetAccounts = async () => {
    // const selectedRows = gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      await sendRabbitCommand(row.id, row.email, 'RESET');
    });
  }

  const updateStrategyName = async () => {
    // const selectedRows = gridRef.current.api.getSelectedRows();
    const accIds = selectedRows.map((row) => row.id);
    await apiService.setStrategyName(accIds, strategyToSet);
  }

  const updateBanConfig = async () => {
    // const selectedRows = gridRef.current.api.getSelectedRows();
    const accIds = selectedRows.map((row) => row.id);
    await apiService.setBanConfig(accIds, targetConfig);
  }

  const updateSchedulerConfig = async () => {
    // const selectedRows = gridRef.current.api.getSelectedRows();
    const accIds = selectedRows.map((row) => row.id);
    await apiService.setSchedulerConfig(accIds, targetConfig);
  }

  const onCellValueChanged = async (event) => {
    const dataToUpdate = { ...event.data };
    await apiService.updateAccount(dataToUpdate);
  }

  const onSelectionChanged = async () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    setSelectedRows(selectedRows);
    setIsAnyRowSelected(selectedRows.length > 0)
  }

  const handleCloseAndDelete = async () => {
    await deleteAccount();
    setIsModalOpened(false)
  };

  const changeSecondsBetweenAccsStart = async (seconds) => {
    setSecondsBetweenAccsStart(seconds);
    localStorage.setItem('secondsBetweenAccsStart', seconds);
  };

  const changeMaxAccsToStart = async (count) => {
    setMaxAccsToStart(count)
    localStorage.setItem('maxAccsToStart', count);
  };

  const updateServiceName = async () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    const accIds = selectedRows.map((row) => row.id);
    await apiService.setServiceName(accIds, serviceName);
  }

  const fetchTotalBalanceInfo = async () => {
    const filteredAccs = [];
    gridRef.current.api.forEachNodeAfterFilter((node) =>
      filteredAccs.push(node.data)
    );

    const totalFreezedBalance = filteredAccs.reduce((total, acc) => total + balanceStringToNumber(acc.freezed_balance), 0);
    // setFreezedBalance(totalFreezedBalance);

    const totalAvailableBalance = filteredAccs.reduce((total, acc) => total + balanceStringToNumber(acc.available_balance), 0);
    setAvailableBalance(totalAvailableBalance);

    setTotalBalance(totalFreezedBalance + totalAvailableBalance);
  };

  const getAccountsWithRunStats = async (accounts) => {
    const historyItems = await apiService.getHistoryItemsByTime(
      new Date(getLastTimeForRequests()),
      new Date(Date.now()),
      accounts.map((acc) => acc.id)
    );

    const newAccs = accounts.map((acc) => {
      const newAcc = {
        ...acc,
        requests: 0,
        minutes_active: 0,
        sbc_submits: 0,
      }

      historyItems.forEach((item) => {
        if (item.account_id === acc.id) {
          newAcc.requests += item.requests_made
          newAcc.minutes_active += item.minutes_active
          newAcc.sbc_submits += item.sbc_submits
        }
      });

      return newAcc;
    });

    return newAccs;
  }

  const importAccountsFromCSV = async (input) => {
    const csv = input.target.files[0];
    const accsToCreate = [];
    reader.readAsText(csv);
    reader.onload = async (e) => {
      let lines = e.target.result.split('\n');
      for (let i = 1; i < lines.length; i++) {
        let currentLine = lines[i].split(',');
        let newObject = {
          account_owner: currentLine[0],
          origin: currentLine[1],
          email: currentLine[2].toLowerCase(),
          password: currentLine[3],
          gauth: currentLine[4],
          proxyIp: currentLine[5],
          proxyPort: currentLine[6],
          proxyLogin: currentLine[7],
          proxyPass: currentLine[8],
        };
        // accsToCreate.push(newObject);
        await createAccs(newObject, apiService);
        await apiService.refresh();
      }
      alert('accs downloaded');
    };

    // await createAccs(accsToCreate, apiService);
  }

  return (
    <div>
      <div className="buttons">
        <Row style={{ width: '100%' }}>
          <Col xs={5}>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => isModalOpened(true)}
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
              onClick={() => startAccounts('START')}
              variant="warning"
            >
              Universal start
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => stopAccounts()}
              variant="warning"
            >
              Stop
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => blockAccounts()}
              variant="warning"
            >
              Block
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => resetAccounts()}
              variant="warning"
            >
              Reset
            </Button>
            <Button
              disabled={!isAnyRowSelected}
              className="addButton"
              onClick={() => startAccounts('KICKSTART')}
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
              onChange={(event) => changeSecondsBetweenAccsStart(event.target.value)}
            />
          </Col>
          <Col xs={2}>
            <input
              className="input"
              type="number"
              placeholder="Accounts to start in one step"
              value={maxAccsToStart}
              onChange={(event) => changeMaxAccsToStart(event.target.value)}
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
              <Button onClick={(e) => updateStrategyName()}>
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
              onChange={(event) => setTargetConfig(event.target.value)}
            />
            <ButtonGroup aria-label="Basic example">
              <Button onClick={(e) => updateBanConfig()}>
                Set ban config
              </Button>
              <Button onClick={(e) => updateSchedulerConfig()}>
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
              <Button onClick={() => updateServiceName()}>
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
          ref={gridRef}
          // immutableData={true}
          getRowId={(params) => params.data.id}
          columnDefs={columnDefsAccounts}
          defaultColDef={defaultColDef}
          rowGroupPanelShow={'always'}
          pivotPanelShow={'always'}
          suppressAggFuncInHeader={true}
          // autoGroupColumnDef={autoGroupColumnDef}
          onGridReady={(value) => { gridRef.current = value; }}
          rowSelection={'multiple'}
          onCellValueChanged={onCellValueChanged}
          onSelectionChanged={onSelectionChanged}
          animateRows={true}
          onFilterChanged={() => fetchTotalBalanceInfo()}
          enableRangeSelection={true}
          sideBar={'columns'}
        ></AgGridReact>
      </div>
    </div>
  );
}


export default Table;
