import { Account } from '../../services/ApiService';
import { Box, Button, FormControlLabel, Modal, Switch, TextField, Typography } from '@mui/material';
import { CustomModalContainer } from '../partials/CustomModalContainer';
import { useAuth } from '../../AuthProvider';

interface ChangeConfigModalProps {
  open: boolean,
  handleClose: () => void,
  selectedRows: Account[]
}

const ChangeConfigModal = ({ open, handleClose, selectedRows }: ChangeConfigModalProps) => {
  const auth = useAuth();
  
  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    await fetch(`${process.env.REACT_APP_BACKEND_URL}/change_config`, {
      method: 'POST',
      body: JSON.stringify({
        accountIds: selectedRows.map((acc: any) => acc.id),
        config: {
          maxTimeToTrySbcInMs: formData.get('max-time-to-try-sbc'),
          sbcDurationInMs: formData.get('sbc-duration'),
          shouldTrySbc: formData.get('should-try-sbc'),
        }
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.user?.token}`
      }
    });
    // @todo show error

    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <CustomModalContainer>
        <Typography id="modal-modal-title" variant="h5" component="h2" align='center'>
          Change worker config
        </Typography>

        <Box
          id="modal-modal-description"
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 3,
            marginTop: 4
          }}>

          <TextField
            name="max-time-to-try-sbc"
            label="Max time to try SBC"
            type='number'
            variant="outlined"
          />

          <TextField
            name="sbc-duration"
            label="SBC duration"
            type='number'
            variant="outlined"
          />

          <FormControlLabel 
            name="should-try-sbc"
            label="Should try SBC?"
            control={<Switch defaultChecked/>} 
            />

          <Button
            type="submit"
            variant="contained"
            color='primary'
          >
            Update config
          </Button>
        </Box>
      </CustomModalContainer>
    </Modal>
  );
}

export default ChangeConfigModal;