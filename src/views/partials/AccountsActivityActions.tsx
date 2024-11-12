import { Account } from '../../services/ApiService';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Restore as RestoreIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  EditNote as EditNoteIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  UploadFile as UploadFileIcon,
  BrowserUpdated as BrowserUpdatedIcon
} from '@mui/icons-material'
import { HeaderButton } from './CustomButton';
import { Divider, Stack } from '@mui/material';
import { useAuth } from '../../AuthProvider';
import { requestBackend } from '../../utils/request';

interface AccountsActivityActionsProps {
  accounts: Account[],
  fetchAccounts: () => void,
  openConfig: () => void,
  openSettings: () => void,
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
      secondsBetweenStart: Number(localStorage.getItem('secondsBetweenAccsStart')) || 6
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

const updateWorkers = async (token?: string) => {
  await requestBackend('update_workers', {}, token);
}

const AccountsActivityActions = ({
  accounts,
  fetchAccounts,
  openConfig,
  openSettings,
  openDeleteConfirmation,
  openUploadModal
}: AccountsActivityActionsProps) => {
  const auth = useAuth();

  return (
    <Stack className='control-buttons' direction="row" spacing={2} width={100} sx={{ alignItems: 'center' }}>

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

      <HeaderButton
        title="Change config"
        onClick={openConfig}
        content={<EditNoteIcon />}
        disabled={accounts.length <= 0}
      />

      <Divider orientation="vertical" sx={{ height: '5vh' }} />

      <HeaderButton
        title="Update workers"
        onClick={() => updateWorkers(auth.user?.token)}
        content={<BrowserUpdatedIcon />}
      />

      <Divider orientation="vertical" sx={{ height: '5vh' }} />

      <HeaderButton
        title="More options"
        onClick={openSettings}
        content={<MoreVertIcon />}
        disabled={accounts.length <= 0}
      />
    </Stack>
  )
}

export default AccountsActivityActions;