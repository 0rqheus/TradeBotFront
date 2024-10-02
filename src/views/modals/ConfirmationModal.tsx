import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';

interface ConfirmationModalProps {
  text: string,
  open: boolean,
  handleClose: () => void,
  handleSubmit: () => void,
}

// @todo: do not rerender!
const ConfirmationModal = ({ text, open, handleClose, handleSubmit }: ConfirmationModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {text}
      </DialogTitle>
      <DialogActions>
        <Button variant='contained' onClick={handleClose}>
          Cancel
        </Button>
        <Button color='error' variant="contained" onClick={handleSubmit}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationModal;
