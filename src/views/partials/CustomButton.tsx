import { IconButton, Tooltip } from '@mui/material';

interface HeaderButtonProps {
  title: string,
  disabled?: boolean,
  onClick: () => void,
  content: JSX.Element
}

export const HeaderButton = ({ title, onClick, content, disabled }: HeaderButtonProps) => (
  <Tooltip title={title}>
    <IconButton color="primary" onClick={onClick} disabled={disabled}>
      {content}
    </IconButton>
  </Tooltip>
);