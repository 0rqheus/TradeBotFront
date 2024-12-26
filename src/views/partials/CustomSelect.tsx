import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const CustomSelect = ({
  name, values, onSelect
}: { name: string, values: string[] | number[], onSelect: (value: any) => void }) => {
  const labelId = name + 'select-label';
  return (
    <FormControl fullWidth>
      <InputLabel id={labelId} size='small'>{name}</InputLabel>
      <Select
        labelId={labelId}
        size='small'
        defaultValue={''}
        onChange={(event) => onSelect(event.target.value)}
      >
        {
          values.map((val, i) => <MenuItem key={i} value={val}>{val}</MenuItem>)
        }
      </Select>
    </FormControl>
  );
}

export default CustomSelect;