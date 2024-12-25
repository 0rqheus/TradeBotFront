import { AgGridReact } from 'ag-grid-react';
import { columnDefsSbc, defaultColDef } from '../utils/columnDefs';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import createApiService, { SbcInfo } from '../services/ApiService';

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

function convertSbcStatisticsData(input: SbcInfo[]): SbcStatisticsData[] {
  const data: SbcStatisticsData[] = [];

  for (const sbc of input) {
    if (sbc.pack_name !== 'no_pack') {
      data.push({
        sbcName: sbc.name,
        packName: sbc.pack_name,
        isTradeable: sbc.tradeable,
        repeatCount: sbc.repeat_count,
        refreshInterval: sbc.refresh_interval
      })
    }

    for (const ch of sbc.current_challenges) {
      data.push({
        sbcName: sbc.name,
        challengeIndex: ch.challenge_index!,
        solvedCount: ch.account_challenges_infos_aggregate.aggregate!.count,
        avgSpent: ch.account_challenges_infos_aggregate.aggregate!.avg!.total_buy_sum!,
        packName: ch.pack_name,
        isTradeable: ch.tradeable!,
        repeatCount: sbc.repeat_count,
        refreshInterval: sbc.refresh_interval
      })
    }
  }

  return data;
}

const SbcStatistics = () => {
  const auth = useAuth();

  const [rowData, setRowData] = useState<SbcStatisticsData[]>([]);

  useEffect(() => {
    (async function () {
      const api = createApiService(auth.user?.token!)
      const sbcInfo = await api.getCurrentSbcs();
      setRowData(convertSbcStatisticsData(sbcInfo));
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <>
      <div className="ag-theme-alpine" style={{ height: '92vh', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefsSbc as any[]}
          defaultColDef={defaultColDef}
          cellSelection={true}
        >
        </AgGridReact>
      </div>
    </>
  )
};

export default SbcStatistics;