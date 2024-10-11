import { styled } from '@mui/material/styles';

export const CustomModalContainer = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',

  transform: 'translate(-50%, -50%)',
  width: 450,

  backgroundColor: 'white',
  // border: '2px solid #000',
  // boxShadow: 24,

  paddingTop: 2,
  paddingBottom: 3,
  paddingLeft: 4,
  paddingRight: 4,

  boxSizing: 'border-box',
  padding: '40px'
});