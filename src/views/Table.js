import React, { Component, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { apiService, client, SUBSCRIBE_ACCOUNTS } from '../services/ApiService';
import Button from 'react-bootstrap/Button';
import AddAccountModal from './modals/AddAccountModal';
import Form from 'react-bootstrap/Form';
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
import accountToBanned from '../services/utils/accountToBanned';
const reader = new FileReader();

const LOCALE_VALUE = 'en';

export default class Table extends Component {
  state = {
    secondsWaitTillStartAccs: 0,
    openModal: false,
    selectedRow: false,
    modalShow: false,
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

    autoGroupColumnDef: {
      width: 250,
    },

    containerStyle: { width: '100%', height: '900px' },
    gridStyle: { height: '100%', width: '100%' },

    localeValue: 'en',
  };

  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
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

  async deleteAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const idsToDelete = [];
    const bannedAccsToCreate = [];
    for (let i = 0; i < selectedRows.length; i++) {
      let idDeleted = selectedRows[i].id;
      idsToDelete.push(idDeleted);
      bannedAccsToCreate.push(accountToBanned(selectedRows[i]));
      // await apiService.deleteAccount(idDeleted);
    }
    await apiServiceArchive.createBannedAccounts(bannedAccsToCreate);
    await apiService.deleteAccounts(idsToDelete);
  }

  async sendItToRabbit(id, email, status) {
    const toSend = {
      id,
      email: email,
      type: status,
      rabbitUrl: localStorage.get('rabbitUrl'),
    };
    await apiServiceCustomResolvers.sendHttpCommand(toSend);
  }

  async startAccountWithPause() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    for (let i = 0; i < selectedRows.length; i++) {
      if (i % 5 == 0 && i > 0) {
        await new Promise((r) =>
          setTimeout(r, this.state.secondsWaitTillStartAccs * 1000)
        );
      }
      // console.log(selectedRows[i].id)
      await this.sendItToRabbit(
        selectedRows[i].id,
        selectedRows[i].email,
        'START'
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
    console.log('Data after change is', event.data);
    await apiService.updateAccount(event.data);
  }

  async onSelectionChanged() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    this.setState(() => {
      return {
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

  changeBalances = async () => {
    const accountsAfterFilter = [];
    this.state.gridRef.current.api.forEachNodeAfterFilter((node) =>
      accountsAfterFilter.push(node.data)
    );

    let total_freezed_balance = 0;
    let total_available_balance = 0;

    accountsAfterFilter.forEach((account) => {
      total_freezed_balance += account.freezed_balance;
      total_available_balance += account.available_balance;
    });

    const total_balance = total_freezed_balance + total_available_balance;

    this.setState(() => {
      return { total_freezed_balance };
    });
    this.setState(() => {
      return { total_available_balance };
    });
    this.setState(() => {
      return { total_balance };
    });
  };

  async componentDidMount() {
    const adminSecret = localStorage.getItem('adminSecret');
    if (!adminSecret) window.location.href = '/';
    this.changeSecondsBetweenAccsStart(
      localStorage.getItem('secondsBetweenAccsStart') || 10
    );
    const changeRowData = async (data) => {
      this.setState(() => {
        return { rowData: data };
      });
      await this.changeBalances();
    };

    const observer = client.subscribe({
      query: SUBSCRIBE_ACCOUNTS,
    });
    observer.subscribe({
      next(data) {
        changeRowData(data.data.accounts);
      },
      error(err) {
        console.log(err);
      },
    });
    const accounts = await apiService.getAccounts();
    console.log(accounts);
    this.changeRowData(accounts);
  }

  getRowId(params) {
    return params.data.id;
  }

  render() {
    return (
      <div>
        <div className="buttons">
          <Row>
            <Col xs={6}>
              <Button
                className="addButton"
                onClick={() => {
                  this.openModal();
                }}
                variant="primary"
              >
                Create
              </Button>
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
                disabled={!this.state.selectedRow}
                className="addButton"
                onClick={() => {
                  this.startAccountWithPause();
                }}
                variant="warning"
              >
                Start with pause
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
              <Button
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
              </Button>
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
            </Col>
            <Col xs={2}>
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
            <Col>
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
        </div>
        <AddAccountModal show={this.state.modalShow} onHide={this.closeModal} />
        <div className="ag-theme-alpine" style={{ height: 800, width: '100%' }}>
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
          ></AgGridReact>
        </div>
      </div>
    );
  }
}
