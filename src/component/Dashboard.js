import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Chip, Stack, setRef } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { contract_address } from './Userpage';
import Web3 from 'web3';
const drawerWidth = 240;
const navItems = ['inventory', 'trading', 'create'];
window.ethereum.enable();
function Dashboard(props) {
  // use state

  const [account, setAccount] = React.useState('')
  const [refresh, setRefresh] = React.useState(false)
  const location = useLocation();
  //load blockchain data
  const loadBlockchainData = async () => {
    //enable the ethereum
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
    console.log(accounts)
  }
  React.useEffect(() => {
    loadBlockchainData()
  }, [refresh])
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const naviagte = useNavigate();
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };
  window.ethereum.on('accountsChanged', function (accounts) {
    setAccount(accounts[0])
    setRefresh(!refresh)
  })

  const handle_Inventory = () => {
    //navigate to inventory page
    naviagte('/inventory', { state: { user: account } })
  }
  const handle_Trading = () => {
    //navigate to trading page
    naviagte('/trading', { state: { user: account } })
  }
  const handle_Create = () => {
    //navigate to create page
    naviagte('/create', { state: { user: account } })
  }
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography color="inherit"
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Game Account Exchanger address: {contract_address}
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Chip label={'current account:' + account} sx={{ backgroundColor: 'white' }} />
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }}>
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
        </Drawer>
      </Box>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
        {/* //three buttons on the center of the page, each button will navigate to a different page, Inventory page, Trading page, and Create page using onClick*/}
        <div style={{ display: 'flex', justifyContent: 'center', marginLeft: '200%', marginTop: '50%' }}>
          <Stack direction="row" spacing={2} >
            <Button variant="contained" onClick={handle_Inventory} size='large'>Inventory</Button>
            <Button variant="contained" onClick={handle_Trading} size='large'>Trading</Button>
            <Button variant="contained" onClick={handle_Create} size='large'>Create</Button>
          </Stack>
        </div>
      </Box>
    </Box>
  );
}

Dashboard.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Dashboard;