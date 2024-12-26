import { Button, FormControl, InputLabel, MenuItem, Modal, Select, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Account, ApiService } from '../../services/ApiService';
import { CustomModalContainer } from '../partials/CustomModalContainer';
import { AlertData } from '../partials/CustomAlert';
import { useAuth } from '../../AuthProvider';

interface AccountsEditModalProps {
  open: boolean,
  handleClose: () => void,
  setAlertData: (data: AlertData) => void,
  selectedRows: Account[]
  apiService: ApiService
}

const CustomSelect = ({
  name, values, onSelect
}: { name: string, values: string[] | number[], onSelect: (value: any) => void }) => {
  const labelId = name + 'select-label';
  return (
    <FormControl fullWidth>
      <InputLabel id={labelId} size='small'>{name}</InputLabel>
      <Select
        labelId={labelId}
        size='small'
        defaultValue={''}
        onChange={(event) => onSelect(event.target.value)}
      >
        {
          values.map((val, i) => <MenuItem key={i} value={val}>{val}</MenuItem>)
        }
      </Select>
    </FormControl>
  );
}

const AccountsEditModal = ({
  open,
  handleClose,
  setAlertData,
  apiService,
  selectedRows
}: AccountsEditModalProps) => {
  const auth = useAuth();

  const [strategyName, setStrategyName] = useState('');

  const [serviceName, setServiceName] = useState('');
  const [serviceNames, setServiceNames] = useState<string[]>([]);

  const [schedulerConfigId, setSchedulerConfigId] = useState(0);
  const [schedulerConfigIds, setSchedulerConfigIds] = useState<number[]>([]);

  const [banConfigId, setBanConfigId] = useState(0);
  const [banConfigIds, setBanConfigIds] = useState<number[]>([]);


  useEffect(() => {
    (async function () {
      if (apiService.getActiveServices) {
        const dbServices = await apiService.getActiveServices();
        setServiceNames(dbServices.map((s) => s.service_name));

        const dbSchdulerConfigIds = await apiService.getSchedulerConfigIds();
        setSchedulerConfigIds(dbSchdulerConfigIds);

        const dbBanConfigIds = await apiService.getBanAnalyticsConfigIds();
        setBanConfigIds(dbBanConfigIds);
      }
    })()

    setServiceName('');
    setSchedulerConfigId(0);
    setBanConfigId(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateData = async () => {
    try {
      const promises = [];

      if (strategyName) {
        promises.push(apiService.updateAccounts(selectedRows, { strategy_name: strategyName }))
      }

      if (serviceName || schedulerConfigId) {
        promises.push(apiService.updateAccountSchedulerInfo(selectedRows, {
          service_name: serviceName || undefined,
          config_id: schedulerConfigId || undefined
        }))
      }

      if (banConfigId) {
        promises.push(apiService.updateAccountsBanConfigId(selectedRows, banConfigId))
      }

      await Promise.all(promises);

      setAlertData({ open: true, type: 'success', message: 'Success' });
    } catch (err: any) {
      setAlertData({ open: true, type: 'error', message: err.message });
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <CustomModalContainer>
        <Typography id="modal-modal-title" variant="h5" component="h2" align='center'>
          Advanced edit
        </Typography>

        <Stack
          id="modal-modal-description"
          spacing={2}
          mt={4}
        >
          <TextField
            id="strategy"
            label="Strategy name"
            type='text'
            variant="outlined"
            size='small'
            value={strategyName}
            onChange={(event) => setStrategyName(event.target.value)}
          />

          {
            auth.user?.role === 'sbc-admin'
            &&
            <CustomSelect
              name='Service name'
              values={serviceNames}
              onSelect={setServiceName} />
          }

          <CustomSelect
            name='Scheduler config'
            values={schedulerConfigIds}
            onSelect={setSchedulerConfigId} />

          <CustomSelect
            name='Ban config'
            values={banConfigIds}
            onSelect={setBanConfigId} />

          <Button
            variant="contained"
            size='small'
            color='info'
            onClick={updateData}
          >
            Update
          </Button>

        </Stack>
      </CustomModalContainer>
    </Modal>
  )
}

export default AccountsEditModal;