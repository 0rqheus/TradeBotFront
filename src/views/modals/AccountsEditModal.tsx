import { Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { CustomModalContainer } from '../partials/CustomModalContainer';
import { AlertData } from '../partials/CustomAlert';
import { useAuth } from '../../AuthProvider';
import CustomSelect from '../partials/CustomSelect';
import { sendRequest } from '../../utils/request';
import { Account } from '../../interfaces';

interface AccountsEditModalProps {
  open: boolean,
  handleClose: () => void,
  setAlertData: (data: AlertData) => void,
  selectedRows: Account[]
}

const AccountsEditModal = ({
  open,
  handleClose,
  setAlertData,
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
      const response = await sendRequest('accounts/get_accounts_edit_options', undefined, auth.user?.token, 'GET');
      const data = await response.json();

      const { activeServicesNames, schedulerConfigIds, banAnalyticsConfigIds } = data;

      setServiceNames(activeServicesNames);
      setSchedulerConfigIds(schedulerConfigIds);
      setBanConfigIds(banAnalyticsConfigIds);
    })()

    // setServiceName('');
    // setSchedulerConfigId(0);
    // setBanConfigId(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateData = async () => {
    try {
      const data = {
        accountIds: selectedRows.map((r) => r.id),
        strategyName,
        serviceName,
        schedulerConfigId,
        banConfigId
      }
      await sendRequest('accounts/', data, auth.user?.token, 'PUT');

      setAlertData({ open: true, type: 'success', message: 'Success' });

      handleClose();
    } catch (err: any) {
      setAlertData({ open: true, type: 'error', message: err.message });
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <CustomModalContainer>
        <Typography id='modal-modal-title' variant='h5' component='h2' align='center'>
          Accounts edit
        </Typography>

        <Stack
          id='modal-modal-description'
          spacing={2}
          mt={4}
        >
          <TextField
            id='strategy'
            label='Strategy name'
            type='text'
            variant='outlined'
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
            variant='contained'
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