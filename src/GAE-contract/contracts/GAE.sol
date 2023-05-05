//SPDX-License-Identifier: UNLICENSED
// smart contract for the project named Game account exchanger
pragma solidity ^0.8.0;
// generate the template
//import erc721 from openzeppelin
// define the smart contract
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


contract GameAccountExchanger is ERC721Enumerable  {
    // constructor
    constructor() ERC721("GameAccountExchanger", "GAE") {}
    // define the struct with transaction history
    struct GameAccount {
        uint256 id;
        string gameName;
        string accountName;
        string password;
        string description;
        uint256 price;
        address payable owner;
        bool forSale;
        uint256 request;
    }
    // define the mapping
    mapping(uint256 => GameAccount) public gameAccounts;
    // define the event
    event GameAccountCreated(
        uint256 id,
        string gameName,
        string accountName,
        string password,
        string description,
        uint256 price,
        address payable owner,
        bool forSale,
        uint256 request
    );
    modifier onlyOwner(uint256 _id) {
        require(
            gameAccounts[_id].owner == msg.sender,
            "You do not own this game account"
        );
        _;
    }
    // define the function createGameAccount with AES encryption on the password
    function createGameAccount(
        string memory _gameName,
        string memory _accountName,
        string memory _password,
        string memory _description,
        uint256 _price
    ) public {
        // increment the game account id
        uint256 _id = totalSupply() + 1;
        // create the game account
        gameAccounts[_id] = GameAccount(
            _id,
            _gameName,
            _accountName,
            _password,
            _description,
            _price,
            payable(msg.sender),
            false,
            0
        );
        // mint the game account
        _mint(msg.sender, _id);
        // emit the event
        emit GameAccountCreated(
            _id,
            _gameName,
            _accountName,
            _password,
            _description,
            _price,
            payable(msg.sender),
            false,
            0
        );
    }
    // define the function to buy the game account
    function buyGameAccount(uint256 _id) public payable {
        // fetch the game account
        GameAccount memory _gameAccount = gameAccounts[_id];
        require(
            _gameAccount.price == msg.value,
            "You must pay the exact price of the game account"
        );
        // transfer the ownership
        _gameAccount.owner.transfer(msg.value);
        // transfer the ownership
        _transfer(_gameAccount.owner, msg.sender, _id);
        // update the game account
        gameAccounts[_id].owner = payable(msg.sender);
        // update the game account
        gameAccounts[_id].forSale = false;
    }
    //get the game account tokens related to the sender address
    function getGameAccountTokens() public view returns (uint256[] memory) {
        // get the balance of the sender
        uint256 _balance = balanceOf(msg.sender);
        // create the array
        uint256[] memory _gameAccountTokens = new uint256[](_balance);
        // loop through the balance
        for (uint256 i = 0; i < _balance; i++) {
            // get the token id
            uint256 _tokenId = tokenOfOwnerByIndex(msg.sender, i);
            // add the token id to the array
            _gameAccountTokens[i] = _tokenId;
        }
        // return the array
        return _gameAccountTokens;
    }
    // get the game account details
    function getGameAccountDetails(uint256 _id)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            address,
            bool,
            uint256
        )
    {
        // fetch the game account
        GameAccount memory _gameAccount = gameAccounts[_id];
        // return the game account
        return (
            _gameAccount.id,
            _gameAccount.gameName,
            _gameAccount.accountName,
            _gameAccount.password,
            _gameAccount.description,
            _gameAccount.price,
            _gameAccount.owner,
            _gameAccount.forSale,
            _gameAccount.request
        );
    }
    // get all the game tokens on the web that is for sale
    function getAllGameAccountTokensForSale()
        public
        view
        returns (uint256[] memory)
    {
        // get the total supply
        uint256 _totalSupply = totalSupply();
        // create the array
        uint256[] memory _gameAccountTokensForSale = new uint256[](_totalSupply);
        // loop through the total supply
        for (uint256 i = 0; i < _totalSupply; i++) {
            // get the token id
            uint256 _tokenId = tokenByIndex(i);
            // fetch the game account
            // check the game account is for sale
            _gameAccountTokensForSale[i] = _tokenId;
        }
        // return the array
        return _gameAccountTokensForSale;
    }
    //set the token not for sale, only owner
    function change_sale_state(uint256 _id, uint256 price) public onlyOwner(_id) {

        // update the game account
        gameAccounts[_id].forSale = !gameAccounts[_id].forSale;
        // update the game account
        gameAccounts[_id].price = price;
    }
    // Add description to the token
    function addDescriptionToToken(uint256 _id, string memory _description) 
        public onlyOwner(_id)
    {

        // update the game account
        gameAccounts[_id].description = _description;
    }
    //token exchange
    function tokenExchange(uint256 _id, uint256 _id2) public onlyOwner(_id){
        // fetch the game account
        GameAccount memory _gameAccount = gameAccounts[_id];
        // fetch the game account
        GameAccount memory _gameAccount2 = gameAccounts[_id2];
        // check the game account is owned by the seller
        require(
            _gameAccount2.owner != msg.sender,
            "You already own this game account"
        );
        // transfer the ownership
        _transfer(_gameAccount.owner, _gameAccount2.owner, _id);
        // transfer the ownership
        _transfer(_gameAccount2.owner, _gameAccount.owner, _id2);
        // update the game account
        gameAccounts[_id].owner = _gameAccount2.owner;
        // update the game account
        gameAccounts[_id2].owner = _gameAccount.owner;
        // update the request on the game account
        gameAccounts[_id].request = 0;
        gameAccounts[_id2].request = 0;
    }
    //request token exchange
    function requestTokenExchange(uint256 _id, uint256 _id2) public onlyOwner (_id2){
        // update the request on the game account
        gameAccounts[_id].request = _id2;
    }
    // reject
    function rejectRequest(uint256 _id) public onlyOwner(_id){
        // update the request on the game account
        gameAccounts[_id].request = 0;
    }

}