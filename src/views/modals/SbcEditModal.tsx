import { Button, Checkbox, FormControlLabel, Modal, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { CustomModalContainer } from '../partials/CustomModalContainer';
import { AlertData } from '../partials/CustomAlert';
import { useAuth } from '../../AuthProvider';
import { sendRequest } from '../../utils/request';

interface SbcEditInitialData {
  sbcName: string,
  challengeIndex?: number,
  challengeId?: number,
  prio?: number,
  priceLimit?: number,
  solutionsLimit?: number,
  generateVirtuals?: boolean
}

export interface SbcEditModalProps {
  open: boolean,
  handleClose: () => void,
  setAlert: (data: AlertData) => void,
  data: SbcEditInitialData
}

const SbcEditModal = ({
  open,
  handleClose,
  setAlert,
  data
}: SbcEditModalProps) => {
  const auth = useAuth();

  const [prio, setPrio] = useState(0);
  const [priceLimit, setPriceLimit] = useState(0);
  const [solutionsLimit, setSolutionsLimit] = useState(0);
  const [generateVirtuals, setGenerateVirtuals] = useState(false);

  const update = async () => {
    try {
      const token = auth.user?.token;

      await sendRequest(
        'sbc/update_limits',
        {
          challengeId: data.challengeId,
          sbcName: data.sbcName,
          challengeIndex: data.challengeIndex,
          prio,
          priceLimit,
          solutionsLimit,
          generateVirtuals,
        },
        token,
        'PUT'
      );

      setAlert({ open: true, type: 'success', message: 'Success' })

      handleClose();
    } catch (err: any) {
      setAlert({ open: true, type: 'error', message: err.toString() })
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
          Sbc edit
        </Typography>

        <Stack
          id='modal-modal-description'
          spacing={2}
          mt={4}
        >
          <TextField
            id='prio'
            label='prio'
            type='number'
            variant='outlined'
            size='small'
            value={priceLimit || 0}
            onChange={(event) => setPrio(Number(event.target.value))}
          />

          <TextField
            id='priceLimit'
            label='price limit'
            type='number'
            variant='outlined'
            size='small'
            value={priceLimit || 0}
            onChange={(event) => setPriceLimit(Number(event.target.value))}
          />

          <TextField
            id='solutionsLimit'
            label='solutions limit'
            type='number'
            variant='outlined'
            size='small'
            value={solutionsLimit || 0}
            onChange={(event) => setSolutionsLimit(Number(event.target.value))}
          />

          <FormControlLabel 
            control={<Checkbox />} 
            label="Generate virtual solutions"
            checked={generateVirtuals}
            onChange={() => setGenerateVirtuals(!generateVirtuals)}
          />

          <Button
            variant='contained'
            size='small'
            color='info'
            onClick={update}
          >
            Update
          </Button>

          <Typography variant='body1' component='p' align='left' color='warning'>
            * All fields gonna be updated
          </Typography>

        </Stack>
      </CustomModalContainer>
    </Modal>
  )
}

export default SbcEditModal;