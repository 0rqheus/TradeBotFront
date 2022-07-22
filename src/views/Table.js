import React, { Component, useState } from 'react';
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
    modalShow: false,
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
            className="addButton"
            onClick={() => {
              apiService.getAccounts();
            }}
            variant="primary"
          >
            Добавить прокси
          </Button>
        </div>
        <AddAccountModal show={this.state.modalShow} onHide={this.closeModal} />
        <div className="ag-theme-alpine" style={{ height: 800, width: '100%' }}>
          <AgGridReact
            rowData={this.state.rowData}
            columnDefs={this.state.columnDefs}
            defaultColDef={this.state.defaultColDef}
            rowGroupPanelShow={'always'}
            pivotPanelShow={'always'}
            suppressAggFuncInHeader={true}
            autoGroupColumnDef={this.state.autoGroupColumnDef}
            animateRows={true}
          ></AgGridReact>
        </div>
      </div>
    );
  }
}
