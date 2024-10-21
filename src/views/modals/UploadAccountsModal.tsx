import { Box, Button, Modal, Typography } from '@mui/material';
import { CustomModalContainer } from '../partials/CustomModalContainer';
import { ChangeEvent, useState } from 'react';
import { useAuth } from '../../AuthProvider';
import { VisuallyHiddenInput } from '../partials/HiddenInput';
import { UploadFile as UploadFileIcon } from '@mui/icons-material'

interface UploadAccountsModalProps {
  open: boolean;
  handleClose: () => void;
}

const UploadAccountsModal = ({ open, handleClose }: UploadAccountsModalProps) => {
  const auth = useAuth();

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!file) {
      console.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    await fetch(`${process.env.REACT_APP_BACKEND_URL}/insert_accounts`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${auth.user?.token}`
      }
    });
    // @todo show error

    handleClose()
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
            Csv file should contain next headers: <br/> email, password, gauth, proxyHost, proxyPort, proxyUsername, proxyPassword, origin
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