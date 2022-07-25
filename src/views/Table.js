import React, { Component, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { apiService, client, SUBSCRIBE_ACCOUNTS } from '../services/ApiService';
import Button from 'react-bootstrap/Button';
import AddAccountModal from './modals/AddAccountModal';
import columnDefsAccounts from '../services/utils/columnDefs';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

export default class Table extends Component {
  state = {
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
    const emailDeleted = selectedRows[0].email;
    console.log(emailDeleted);
    await apiService.deleteAccount(emailDeleted);
  }

  async startAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const emailDeleted = selectedRows[0].email;
    await apiService.startAccount(emailDeleted);
  }

  async stopAccount() {
    const selectedRows = this.state.gridRef.current.api.getSelectedRows();
    const emailDeleted = selectedRows[0].email;
    await apiService.stopAccount(emailDeleted);
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

  async componentDidMount() {
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
        changeRowData(data.data.Account);
      },
      error(err) {
        console.log(err);
      },
    });
    const accounts = await apiService.getAccounts();
    console.log(accounts);
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
              this.deleteAccount();
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
            variant="success"
          >
            Start
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
            onCellValueChanged={this.onCellValueChanged}
            onSelectionChanged={this.onSelectionChanged}
            animateRows={true}
            rowSelection={'single'}
          ></AgGridReact>
        </div>
      </div>
    );
  }
}
