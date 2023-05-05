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
import { Chip, FormControl, FormControlLabel, Modal, Stack, Switch } from '@mui/material';
import { useLocation, useNavigate, useNavigation } from 'react-router-dom';
import Web3 from 'web3';
import { DataGrid, GridActionsCellItem, renderActionsCell } from '@mui/x-data-grid';
import GameAccountExchangerContract from '../GAE-contract/build/contracts/GameAccountExchanger.json';
import EditIcon from '@mui/icons-material/Edit';
import { Close } from "@mui/icons-material";
import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { contract_address } from './Userpage';

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
const GAE_abi = require('../GAE-contract/build/contracts/GameAccountExchanger.json');
const drawerWidth = 240;
const navItems = ['dashboard', 'inventory', 'trading'];
function Create(props) {
    const [account, setAccount] = useState('')
    const [refresh, setRefresh] = useState(false)
    const [event, setEvent] = useState(null)
    //game account states
    const [game, setGame] = useState('')
    const [game_account, setGameAccount] = useState('')
    const [password, setPassword] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const naviagte = useNavigate();
    //fetch account data from blockchain
    const loadBlockchainData = async () => {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        setAccount(accounts[0])
        setEvent(contract)
    }
    useEffect(() => {
        loadBlockchainData()
    }, [refresh])
    const navigate = useNavigate();
    const handle_create = async () => {
        if (game == '' || game_account == '' || password == '' || price == '' || description == '') {
            alert('Please fill in all the blanks')
            return
        }
        const response = await event.methods.createGameAccount(game, game_account, password, description, web3.utils.toWei(price, 'ether')).send({ from: account })
        console.log(response)
        setRefresh(!refresh)
        alert('Success')
        navigate('/inventory')

    }
    window.ethereum.on('accountsChanged', function (accounts) {
        setAccount(accounts[0])
        setRefresh(!refresh)
    })

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar component="nav">
                <Toolbar>
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
                            <Button key={item} sx={{ color: '#fff' }} onClick={() => naviagte('/' + item)}>
                                {item}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <div>
                <Toolbar />
                <Typography variant="h4" component="div" gutterBottom>
                    Create
                </Typography>
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '25ch' },
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <div>
                        <TextField
                            required
                            id="outlined-required"
                            label="Game"
                            value={game}
                            onChange={(e) => { setGame(e.target.value); }}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Account"
                            value={game_account}
                            onChange={(e) => { setGameAccount(e.target.value); }}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); }}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Description"
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); }}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Price"
                            value={price}
                            onChange={(e) => {
                                setPrice(e.target.value);
                            }}
                        />
                    </div>
                    <Button variant="contained" onClick={handle_create}>Create</Button>
                </Box>
            </div>
        </Box>
    )
}
export default Create;