import { AgGridReact } from 'ag-grid-react';
import { columnDefsSbc, defaultColDef } from '../utils/columnDefs';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { AlertData, CustomAlert } from './partials/CustomAlert';
import { sendRequest } from '../utils/request';
import { Backdrop, CircularProgress, Divider, Stack } from '@mui/material';
import { HeaderButton } from './partials/CustomButton';
import {
  Refresh as RefreshIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material'
import SbcEditModal from './modals/SbcEditModal';
import { GridApi } from 'ag-grid-community';

export interface SbcStatisticsData {
  sbcName: string,
  challengeIndex?: number,
  solvedCount?: number,
  avgSpent?: number,
  packName: string,
  isTradeable: boolean,
  repeatCount: number,
  refreshInterval: number
}

const SbcStatistics = () => {
  const auth = useAuth();
  const [rowData, setRowData] = useState<SbcStatisticsData[]>([]);
  const [selectedRows, setSelectedRows] = useState<SbcStatisticsData[]>([]);
  const [alert, setAlert] = useState<AlertData>({ open: false });
  const [isSbcEditModalOpened, setIsSbcEditModalOpened] = useState(false);

  const gridRef = useRef({} as GridApi<SbcStatisticsData>)

  const fetchSbcStatistics = async (token?: string) => {
    try {
      const res = await sendRequest('sbc/get_statistics', undefined, token, 'GET');
      const data = await res.json();

      setAlert({ open: true, type: 'success', message: 'Success' });

      setRowData(data);
    } catch (err: any) {
      setAlert({ open: true, type: 'error', message: err.message });
    }
  }

  const onSelectionChanged = async () => {
    const selectedRows = gridRef.current.getSelectedRows();
    setSelectedRows(selectedRows);
  }

  useEffect(() => {
    (async function () {
      await fetchSbcStatistics(auth.user?.token);
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <>
      <Stack direction="row" spacing={'auto'} height={'8vh'} >
        <Stack direction="row" spacing={2} width={100} sx={{ alignItems: 'center' }}>
          <HeaderButton
            title='Refresh'
            onClick={() => fetchSbcStatistics(auth.user?.token)}
            content={<RefreshIcon />} />

          <Divider orientation="vertical" sx={{ height: '5vh' }} />

          <HeaderButton
            title="Edit solution limits"
            onClick={() => setIsSbcEditModalOpened(true)}
            content={<EditNoteIcon />}
          />
        </Stack>
      </Stack>


      <div className="ag-theme-alpine" style={{ height: '92vh', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefsSbc as any[]}
          defaultColDef={defaultColDef}
          onGridReady={(value) => { gridRef.current = value.api; }}
          cellSelection={true}
          rowSelection={'multiple'}
          onSelectionChanged={onSelectionChanged}
          sideBar={{ toolPanels: ['columns'] }}
        >
        </AgGridReact>
      </div>

      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={rowData.length === 0}
      >
        <CircularProgress />
      </Backdrop>

      <SbcEditModal
        open={isSbcEditModalOpened}
        handleClose={() => setIsSbcEditModalOpened(false)}
        setAlert={setAlert}
        challenges={selectedRows}
      />

      <CustomAlert data={alert} onClose={() => setAlert({ open: false })} />
    </>
  )
};

export default SbcStatistics;