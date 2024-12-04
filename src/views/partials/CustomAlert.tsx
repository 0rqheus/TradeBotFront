import { Alert, Snackbar } from '@mui/material';

export interface AlertData {
  open: boolean,
  type?: 'success' | 'error',
  message?: string
}

interface CustomAlertProps {
  data: AlertData,
  onClose: () => void,
}

export const CustomAlert = ({ data, onClose }: CustomAlertProps) => (
  <Snackbar
    open={data.open}
    autoHideDuration={3000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert
      onClose={onClose}
      severity={data.type}
      variant="filled"
      sx={{ width: '100%' }}
    >
      {data.message}
    </Alert>
  </Snackbar>
);