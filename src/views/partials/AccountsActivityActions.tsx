import { Account } from '../../services/ApiService';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Restore as RestoreIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  EditNote as EditNoteIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material'
import { HeaderButton } from './CustomButton';
import { Divider, Stack } from '@mui/material';
import { useAuth } from '../../AuthProvider';
import { requestBackend } from '../../utils/request';

interface AccountsActivityActionsProps {
  accounts: Account[],
  fetchAccounts: () => void,
  openAdvancedEditModal: () => void,
  openDeleteConfirmation: () => void,
  openUploadModal: () => void,
}

const startAccounts = async (accounts: Account[], token?: string) => {
  await requestBackend(
    'start_accounts',
    {
      accounts: accounts.map((acc) => ({ 
        id: acc.id, 
        email: acc.email, 
        serviceName: acc.scheduler_account_info?.service_name
      })),
    },
    token
  );
  // @todo handle error
}

const executeAccountCommand = async (accounts: Account[], type: 'STOP' | 'BLOCK' | 'RESET', token?: string) => {
  await requestBackend(
    'execute_account_command',
    {
      accounts: accounts.map((acc) => ({ id: acc.id, email: acc.email })),
      type
    },
    token
  );
}

const AccountsActivityActions = ({
  accounts,
  fetchAccounts,
  openAdvancedEditModal,
  openDeleteConfirmation,
  openUploadModal
}: AccountsActivityActionsProps) => {
  const auth = useAuth();

  return (
    <Stack direction="row" spacing={2} width={100} sx={{ alignItems: 'center' }}>

      <HeaderButton
        title='Refresh'
        onClick={fetchAccounts}
        content={<RefreshIcon />} />

      <HeaderButton
        title='Delete'
        onClick={openDeleteConfirmation}
        content={<DeleteIcon />}
        disabled={accounts.length <= 0}
      />

      <HeaderButton
        title='Import accounts'
        onClick={openUploadModal}
        content={<UploadFileIcon />}
      />

      <Divider orientation="vertical" sx={{ height: '5vh' }} />

      <HeaderButton
        title="Start accounts"
        onClick={() => startAccounts(accounts, auth.user?.token)}
        content={<PlayArrowIcon />}
        disabled={accounts.length <= 0}
      />

      <HeaderButton
        title="Stop accounts"
        onClick={() => executeAccountCommand(accounts, 'STOP', auth.user?.token)}
        content={<StopIcon />}
        disabled={accounts.length <= 0}
      />

      <HeaderButton
        title="Reset accounts"
        onClick={() => executeAccountCommand(accounts, 'RESET', auth.user?.token)}
        content={<RestoreIcon />}
        disabled={accounts.length <= 0}
      />

      <HeaderButton
        title="Block accounts"
        onClick={() => executeAccountCommand(accounts, 'BLOCK', auth.user?.token)}
        content={<RemoveCircleOutlineIcon />}
        disabled={accounts.length <= 0}
      />

      <Divider orientation="vertical" sx={{ height: '5vh' }} />

      <HeaderButton
        title="Advanced edit"
        onClick={openAdvancedEditModal}
        content={<EditNoteIcon />}
        disabled={accounts.length <= 0}
      />
    </Stack>
  )
}

export default AccountsActivityActions;