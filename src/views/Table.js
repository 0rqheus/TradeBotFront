import React, { Component, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { apiService, client, SUBSCRIBE_ACCOUNTS } from '../services/ApiService';
import Button from 'react-bootstrap/Button';
import AddAccountModal from './modals/AddAccountModal';
import ChangeConfigModal from './modals/ChangeConfig';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import columnDefsAccounts from '../services/utils/columnDefs';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { apiServiceCustomResolvers } from '../services/ApiCustomResolvers';
import apiServiceArchive from '../services/ApiServiceArchive';
import {
  accountToBanned,
  historyItemToArchive,
  schedulerInfoToArchive,
} from '../services/utils/accountToBanned';
import apiServiceServers from '../services/ApiServiceServers';
import { balanceToNumber } from '../services/utils/accountToBanned';
import getLastTimeForRequests from '../services/utils/getLastTimeForRequests';

const reader = new FileReader();

export default class Table extends Component {
  state = {
    accsToStartInOneStep: 0,
    maxAccsToStart: 0,
    openModal: false,
    selectedRow: false,
    modalShow: false,
    changeConfigModalShow: false,
    selectedRows: [],
    gridRef: null,
    gridApi: null,
    rowData: [],
    columnDefs: columnDefsAccounts,
    defaultColDef: {
      resizable: true,
      sortable: true,
      flex: 1,
      filter: true,
    },

    total_freezed_balance: 0,
    total_available_balance: 0,
    total_balance: 0,
    selectedRowsCount: 0,
    enableSbc: false,
    strategyToSet: '',
    serviceName: '',
    serviceNames: [],
    banConfigToSet: 0,

    // autoGroupColumnDef: {
    //   width: 250,
    // },

    containerStyle: { width: '100%', height: '900px' },
    gridStyle: { height: '100%', width: '100%' },

    localeValue: 'en',
  };

  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.changeConfig = this.changeConfig.bind(this);
    this.closeChangeConfig = this.closeChangeConfig.bind(this);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);
  }

  closeModal() {
    this.setState(() => {
      return { modalShow: false };
    });
  }

  openModal() {
    this.setState(() => {
      return { modalShow: true };
    });
  }

  changeConfig() {
    this.setState(() => {
      return { changeConfigModalShow: true };
    });
  }

  closeChangeConfig() {
    this.setState(() => {
      return { changeConfigModalShow: false };
    });
  }

  changeRowData(data) {
    const rowData = data.map((d) => ({
      ...d,
      freezed_balance: d.freezed_balance.toLocaleString(this.state.localeValue),
      available_balance: d.available_balance.toLocaleString(
        this.state.localeValue
      ),
    }));

    this.setState(() => {
      return { rowData };
    });
  }

  onLoadGrid = (params) => {
    this.setState(() => {
      return { gridRef: React.createRef({ ...params }) };
    });
  };

  onFilterChanged = () => {
    this.changeBalances();
  };

  changeEnableSbcEvent = (event) => {
    this.setState(() => {
      return { enableSbc: event.target.checked };
    });
  };

  changeStrategyToSet = (strategyName) => {
    this.setState(() => {
      return { strategyToSet: strategyName };
    });
  };

  changeBanConfigToSet = (banConfig) => {
    this.setState(() => {
      return { banConfigToSet: banConfig };
    });
  };
  
  changeServiceName = (serviceNameToSet) => {
    this.setState(() => {
      return { serviceName: serviceNameToSet };
    });
  };

  changeServiceNames = (serviceNamesToSet) => {
    this.setState(() => {
      return { serviceNames: serviceNamesToSet };
    });
  };

  async deleteAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const idsToDelete = selectedRows.map((acc) => acc.id);
    const bannedAccsToCreate = [];
    const historyItemsToCreate = [];
    const schedulerInfoToCreate = [];
    const bannedAccsHistoryItems = await apiService.getHistoryItems(
      idsToDelete
    );
    const bannedAccsSchedulerInfo = await apiService.getSchedulerInfo(
      idsToDelete
    );
    for (let i = 0; i < selectedRows.length; i++) {
      bannedAccsToCreate.push(accountToBanned(selectedRows[i]));
    }
    bannedAccsHistoryItems.forEach((historyItem) => {
      historyItemsToCreate.push(historyItemToArchive(historyItem));
    });
    bannedAccsSchedulerInfo.forEach((schedulerInfo) => {
      schedulerInfoToCreate.push(schedulerInfoToArchive(schedulerInfo));
    });
    await apiServiceArchive.createBannedAccounts(bannedAccsToCreate);
    await apiServiceArchive.createHistoryItems(historyItemsToCreate);
    await apiServiceArchive.createSchedulerInfo(schedulerInfoToCreate);
    await apiService.deleteAccounts(idsToDelete);
  }

  async getAccs() {
    await apiService.refresh();
    const accounts = await apiService.getAccounts();
    // const accountsWithServers = await this.setAccountServerId(accounts);
    const accountsWithRequests = await this.changeAll(accounts);
    console.log(accountsWithRequests);
    this.changeRowData(accountsWithRequests);
    await this.changeBalances();
  }

  async sendItToRabbit(id, email, status) {
    const toSend = {
      id,
      email: email,
      type: status,
      rabbitUrl: localStorage.getItem('rabbitUrl'),
    };
    await apiServiceCustomResolvers.sendHttpCommand(toSend);
  }

  async selectAccsToStart() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const accsToStartByServer = [];
    const accsToStartByPause = [];

    selectedRows.map((acc) => {
      accsToStartByPause.push(acc);
      if(acc.scheduler_account_info.service_name) {
        accsToStartByServer.push({
          id: acc.id,
          email: acc.email,
          service_name: acc.scheduler_account_info.service_name
        });
      }
    });

    await this.startAccountByServer(accsToStartByServer);
    // await this.startAccountWithPause(accsToStartByPause);
  }

  async startAccountByServer(accounts) {
    console.log(accounts);
    await apiServiceCustomResolvers.startByServers({
      accounts,
      type: 'START',
      secondsBetween: 12,
      maxAccsToStart: 93,
      rabbitUrl: localStorage.getItem('rabbitUrl'),
    });
  }

  async startAccountWithPause(accounts) {
    for (let i = 0; i < accounts.length; i++) {
      if (i % Number(localStorage.getItem('maxAccsToStart')) == 0 && i > 0) {
        await new Promise((r) =>
          setTimeout(
            r,
            Number(localStorage.getItem('secondsBetweenAccsStart')) * 1000
          )
        );
      }
      await this.sendItToRabbit(accounts[i].id, accounts[i].email, 'START');
    }
  }

  async kickStartAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    for (let i = 0; i < selectedRows.length; i++) {
      if (i % this.state.accsToStartInOneStep == 0 && i > 0) {
        await new Promise((r) =>
          setTimeout(r, this.state.secondsWaitTillStartAccs * 1000)
        );
      }
      // console.log(selectedRows[i].id)
      await this.sendItToRabbit(
        selectedRows[i].id,
        selectedRows[i].email,
        'KICKSTART'
      );
    }
  }

  async stopAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      // await apiService.updateAccountStatus(row._id, 'STOP');
      await this.sendItToRabbit(row.id, row.email, 'STOP');
    });
  }

  async pauseAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      // await apiService.updateAccountStatus(row._id, 'PAUSE');
      await this.sendItToRabbit(row.id, row.email, 'PAUSE');
    });
  }

  async unpauseAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      // await apiService.updateAccountStatus(row._id, 'UNPAUSE');
      await this.sendItToRabbit(row.id, row.email, 'UNPAUSE');
    });
  }

  async blockAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      // await apiService.updateAccountStatus(row._id, 'BLOCK');
      await this.sendItToRabbit(row.id, row.email, 'BLOCK');
    });
  }

  async resetAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      // await apiService.updateAccountStatus(row._id, 'RESET');
      await this.sendItToRabbit(row.id, row.email, 'RESET');
    });
  }

  async solveSBC() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const accountsToSolveSbc = [];
    selectedRows.forEach(async (row) => {
      // await apiService.updateAccountStatus(row._id, 'RESET');
      accountsToSolveSbc.push(row.id);
    });
    await apiServiceCustomResolvers.sendSolveSbcCommand({
      account_ids: accountsToSolveSbc,
    });
  }

  async solveConcreteSBC(sbcName) {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    await apiServiceCustomResolvers.sendSolveSbcCommand({
      account_ids: selectedRows.map((row) => row.id),
      to_solve: sbcName,
    });
  }

  async setStrategy() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const accIds = selectedRows.map((row) => row.id);
    await apiService.setStrategyName(accIds, this.state.strategyToSet);
  }

  async setBanConfig() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const accIds = selectedRows.map((row) => row.id);
    await apiService.setBanConfig(accIds, this.state.banConfigToSet);
  }

  async setServiceName() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const accIds = selectedRows.map((row) => row.id);
    await apiService.setServiceName(accIds, this.state.serviceName);
  }

  async downloadCSV(input) {
    const csv = input.target.files[0];
    reader.readAsText(csv);
    reader.onload = async (e) => {
      let lines = e.target.result.split('\n');
      let headers = lines[0].split(',');
      for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
          headers[j] = headers[j].trim();
          obj[headers[j]] = currentline[j]
            .replace(/\"/g, '')
            .replace(/\r/g, '');
        }
        let newObject = {
          email: obj['Email'],
          password: obj['Password'],
          gauth: obj['Gauth'],
          proxyId: obj['ProxyId'],
          proxyIp: obj['ProxyHost'],
          proxyPort: obj['ProxyPort'],
          proxyLogin: obj['ProxyLogin'],
          proxyPass: obj['ProxyPass'],
        };
        await apiService.createAccount(newObject);
      }
    };
  }

  async onCellValueChanged(event) {
    const dataToUpdate = { ...event.data };
    delete dataToUpdate.objectives_progress;
    delete dataToUpdate.proxy;
    delete dataToUpdate.accounts_workshift;
    delete dataToUpdate.accounts_challenges;
    // delete dataToUpdate.serverId;
    await apiService.updateAccount(dataToUpdate);
  }

  async onSelectionChanged() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    this.setState(() => {
      return {
        selectedRows: selectedRows,
        selectedRow: selectedRows.length > 0,
        selectedRowsCount: selectedRows.length,
      };
    });
  }

  handleClickOpen = () => {
    this.setState(() => {
      return { openModal: true };
    });
  };

  handleClose = () => {
    this.setState(() => {
      return { openModal: false };
    });
  };

  handleCloseAndDelete = async () => {
    await this.deleteAccount();
    this.setState(() => {
      return { openModal: false };
    });
  };

  changeSecondsBetweenAccsStart = async (seconds) => {
    this.setState(() => {
      return { secondsWaitTillStartAccs: seconds };
    });
    localStorage.setItem('secondsBetweenAccsStart', seconds);
  };

  changeMaxAccsToStart = async (accs) => {
    this.setState(() => {
      return { maxAccsToStart: accs };
    });
    localStorage.setItem('maxAccsToStart', accs);
  };

  changeBalances = async () => {
    const accountsAfterFilter = [];
    // if (this.state.gridRef.current) {
    this.state.gridRef.current.api.forEachNodeAfterFilter((node) =>
      accountsAfterFilter.push(node.data)
    );

    const total_freezed_balance = accountsAfterFilter.reduce(
      (accumulator, account) =>
        accumulator + balanceToNumber(account.freezed_balance),
      0
    );
    const total_available_balance = accountsAfterFilter.reduce(
      (accumulator, account) =>
        accumulator + balanceToNumber(account.available_balance),
      0
    );

    const total_balance =
      Number(total_freezed_balance) + Number(total_available_balance);

    this.setState(() => {
      return { total_freezed_balance };
    });
    this.setState(() => {
      return { total_available_balance };
    });
    this.setState(() => {
      return { total_balance };
    });
    // }
  };

  async setAccountServerId(accounts) {
    const profileInfos = await apiServiceServers.getAccountServers();
    const accsWithServer = [];
    accounts.forEach((account) => {
      const newAcc = { ...account };
      const profileInfo = profileInfos.find(
        (profileInfo) => profileInfo.id == newAcc.email
      );
      if (profileInfo) newAcc['serverId'] = profileInfo.server.id;
      accsWithServer.push(newAcc);
    });
    return accsWithServer;
  }

  async changeAll(accounts) {
    const historyItems = await apiService.getHistoryItemsByTime(
      new Date(getLastTimeForRequests()),
      new Date(Date.now()),
      accounts.map((acc) => acc.id)
    );
    const newAccs = [];
    accounts.map((acc) => {
      const newAcc = { ...acc };
      const accountHistoryItems = historyItems.filter(
        (historyItem) => historyItem.account_id === acc.id
      );
      newAcc['requests'] = accountHistoryItems.reduce(
        (current, historyItem) => current + historyItem.requests_made,
        0
      );
      newAcc['minutes_active'] = Math.floor(
        accountHistoryItems.reduce(
          (current, historyItem) => current + historyItem.minutes_active,
          0
        )
      );
      newAcc['sbc_submits'] = Math.floor(
        accountHistoryItems.reduce(
          (current, historyItem) => current + historyItem.sbc_submits,
          0
        )
      );
      newAccs.push(newAcc);
    });
    console.log(newAccs);
    return newAccs;
  }

  async componentDidMount() {
    const adminSecret = localStorage.getItem('adminSecret');
    if (!adminSecret) window.location.href = '/';
    this.changeSecondsBetweenAccsStart(
      localStorage.getItem('secondsBetweenAccsStart') || 6
    );
    this.changeMaxAccsToStart(localStorage.getItem('maxAccsToStart') || 120);
    // const changeRowData = async (data) => {
    //   const newData = await this.setAccountServerId(data);
    //   this.setState(() => {
    //     return { rowData: newData };
    //   });
    //   await this.changeBalances();
    // };

    // const observer = client.subscribe({
    //   query: SUBSCRIBE_ACCOUNTS,
    // });
    // observer.subscribe({
    //   next(data) {
    //     changeRowData(data.data.accounts);
    //   },
    //   error(err) {
    //     console.error(err);
    //   },
    // });
    const serviceSelection = (await apiService.getActiveServices()).map(service => service.service_name);
    console.log(serviceSelection);
    this.changeServiceNames(serviceSelection);
    const accounts = await apiService.getAccounts();
    // const accountsWithServers = await this.setAccountServerId(accounts);
    const accountsWithRequests = await this.changeAll(accounts);
    this.changeRowData(accountsWithRequests);
    await this.changeBalances();
  }

  getRowId(params) {
    return params.data.id;
  }

  render() {
    return (
      <div>
        <div className="buttons">
          <Row style={{ width: '100%' }}>
            <Col xs={5}>
              {/* <Button
                className="addButton"
                onClick={() => {
                  this.openModal();
                }}
                variant="primary"
              >
                Create
              </Button> */}
              <Button
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  // this.deleteAccount();
                  this.handleClickOpen();
                }}
                variant="danger"
              >
                Delete
              </Button>
              <Button
                className="addButton"
                onClick={() => {
                  // this.deleteAccount();
                  this.getAccs();
                }}
                variant="primary"
              >
                Refresh
              </Button>
              <Button
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  this.selectAccsToStart();
                }}
                variant="warning"
              >
                Universal start
              </Button>
              <Button
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  this.stopAccount();
                }}
                variant="warning"
              >
                Stop
              </Button>
              {/* <Button
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  this.pauseAccount();
                }}
                variant="warning"
              >
                Pause
              </Button>
              <Button
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  this.unpauseAccount();
                }}
                variant="warning"
              >
                Unpause
              </Button> */}
              <Button
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  this.blockAccount();
                }}
                variant="warning"
              >
                Block
              </Button>
              <Button
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  this.resetAccount();
                }}
                variant="warning"
              >
                Reset
              </Button>
              <Button
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  this.kickStartAccount();
                }}
                variant="warning"
              >
                Kickstart accounts
              </Button>
              <Button
                className="addButton"
                onClick={() => {
                  this.changeConfig();
                }}
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
                value={this.state.secondsWaitTillStartAccs}
                onChange={(event) => {
                  this.changeSecondsBetweenAccsStart(event.target.value);
                }}
              />
            </Col>
            <Col xs={2}>
              <input
                className="input"
                type="number"
                placeholder="Accounts to start in one step"
                value={this.state.maxAccsToStart}
                onChange={(event) => {
                  this.changeMaxAccsToStart(event.target.value);
                }}
              />
            </Col>
            <Col xs={2}>
              <div>
                <b>Selected:</b> {this.state.selectedRowsCount}
              </div>
              <div>
                <b>Available balance:</b>{' '}
                {this.state.total_available_balance.toLocaleString(
                  this.state.localeValue
                )}
              </div>
              {/* <div><b>Freezed:</b> {this.state.total_freezed_balance}</div> */}
              <div>
                <b>Total balance:</b>{' '}
                {this.state.total_balance.toLocaleString(
                  this.state.localeValue
                )}
              </div>
            </Col>
            <Col xs={1}>
              <Dialog
                open={this.state.openModal}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {'Are you sure you want to delete these accounts?'}
                </DialogTitle>
                <DialogActions>
                  <Button variant="primary" onClick={this.handleClose}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={this.handleCloseAndDelete}>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
              <input type="file" onChange={this.downloadCSV} />
            </Col>
          </Row>
          <Row style={{ width: '100%' }}>
            <Col xs="4">
              <ButtonGroup aria-label="Basic example">
                <Button
                  disabled={!this.state.enableSbc}
                  onClick={(e) => this.solveConcreteSBC('Foundations I_1')}
                >
                  Foundations 1
                </Button>
                <Button
                  disabled={!this.state.enableSbc}
                  onClick={(e) => this.solveConcreteSBC('Foundations I_2')}
                >
                  Foundations 2
                </Button>
                <Button
                  disabled={!this.state.enableSbc}
                  onClick={(e) => this.solveConcreteSBC('Foundations I_3')}
                >
                  Foundations 3
                </Button>
                <Button
                  disabled={!this.state.enableSbc}
                  onClick={(e) => this.solveConcreteSBC('Foundations I_4')}
                >
                  Foundations 4
                </Button>
                {/* <Button
                  disabled={!this.state.enableSbc}
                  onClick={(e) => this.solveConcreteSBC('Daily Gold Upgrade_1')}
                >
                  Daily Gold
                </Button>
                <Button
                  disabled={!this.state.enableSbc}
                  onClick={(e) =>
                    this.solveConcreteSBC(
                      'Team of the Season Daily Login Upgrade_1'
                    )
                  }
                >
                  Daily Login
                </Button> */}
              </ButtonGroup>
            </Col>
            <Col xs="2">
              <input
                className="input"
                type="text"
                placeholder="strategy"
                value={this.state.strategyToSet}
                onChange={(event) => {
                  this.changeStrategyToSet(event.target.value);
                }}
              />
              <ButtonGroup aria-label="Basic example">
                <Button onClick={(e) => this.setStrategy()}>
                  Set strategy
                </Button>
              </ButtonGroup>
            </Col>
            <Col xs="2">
              <input
                className="input"
                type="number"
                placeholder="ban config"
                value={this.state.banConfigToSet}
                onChange={(event) => {
                  this.changeBanConfigToSet(event.target.value);
                }}
              />
              <ButtonGroup aria-label="Basic example">
                <Button onClick={(e) => this.setBanConfig()}>
                  Set ban config
                </Button>
              </ButtonGroup>
            </Col>
            <Col xs="2">
              <Form.Select onChange={(event) => {
                this.changeServiceName(event.target.value);
              }}>
                {(() => {
                  const options = [];

                  for (const serviceName of this.state.serviceNames) {
                    options.push(<option value={serviceName}>{serviceName}</option>);
                  }

                  return options;
                })()}
              </Form.Select>
              <ButtonGroup aria-label="Basic example">
                <Button onClick={(e) => this.setServiceName()}>
                  Set service name
                </Button>
              </ButtonGroup>
            </Col>
            <Col xs="1">
              <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check
                  type="checkbox"
                  value={this.state.enableSbc}
                  label="Enable sbc buttons"
                  onClick={this.changeEnableSbcEvent}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
        <AddAccountModal show={this.state.modalShow} onHide={this.closeModal} />
        <ChangeConfigModal
          show={this.state.changeConfigModalShow}
          onHide={this.closeChangeConfig}
          accounts={this.state.selectedRows}
        />
        <div className="ag-theme-alpine" style={{ height: 780, width: '100%' }}>
          <AgGridReact
            rowData={this.state.rowData}
            ref={this.state.gridRef}
            immutableData={true}
            getRowId={this.getRowId}
            columnDefs={this.state.columnDefs}
            defaultColDef={this.state.defaultColDef}
            rowGroupPanelShow={'always'}
            pivotPanelShow={'always'}
            suppressAggFuncInHeader={true}
            autoGroupColumnDef={this.state.autoGroupColumnDef}
            onGridReady={this.onLoadGrid}
            rowSelection={'multiple'}
            onCellValueChanged={this.onCellValueChanged}
            onSelectionChanged={this.onSelectionChanged}
            animateRows={true}
            onFilterChanged={this.onFilterChanged}
            enableRangeSelection={true}
            sideBar={'columns'}
          ></AgGridReact>
        </div>
      </div>
    );
  }
}
