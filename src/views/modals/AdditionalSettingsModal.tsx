import { Button, Divider, FormControl, InputLabel, MenuItem, Modal, Select, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Account, ApiService } from '../../services/ApiService';
import { CustomModalContainer } from '../partials/CustomModalContainer';

interface AdditionalSettingsModalProps {
  open: boolean,
  handleClose: () => void,
  selectedRows: Account[]
  apiService: ApiService
}

const UpdateButton = ({ onClick }: { onClick: () => void }) => {
  return (<Button
    variant="contained"
    size='small'
    color='info'
    onClick={onClick}
  >
    Update
  </Button>)
}

const AdditionalSettingsModal = ({
  open,
  handleClose,
  apiService,
  selectedRows
}: AdditionalSettingsModalProps) => {
  const [strategyName, setStrategyName] = useState('');
  // const [targetConfig, setTargetConfig] = useState(0);
  const [serviceName, setServiceName] = useState('');
  const [serviceNames, setServiceNames] = useState<string[]>([]);
  const [secondsBetweenStart, setSecondsBetweenStart] = useState(Number(localStorage.getItem('secondsBetweenAccsStart')) || 6);
  const [chunkSizeToStart, setChunkSizeToStart] = useState(Number(localStorage.getItem('maxAccsToStart')) || 120);

  useEffect(() => {
    (async function () {
      if(apiService.getActiveServices) {
        const activeServices = await apiService.getActiveServices();
        setServiceNames(activeServices.map((s) => s.service_name));
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateServiceName = () =>
    apiService.updateAccountSchedulerInfo(selectedRows, { service_name: serviceName });

  const updateStrategyName = () =>
    apiService.updateAccounts(selectedRows, { strategy_name: strategyName })

  const updateStartParams = () => {
    localStorage.setItem('secondsBetweenAccsStart', secondsBetweenStart.toString())
    localStorage.setItem('maxAccsToStart', chunkSizeToStart.toString())
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
          Additional settings
        </Typography>

        <Stack
          id="modal-modal-description"
          spacing={2}
          mt={4}
          divider={<Divider flexItem />}
        >

          <Stack spacing={0.5}>
            <Stack direction='row' spacing={0.5}>
              <TextField
                id="start-delay"
                label="Seconds between start"
                type='text'
                variant="outlined"
                size='small'
                value={secondsBetweenStart}
                onChange={(event) => setSecondsBetweenStart(Number(event.target.value))}
              />

              <TextField
                id="Chunk size to start"
                label="Chunk size to start"
                type='text'
                variant="outlined"
                size='small'
                value={chunkSizeToStart}
                onChange={(event) => setChunkSizeToStart(Number(event.target.value))}
              />

            </Stack>
            <UpdateButton onClick={updateStartParams} />
          </Stack>

          {/* todo: just use ctrl+v */}
          <Stack spacing={0.5}>

            <TextField
              id="strategy"
              label="Strategy name"
              type='text'
              variant="outlined"
              size='small'
              value={strategyName}
              onChange={(event) => setStrategyName(event.target.value)}
            />
            <UpdateButton onClick={updateStrategyName} />
          </Stack>

          <Stack spacing={0.5}>
            <FormControl fullWidth>
              <InputLabel id="service-select-label" size='small'>Service</InputLabel>
              <Select
                labelId="service-select-label"
                label="service"
                size='small'
                onChange={(event) => setServiceName(event.target.value as string)}
              >
                {
                  serviceNames.map((name) => <MenuItem value={name}>{name}</MenuItem>)
                }
              </Select>
            </FormControl>

            <UpdateButton onClick={updateServiceName} />
          </Stack>
        </Stack>
      </CustomModalContainer>
    </Modal>
  )
}

export default AdditionalSettingsModal;