import { Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { CustomModalContainer } from '../partials/CustomModalContainer';
import { AlertData } from '../partials/CustomAlert';
import { useAuth } from '../../AuthProvider';
import { sendRequest } from '../../utils/request';
import { SbcStatisticsData } from '../SbcStatistics';

export interface SbcEditModalProps {
  open: boolean,
  handleClose: () => void,
  setAlert: (data: AlertData) => void,
  challenges: SbcStatisticsData[]
}

const SbcEditModal = ({
  open,
  handleClose,
  setAlert,
  challenges
}: SbcEditModalProps) => {
  const auth = useAuth();

  const [priceLimit, setPriceLimit] = useState(0);
  const [solutionsLimit, setSolutionsLimit] = useState(0);

  const update = async () => {
    try {
      const token = auth.user?.token;

      await sendRequest(
        'sbc/update_limits',
        {
          challenges: challenges.map((ch) => ({
            sbcName: ch.sbcName,
            challengeIndex: ch.challengeIndex,
          })),
          priceLimit,
          solutionsLimit,
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

          <Button
            variant='contained'
            size='small'
            color='info'
            onClick={update}
          >
            Update
          </Button>

        </Stack>
      </CustomModalContainer>
    </Modal>
  )
}

export default SbcEditModal;