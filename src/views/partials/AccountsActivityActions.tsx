import { apiServiceCustomResolvers } from '../../services/ApiCustomResolvers'
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
} from '@mui/icons-material'
import { HeaderButton } from './CustomButton';
import { Divider, Stack } from '@mui/material';
import { VisuallyHiddenInput } from './HiddenInput';

interface AccountsActivityActionsProps {
  accounts: Account[],
  fetchAccounts: () => void,
  openConfig: () => void,
  openSettings: () => void,
  openDeleteConfirmation: () => void,
}

const AccountsActivityActions = ({
  accounts,
  fetchAccounts,
  openConfig,
  openSettings,
  openDeleteConfirmation,
}: AccountsActivityActionsProps) => {

  const startAccounts = async () => {
    const secondsBetweenStart = Number(localStorage.getItem('secondsBetweenAccsStart')) || 6;
    const chunkSizeToStart = Number(localStorage.getItem('maxAccsToStart')) || 120;
    await apiServiceCustomResolvers.startAccounts(accounts, 'START', secondsBetweenStart, chunkSizeToStart);
  }

  const importAccountsFromCSV = async () => {
    // @todo: send account to server
      // const importAccountsFromCSV = async (event: any) => {
  //   const csv = event.target.files[0];
  //   const accsToCreate: AccountImportInput[] = [];

  //   const reader = new FileReader();
  //   reader.readAsText(csv);
  //   reader.onload = async (e) => {
  //     const data = e.target!.result! as string;
  //     const rows = data.split('\n');
  //     for (let i = 1; i < rows.length; i++) {
  //       const rowValues = rows[i].split(',');
  //       const newObject = {
  //         accountOwner: rowValues[0], // use username?
  //         origin: rowValues[1],
  //         email: rowValues[2].toLowerCase(),
  //         password: rowValues[3],
  //         gauth: rowValues[4],
  //         proxyIp: rowValues[5],
  //         proxyPort: rowValues[6],
  //         proxyLogin: rowValues[7],
  //         proxyPass: rowValues[8],
  //       };
  //       accsToCreate.push(newObject);
  //     }
  //   };

  //   await createOrUpdateAccs(accsToCreate);

  //   await fetchAccounts();
  // }

  // const createOrUpdateAccs = async (accs: AccountImportInput[]) => {
  //   const existingAccs = await apiServiceRef.current.getAccountsByEmails(accs.map((acc) => acc.email))
  //   const existingEmails = new Set(existingAccs.map((acc) => acc.email))

  //   const allProxies = await apiServiceRef.current.getProxiesByHosts(accs.map((acc) => acc.proxyIp));

  //   const insertData: accounts_insert_input[] = [];
  //   const updateData: accounts_updates[] = [];

  //   for (const acc of accs) {
  //     if (!existingEmails.has(acc.email)) {
  //       const newAcc: accounts_insert_input = {
  //         email: acc.email,
  //         password: acc.password,
  //         gauth: acc.gauth,
  //         group: getAccGroup(acc.proxyIp, acc.proxyPort),
  //         origin: acc.origin,
  //         general_account: {
  //           data: {
  //             email: acc.email
  //           }
  //         },
  //         scheduler_account_info: {
  //           data: {
  //             config_id: 24,
  //           }
  //         },
  //         ban_analytics_info: {
  //           data: {
  //             ban_analytics_config_id: 9
  //           }
  //         },
  //         // @todo: tbd get account_owner from precreated?
  //         account_owner: acc.accountOwner,
  //       };

  //       const proxy = allProxies.find((p) => p.host === acc.proxyIp && p.port === acc.proxyPort);
  //       if (proxy) {
  //         newAcc.proxy_id = proxy.id;
  //       } else {
  //         newAcc.proxy = {
  //           data: {
  //             host: acc.proxyIp,
  //             port: acc.proxyPort,
  //             username: acc.proxyLogin,
  //             password: acc.proxyPass,
  //           }
  //         };
  //       }

  //       insertData.push(newAcc);
  //     } else {

  //       const proxy = allProxies.find((p) => p.host === acc.proxyIp && p.port === acc.proxyPort);
  //       const proxyId = proxy?.id ?? await apiServiceRef.current.createNewProxy({
  //         host: acc.proxyIp,
  //         port: acc.proxyPort,
  //         username: acc.proxyLogin,
  //         password: acc.proxyPass,
  //       });
  //       if (!proxyId) {
  //         throw new Error('Cannot create proxy');
  //       }

  //       const updatedAcc: accounts_updates = {
  //         where: {
  //           email: { _eq: acc.email }
  //         },
  //         _set: {
  //           password: acc.password,
  //           gauth: acc.gauth,
  //           group: getAccGroup(acc.proxyIp, acc.proxyPort),
  //           origin: acc.origin,
  //           proxy_id: proxyId
  //         }
  //       }

  //       updateData.push(updatedAcc);
  //     }
  //   }

  //   // @todo progressbar?
  //   const insertChunks = chunkArray(insertData, 100);
  //   for (const chunk of insertChunks) {
  //     await apiServiceRef.current.createAccounts(chunk);
  //   }

  //   const updateChunks = chunkArray(updateData, 100);
  //   for (const chunk of updateChunks) {
  //     await apiServiceRef.current.updateAccountsBatch(chunk)
  //   }
  // }
  }

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
        onClick={() => { }}
        content={
          <>
            <VisuallyHiddenInput type="file" onChange={importAccountsFromCSV} />
            <UploadFileIcon />
          </>
        } />

      <Divider orientation="vertical" sx={{ height: '5vh' }} />

      <HeaderButton
        title="Start accounts"
        onClick={startAccounts}
        content={<PlayArrowIcon />}
        disabled={accounts.length <= 0}
      />

      <HeaderButton
        title="Stop accounts"
        onClick={() => apiServiceCustomResolvers.sendCommands(accounts, 'STOP')}
        content={<StopIcon />}
        disabled={accounts.length <= 0}
      />

      <HeaderButton
        title="Reset accounts"
        onClick={() => apiServiceCustomResolvers.sendCommands(accounts, 'RESET')}
        content={<RestoreIcon />}
        disabled={accounts.length <= 0}
      />

      <HeaderButton
        title="Block accounts"
        onClick={() => apiServiceCustomResolvers.sendCommands(accounts, 'BLOCK')}
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
        title="More options"
        onClick={openSettings}
        content={<MoreVertIcon />}
        disabled={accounts.length <= 0}
      />
    </Stack>
  )
}

export default AccountsActivityActions;