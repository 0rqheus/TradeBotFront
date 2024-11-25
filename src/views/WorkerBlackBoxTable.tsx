import { AgGridReact } from 'ag-grid-react';
import { columnDefsWorkers, defaultColDef } from '../utils/columnDefs';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { formatNumber } from '../utils/utils';
import { HeaderButton } from './partials/CustomButton';
import {
  Refresh as RefreshIcon,
  BrowserUpdated as BrowserUpdatedIcon
} from '@mui/icons-material'
import { requestBackend } from '../utils/request';

interface WbbServiceInfo {
  serviceName: string,
  maxWorkersCount: number,
  currentWorkersCount: number
}

const WorkerBlackBoxTable = () => {
  const auth = useAuth();
  const [rowData, setRowData] = useState<WbbServiceInfo[]>([]);

  const fetchWbbInfo = async (token?: string) => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get_worker_black_box_info`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();

    setRowData(data);
  }

  const updateWorkers = async (token?: string) => {
    await requestBackend('update_workers', {}, token);
  }

  useEffect(() => {
    (async function () {
      await fetchWbbInfo(auth.user?.token);
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Stack direction="row" spacing={'auto'} height={'8vh'} >
        <Stack direction="row" spacing={2} width={100} sx={{ alignItems: 'center' }}>
          <HeaderButton
            title='Refresh'
            onClick={() => fetchWbbInfo(auth.user?.token)}
            content={<RefreshIcon />} />

          <Divider orientation="vertical" sx={{ height: '5vh' }} />

          <HeaderButton
            title="Update workers"
            onClick={() => updateWorkers(auth.user?.token)}
            content={<BrowserUpdatedIcon />}
          />
        </Stack>

        <Box px={2}>
          <Typography variant="body1">
            <b>Current workers:</b> {formatNumber(rowData.reduce((acc, cur) => acc + cur.currentWorkersCount, 0))}
          </Typography>
          <Typography variant="body1">
            <b>Max workers:</b> {formatNumber(rowData.reduce((acc, cur) => acc + cur.maxWorkersCount, 0))}
          </Typography>
        </Box>

      </Stack>

      <div className="ag-theme-alpine" style={{ height: '92vh', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefsWorkers}
          defaultColDef={defaultColDef}
          suppressAggFuncInHeader={true}
        >
        </AgGridReact>
      </div>
    </>
  )
};

export default WorkerBlackBoxTable;
