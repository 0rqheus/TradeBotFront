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
import { SbcStatisticsData } from '../interfaces';

const SbcStatistics = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [rowData, setRowData] = useState<SbcStatisticsData[]>([]);
  const [selectedRows, setSelectedRows] = useState<SbcStatisticsData[]>([]);

  const [alert, setAlert] = useState<AlertData>({ open: false });

  const [isSbcEditModalOpened, setIsSbcEditModalOpened] = useState(false);

  const [totalGained, setTotalGained] = useState(0);

  const [totalSpentTradeSum, setTotalSpentTradeSum] = useState(0);
  const [totalSpentTradeCount, setTotalSpentTradeCount] = useState(0);
  const [totalSpentUntradeSum, setTotalSpentUntradeSum] = useState(0);
  const [totalSpentUntradeCount, setTotalSpentUntradeCount] = useState(0);

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
    const totalGained = selectedRows.reduce((total, curr) => total + (curr.avgRewardSum || 0), 0);
    setTotalGained(totalGained);

    const totalSpentTradeSum = selectedRows.reduce((total, curr) => total + (curr.avgTradeSum || 0), 0);
    const totalSpentTradeCount = selectedRows.reduce((total, curr) => total + (curr.avgTradeCount || 0), 0);
    const totalSpentUntradeSum = selectedRows.reduce((total, curr) => total + (curr.avgUntradeSum || 0), 0);
    const totalSpentUntradeCount = selectedRows.reduce((total, curr) => total + (curr.avgUntradeCount || 0), 0);
    setTotalSpentTradeSum(totalSpentTradeSum);
    setTotalSpentTradeCount(totalSpentTradeCount);
    setTotalSpentUntradeSum(totalSpentUntradeSum);
    setTotalSpentUntradeCount(totalSpentUntradeCount);
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
          <Box >
            <Typography variant="body1">
              <b>Coins gained:</b> {formatNumber(totalGained)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <b>Trade spent (coins):</b> {formatNumber(totalSpentTradeSum)}
            </Typography>
            <Typography variant="body1">
              <b>Trade spent (players):</b> {formatNumber(totalSpentTradeCount)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <b>Untrade spent (coins):</b> {formatNumber(totalSpentUntradeSum)}
            </Typography>
            <Typography variant="body1">
              <b>Untrade spent (players):</b> {formatNumber(totalSpentUntradeCount)}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <div className="ag-theme-alpine" style={{ height: '92vh' }}>
        <AgGridReact
          rowGroupPanelShow={'always'}
          rowData={rowData}
          columnDefs={columnDefsSbc as any[]}
          defaultColDef={defaultColDef}
          onGridReady={(value) => { gridRef.current = value.api; }}
          cellSelection={true}
          rowSelection={'multiple'}
          onSelectionChanged={onSelectionChanged}
          sideBar={{ toolPanels: ['columns'] }}
          alwaysShowVerticalScroll={true}
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