import React, { Component, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { apiService, client, SUBSCRIBE_ACCOUNTS } from '../services/ApiService';
import Button from 'react-bootstrap/Button';
import AddAccountModal from './modals/AddAccountModal';
import columnDefsAccounts from '../services/utils/columnDefs';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { apiServiceCustomResolvers } from '../services/ApiCustomResolvers';
const reader = new FileReader();

export default class Table extends Component {
  state = {
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

    autoGroupColumnDef: {
      width: 250,
    },

    containerStyle: { width: '100%', height: '900px' },
    gridStyle: { height: '100%', width: '100%' },
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
    this.setState(() => {
      return { rowData: data };
    });
  }

  onLoadGrid = (params) => {
    this.setState(() => {
      return { gridRef: React.createRef({ ...params }) };
    });
  };

  async deleteAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    for (let i = 0; i < selectedRows.length; i++) {
      let idDeleted = selectedRows[i].id;
      console.log(idDeleted);
      await apiService.deleteAccount(idDeleted);
    }
  }

  async sendItToRabbit(id, email, status) {
    const toSend = {
      id,
      email: email,
      type: status,
    };
    console.log(toSend);
    await apiServiceCustomResolvers.sendCommand(toSend);
  }

  async startAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    selectedRows.forEach(async (row) => {
      // await apiService.updateAccountStatus(row._id, 'START');
      await this.sendItToRabbit(row.id, row.email, 'START');
    });
  }

  async startAccountWithPause() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    for(let i = 0; i < selectedRows.length; i++) {
      if(i % 5 == 0 && i > 0) {
        await new Promise(r => setTimeout(r, 10000));
      }
      await this.sendItToRabbit(selectedRows[i].id, selectedRows[i].email, 'START');
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
    console.log(input);
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
    if (selectedRows.length > 0) {
      this.setState(() => {
        return { selectedRow: true };
      });
    }
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
    await this.deleteAccount()
    this.setState(() => {
      return { openModal: false };
    });
  };

  async componentDidMount() {
    const adminSecret = localStorage.getItem('adminSecret');
    if (!adminSecret) window.location.href = '/';
    const changeRowData = (data) => {
      this.setState(() => {
        return { rowData: data };
      });
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
    // console.log(accounts);
    this.changeRowData(accounts);
  }

  render() {
    return (
      <div>
        <div className="buttons">
          <Button
            className="addButton"
            onClick={() => {
              this.openModal();
            }}
            variant="primary"
          >
            Добавить аккаунт
          </Button>
          <Button
            disabled={!this.state.selectedRow}
            className="addButton"
            onClick={() => {
              // this.deleteAccount();
              this.handleClickOpen()
            }}
            variant="danger"
          >
            Удалить аккаунт
          </Button>
          <Button
            disabled={!this.state.selectedRow}
            className="addButton"
            onClick={() => {
              this.startAccount();
            }}
            variant="warning"
          >
            Start
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
          <Dialog
            open={this.state.openModal}
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Are you sure you want to delete these accounts?"}
            </DialogTitle>
            <DialogActions>
              <Button variant="primary" onClick={this.handleClose}>Cancel</Button>
              <Button variant="danger" onClick={this.handleCloseAndDelete}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <input type="file" onChange={this.downloadCSV} />
        </div>
        <AddAccountModal show={this.state.modalShow} onHide={this.closeModal} />
        <div className="ag-theme-alpine" style={{ height: 800, width: '100%' }}>
          <AgGridReact
            rowData={this.state.rowData}
            ref={this.state.gridRef}
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
          ></AgGridReact>
        </div>
      </div>
    );
  }
}
