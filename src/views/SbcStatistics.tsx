import { AgGridReact } from 'ag-grid-react';
import { columnDefsSbc, defaultColDef } from '../utils/columnDefs';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { AlertData, CustomAlert } from './partials/CustomAlert';
import { sendRequest } from '../utils/request';
import { Divider, Stack } from '@mui/material';
import { HeaderButton } from './partials/CustomButton';
import {
  Refresh as RefreshIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material'

interface SbcStatisticsData {
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
  const [alert, setAlert] = useState<AlertData>({ open: false });

  const fetchSbcStatistics = async (token?: string) => {
    try {
      const res = await sendRequest('get_sbc_statistics', undefined, token, 'GET');
      const data = await res.json();

      setAlert({ open: true, type: 'success', message: 'Success' });

      setRowData(data);
    } catch (err: any) {
      setAlert({ open: true, type: 'error', message: err.message });
    }
  }

  const editSolutionLimits = (token?: string) => {}

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
            onClick={() => editSolutionLimits(auth.user?.token)}
            content={<EditNoteIcon />}
          />
        </Stack>
      </Stack>
      <div className="ag-theme-alpine" style={{ height: '92vh', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefsSbc as any[]}
          defaultColDef={defaultColDef}
          cellSelection={true}
          sideBar={{ toolPanels: ['columns'] }}
        >
        </AgGridReact>
      </div>
      <CustomAlert data={alert} onClose={() => setAlert({ open: false })} />
    </>
  )
};

export default SbcStatistics;