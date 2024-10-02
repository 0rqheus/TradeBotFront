import { Button, Grid } from '@mui/material'
import { apiServiceCustomResolvers } from '../../services/ApiCustomResolvers'
import { AccountToDisplay } from '../../services/ApiService';

interface AccountsActivityActionsProps {
  disabled: boolean,
  accounts: AccountToDisplay[],
  secondsBetweenStart: number,
  chunkSizeToStart: number,
}

// @todo: do not rerender!
const AccountsActivityActions = ({ disabled, accounts, secondsBetweenStart, chunkSizeToStart }: AccountsActivityActionsProps) => {
  return (
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid xs={3}>
        <Button
          variant='contained'
          size="medium"
          disabled={disabled}
          onClick={() => apiServiceCustomResolvers.startAccounts(accounts, 'START', secondsBetweenStart, chunkSizeToStart)}
        >
          Start
        </Button>
      </Grid>
      <Grid xs={3}>
        <Button
          variant='contained'
          size="medium"
          disabled={disabled}
          onClick={() => apiServiceCustomResolvers.sendCommands(accounts, 'STOP')}
        >
          Stop
        </Button>
      </Grid>
      <Grid xs={3}>
        <Button
          variant='contained'
          size="medium"
          disabled={disabled}
          onClick={() => apiServiceCustomResolvers.sendCommands(accounts, 'RESET')}
        >
          Reset
        </Button>
      </Grid>
      <Grid xs={3}>
        <Button
          variant='contained'
          size="medium"
          disabled={disabled}
          onClick={() => apiServiceCustomResolvers.sendCommands(accounts, 'BLOCK')}
        >
          Block
        </Button>
      </Grid>
    </Grid>
  )
}

export default AccountsActivityActions;