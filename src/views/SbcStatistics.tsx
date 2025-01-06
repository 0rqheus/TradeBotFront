import { AgGridReact } from 'ag-grid-react';
import { columnDefsSbc, defaultColDef } from '../utils/columnDefs';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { AlertData, CustomAlert } from './partials/CustomAlert';
import { sendRequest } from '../utils/request';
import { Backdrop, Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { HeaderButton } from './partials/CustomButton';
import {
  Refresh as RefreshIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material'
import SbcEditModal from './modals/SbcEditModal';
import { GridApi } from 'ag-grid-community';
import { formatNumber } from '../utils/utils';
import { useNavigate } from 'react-router-dom';

export interface SbcStatisticsData {
  sbcName: string,
  challengeId?: number,
  challengeIndex?: number,
  solvedCount?: number,
  totalSpent?: number,
  packName: string,
  isTradeable: boolean,
  repeatCount: number,
  refreshInterval: number,
  expiresAt: number,
  futbinPrice?: number,
  prio?: number,
  priceLimit?: number,
  solutionsLimit?: number,
  generateVirtuals?: boolean
  packsOpened?: number,
  avgRewardSum?: number,
  totalRewardsSum?: number
}

const SbcStatistics = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [rowData, setRowData] = useState<SbcStatisticsData[]>([]);
  const [selectedRows, setSelectedRows] = useState<SbcStatisticsData[]>([]);

  const [alert, setAlert] = useState<AlertData>({ open: false });

  const [isSbcEditModalOpened, setIsSbcEditModalOpened] = useState(false);

  const [totalSpent, setTotalSpent] = useState(0);
  const [totalGained, setTotalGained] = useState(0);

  const gridRef = useRef({} as GridApi<SbcStatisticsData>)

  const fetchSbcStatistics = async (token?: string) => {
    try {
      const res = await sendRequest('sbc/get_statistics', undefined, token, 'GET');
      if (res.status === 401) {
        navigate('/login');
      }

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

    // update aggregated stats
    const totalSpent = selectedRows.reduce((total, curr) => total + Math.round(curr.totalSpent! / curr.solvedCount! || 0), 0);
    const totalGained = selectedRows.reduce((total, curr) => total + (curr.avgRewardSum || 0), 0);
    setTotalSpent(totalSpent);
    setTotalGained(totalGained);
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
            content={<RefreshIcon />}
          />

          <Divider orientation="vertical" sx={{ height: '5vh' }} />

          <HeaderButton
            title="Edit solution limits"
            onClick={() => setIsSbcEditModalOpened(true)}
            content={<EditNoteIcon />}
            disabled={selectedRows.length !== 1}
          />
        </Stack>

        <Stack className='sbc-info' direction="row" spacing={6} px={2}>
          <Box >
            <Typography variant="body1">
              <b>Selected:</b> {selectedRows.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <b>Total avg spent:</b> {formatNumber(totalSpent)}
            </Typography>
            <Typography variant="body1">
              <b>Total avg gained:</b> {formatNumber(totalGained)}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <div className="ag-theme-alpine" style={{ height: '92vh' }}>
        <AgGridReact
          rowGroupPanelShow={'always'}
          // autoGroupColumnDef={}
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
        data={selectedRows[0]}
      />

      <CustomAlert data={alert} onClose={() => setAlert({ open: false })} />
    </>
  )
};

export default SbcStatistics;