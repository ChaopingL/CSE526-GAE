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
import { useLocation, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import { DataGrid, GridActionsCellItem, renderActionsCell } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { TextField } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Check, CurrencyExchange } from '@mui/icons-material';
import { contract_address } from './Userpage';
const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    autoWidth: true,
    autoHeight: true,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};
const GAE_abi = require('../GAE-contract/build/contracts/GameAccountExchanger.json');
const drawerWidth = 240;
const navItems = ['dashboard', 'inventory', 'create'];
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
function Trading(props) {
    // use state
    //fetch token data from blockchain
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'game', headerName: 'Game', width: 130 },
        { field: 'owner', headerName: 'Owner', width: 130 },
        { field: 'price', headerName: 'Price (Ether)', width: 130 },
        { field: 'status', headerName: 'Status', width: 130 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Action',
            width: 180,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<ShoppingCartIcon />}
                    label="Buy"
                    onClick={() => { handle_sale(params) }}
                />,
                <GridActionsCellItem
                    icon={<CurrencyExchange />}
                    label="Exchange"
                    onClick={() => { handle_exchange(params) }}
                />
            ]
        }
    ];
    const exchange_columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'game', headerName: 'Game', width: 130 },
        { field: 'owner', headerName: 'Owner', width: 130 },
        { field: 'price', headerName: 'Price (Ether)', width: 130 },
        { field: 'status', headerName: 'Status', width: 130 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Action',
            width: 180,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Check />}
                    label="Buy"
                    onClick={() => { submit_exchange(params) }}
                />,
            ]
        }
    ];
    const [refresh, setRefresh] = React.useState(false)
    const [account, setAccount] = React.useState('')
    const [rows, setRows] = React.useState([])
    const [token, setToken] = React.useState('')
    const [token_name, setToken_name] = React.useState('')
    const [sale, setSale] = React.useState(false)
    const [exchange, setExchange] = React.useState(false)
    const [cur_token_for_sale, setCur_token_for_sale] = React.useState(false)
    const [cur_user_tokens, setCur_user_tokens] = React.useState([])

    const location = useLocation();
    //handle edit, set the state of the token
    const handle_sale = (params) => {
        setToken(params.row.id)
        setCur_token_for_sale(params.row.status)
        setPrice(params.row.price)
        setToken_name(params.row.game)
        setSale(true)
    }
    const handle_exchange = (params) => {
        setExchange(true)
        setToken(params.row.id)
        fetch_tokens()
    }
    const submit_exchange = async (params) => {
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        await contract.methods.requestTokenExchange(token, params.row.id).send({ from: accounts[0] })
        setExchange(false)
        setRefresh(!refresh)
    }
    const handleClose = () => {
        setSale(false)
        setExchange(false)
        setToken('')
        setToken_name('')
        setPrice('')
        setCur_token_for_sale(false)
    }
    const fetch_tokens = async () => {
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        const tokens = await contract.methods.getGameAccountTokens().call({ from: accounts[0] })
        //fetch token data from blockchain
        let row = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = await contract.methods.getGameAccountDetails(tokens[i]).call({ from: accounts[0] })
            if (token[7]) continue
            row.push({
                id: tokens[i],
                game: token[1],
                description: token[4],
                price: web3.utils.fromWei(token[5]),
                owner: token[6],
                status: token[7],
            })
        }
        setCur_user_tokens(row)
    }
    //load blockchain data
    const loadBlockchainData = async () => {
        const accounts = await web3.eth.getAccounts()
        setAccount(accounts[0])
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        const tokens = await contract.methods.getAllGameAccountTokensForSale().call({ from: accounts[0] })
        //fetch token data from blockchain
        let row = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = await contract.methods.getGameAccountDetails(tokens[i]).call({ from: accounts[0] })
            if (!token[7]) continue
            if (token[8] != 0) continue
            row.push({
                id: tokens[i],
                game: token[1],
                description: token[4],
                price: web3.utils.fromWei(token[5]),
                owner: token[6],
                status: token[7],
            })
        }
        console.log('acc', accounts[0])
        setRows(row)
    }

    React.useEffect(() => {
        loadBlockchainData()
    }, [refresh])
    const naviagte = useNavigate();
    window.ethereum.on('accountsChanged', function (accounts) {
        setAccount(accounts[0])
        setRefresh(!refresh)
    })

    const [price, setPrice] = React.useState(0)
    const buy_token = async () => {
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        const response = await contract.methods.buyGameAccount(token).send({ from: accounts[0], value: web3.utils.toWei(price) })
        console.log(response)
        setRefresh(!refresh)
        handleClose()
    }
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
            <Box component="main" sx={{ p: 3 }}>
                <Toolbar />
                {/* Data grid to display the accounts*/}
                <div>
                    <DataGrid
                        sx={{
                            margin: 1,
                            marginLeft: "1%",
                            border: "1px black solid",
                            fontSize: "large",
                        }}
                        autoHeight
                        autoWidth
                        rows={rows}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                    />
                </div>
                {/* Modal to display the account details large size*/}
                <Modal open={exchange} onClose={() => handleClose()} pageSize='large' >
                    <Box sx={style} >
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Select a token to exchange
                        </Typography>
                        <DataGrid
                            sx={{
                                margin: 1,
                                marginLeft: "1%",
                                border: "1px black solid",
                                fontSize: "large",
                            }}
                            autoHeight
                            autoWidth
                            rows={cur_user_tokens}
                            columns={exchange_columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            checkboxSelection
                            onRowClick={(params) => handle_sale(params)}
                        />
                    </Box>
                </Modal>
                <Modal open={sale} onClose={() => handleClose()}>
                    <Box sx={style} >
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Buy {token_name} for {price} ETH
                        </Typography>
                        <Stack spacing={2} direction="row">
                            <Button variant="contained" onClick={() => buy_token()}>Buy</Button>
                            <Button variant="contained" onClick={() => handleClose()}>Cancel</Button>
                        </Stack>
                    </Box>
                </Modal>
            </Box>
        </Box>
    );
}


Trading.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window: PropTypes.func,
};

export default Trading;