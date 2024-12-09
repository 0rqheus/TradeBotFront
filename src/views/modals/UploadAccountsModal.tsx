import { Box, Button, Modal, Typography } from '@mui/material';
import { CustomModalContainer } from '../partials/CustomModalContainer';
import { ChangeEvent, useState } from 'react';
import { useAuth } from '../../AuthProvider';
import { VisuallyHiddenInput } from '../partials/HiddenInput';
import { UploadFile as UploadFileIcon } from '@mui/icons-material'
import { AlertData } from '../partials/CustomAlert';
import { sendFormDataRequest } from '../../utils/request';

interface UploadAccountsModalProps {
  open: boolean,
  handleClose: () => void,
  setAlertData: (data: AlertData) => void,
}

const UploadAccountsModal = ({ open, handleClose, setAlertData }: UploadAccountsModalProps) => {
  const auth = useAuth();

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event: any) => {
    try {
      event.preventDefault();

      if (!file) {
        console.error('Please select a file first');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      await sendFormDataRequest('insert_accounts', formData, auth.user?.token);

      handleClose()

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
          Import accounts
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
          }}
        >

          <Typography variant="body1" component="p" color='warning'>
            Csv file should contain next headers:
          </Typography>
          <Typography variant="body1" component="p" overflow={'scroll'}>
            email,password,gauth,proxyHost,proxyPort,proxyUsername,proxyPassword,origin
          </Typography>

          <Button component="label" startIcon={<UploadFileIcon />} >
            Select file
            <VisuallyHiddenInput type="file" accept='text/csv' onChange={handleFileChange} />
          </Button>

          <Button
            type="submit"
            variant="contained"
            color='primary'
          >
            Import
          </Button>
        </Box>
      </CustomModalContainer>
    </Modal>
  );
}

export default UploadAccountsModal;