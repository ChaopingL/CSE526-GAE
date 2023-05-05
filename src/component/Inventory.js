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
import { Check, Close } from '@mui/icons-material';
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
const GAE_abi = require('../GAE-contract/build/contracts/GameAccountExchanger.json');
const drawerWidth = 240;
const navItems = ['dashboard', 'trading', 'create'];
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")

function Inventory(props) {
    // use state
    //fetch token data from blockchain
    window.ethereum.on('accountsChanged', function (accounts) {
        setRefresh(!refresh)
    })
    window.ethereum.on('chainChanged', function (chainId) {
        setRefresh(!refresh)
    })
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'game', headerName: 'Game', width: 130 },
        { field: 'account', headerName: 'Account', width: 130 },
        { field: 'password', headerName: 'Password', width: 130 },
        { field: 'description', headerName: 'Description', width: 130 },
        { field: 'owner', headerName: 'Owner', width: 130 },
        { field: 'price', headerName: 'Price (Ether)', width: 130 },
        { field: 'status', headerName: 'For Sale', width: 130 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Action',
            width: 180,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => { handle_edit(params) }}
                />
            ]
        }
    ];
    const request_columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'game', headerName: 'Game', width: 130 },
        { field: 'account', headerName: 'Account', width: 130 },
        { field: 'description', headerName: 'Description', width: 130 },
        { field: 'owner', headerName: 'Owner', width: 130 },
        { field: 'price', headerName: 'Price (Ether)', width: 130 },
        { field: 'your_token', headerName: 'Your Token', width: 130 },
        { field: 'your_game', headerName: 'Your Game', width: 130 },
        { field: 'your_account', headerName: 'Your Account', width: 130 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Action',
            width: 180,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Check />}
                    label="Accept"
                    onClick={() => { handle_accept(params) }}
                />,
                <GridActionsCellItem
                    icon={<Close />}
                    label="Reject"
                    onClick={() => { handle_reject(params) }}
                />
            ]
        }
    ];
    const [refresh, setRefresh] = React.useState(false)
    const [account, setAccount] = React.useState('')
    const [event, setEvent] = React.useState(null)
    const [rows, setRows] = React.useState([])
    const [token, setToken] = React.useState('')
    const [edit, setEdit] = React.useState(false)
    const [cur_token_for_sale, setCur_token_for_sale] = React.useState(false)
    const [change_sale, setChange_sale] = React.useState(false)
    const [description, setDescription] = React.useState('')
    const [des_change, setDes_change] = React.useState(false)
    const [request_row, setRequest_row] = React.useState([])
    const location = useLocation();
    //handle edit, set the state of the token
    const handle_edit = (params) => {
        setToken(params.row.id)
        setCur_token_for_sale(params.row.status)
        setPrice(params.row.price)
        setDescription(params.row.description)
        setEdit(true)
    }
    const handle_accept = async (params) => {
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        await contract.methods.tokenExchange(params.row.your_token, params.row.id).send({ from: accounts[0] })
        setRefresh(!refresh)
    }
    const handle_reject = async (params) => {
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        await contract.methods.rejectRequest(params.row.your_token).send({ from: accounts[0] })
        setRefresh(!refresh)
    }
    //load blockchain data
    const loadBlockchainData = async () => {
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        const tokens = await contract.methods.getGameAccountTokens().call({ from: accounts[0] })
        //fetch token data from blockchain
        let row = [];
        let request_row = [];
        console.log(tokens)
        for (let i = 0; i < tokens.length; i++) {
            const token = await contract.methods.getGameAccountDetails(tokens[i]).call({ from: accounts[0] })
            row.push({
                id: tokens[i],
                account: token[2],
                game: token[1],
                password: token[3],
                description: token[4],
                price: web3.utils.fromWei(token[5]),
                owner: token[6],
                status: token[7],
            })
            if (token[8] != 0) {
                const requestToken = await contract.methods.getGameAccountDetails(token[8]).call({ from: accounts[0] })
                request_row.push({
                    id: token[8],
                    your_token: tokens[i],
                    your_game: token[1],
                    your_account: token[2],
                    account: requestToken[2],
                    game: requestToken[1],
                    description: requestToken[4],
                    price: web3.utils.fromWei(requestToken[5]),
                    owner: requestToken[6],
                })
            }
        }
        setRequest_row(request_row)
        setRows(row)
        setEvent(contract)
        setAccount(accounts[0])
    }

    React.useEffect(() => {
        loadBlockchainData()
    }, [refresh])
    const naviagte = useNavigate();
    const modalClose = () => {
        setEdit(false)
        setToken('')
        setCur_token_for_sale(false)
        setPrice(0)
        setDescription('')
        setChange_sale(false)
        setDes_change(false)

    }
    // 1 eth = 1000000000000000000 wei
    const [price, setPrice] = React.useState(0)
    const submit_change = async () => {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(GAE_abi.abi, contract_address)
        contract.setProvider(web3.currentProvider)
        if (change_sale) {
            if (cur_token_for_sale) {
                await contract.methods.change_sale_state(token, web3.utils.toWei(price, 'ether')).send({ from: accounts[0] })
                setRefresh(!refresh)
                modalClose()
            } else {
                await contract.methods.change_sale_state(token, web3.utils.toWei(price, 'ether')).send({ from: accounts[0] })
                setRefresh(!refresh)
                modalClose()
            }
        }
        if (des_change) {
            await contract.methods.addDescriptionToToken(token, description).send({ from: accounts[0] })
            setRefresh(!refresh)
            modalClose()
        }

    }
    const handle_sale_change = () => {
        setCur_token_for_sale(!cur_token_for_sale)
        setChange_sale(!change_sale)
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
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Requests
                </Typography>
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
                        rows={request_row}
                        columns={request_columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                    />
                </div>
            </Box>
            <Modal
                open={edit}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{ ...style, width: 400 }} component="form">
                    <h2 id="child-modal-title">Edit token</h2>
                    <div>
                        <Stack direction='column' spacing={1}>
                            <FormControlLabel control={<Switch checked={cur_token_for_sale} onChange={handle_sale_change} />} label="For sale" />
                            <TextField id="standard-basic" label="Price" value={price} onChange={(e) => { setPrice(e.target.value) }} disabled={!cur_token_for_sale} />
                            <TextField id="standard-basic" label="Description" value={description} onChange={(e) => {
                                setDescription(e.target.value);
                                setDes_change(true);
                            }} />
                        </Stack>
                    </div>

                    <Stack sx={{ marginTop: '10%' }} direction='row' spacing={15}>
                        <Button onClick={submit_change} variant='contained'>Save</Button>
                        <Button onClick={modalClose} variant='contained' color='error'>Cancel</Button>
                    </Stack>
                </Box>
            </Modal>
        </Box>
    );
}


Inventory.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window: PropTypes.func,
};

export default Inventory;