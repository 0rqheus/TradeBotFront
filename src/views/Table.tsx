import React, { Component } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { ModuleRegistry } from '@ag-grid-community/core';
import { apiService } from '../services/ApiService';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RangeSelectionModule,
  RowGroupingModule,
  RichSelectModule,
]);

export default class Table extends Component {
  state = {
    rowData: null,
    columnDefs: [
      {
        field: '__typename',
        headerName: 'Entity',
      },
      { field: 'email', headerName: 'Email' },
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      flex: 1,
    },

    containerStyle: { width: '100%', height: '900px' },
    gridStyle: { height: '100%', width: '100%' },
  };

  constructor(props: any) {
    super(props);
  }

  async componentDidMount() {
    const accounts = await apiService.getAccounts();
    this.setState(() => {
      return { rowData: accounts };
    });
  }

  render() {
    return (
      <div style={this.state.containerStyle}>
        <div style={this.state.gridStyle} className="ag-theme-alpine">
          <AgGridReact
            rowData={this.state.rowData}
            columnDefs={this.state.columnDefs}
            defaultColDef={this.state.defaultColDef}
          ></AgGridReact>
        </div>
      </div>
    );
  }
}
