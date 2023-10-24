// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CuyCollection is Initializable, ERC721Upgradeable, ERC721PausableUpgradeable, AccessControlUpgradeable, ERC721BurnableUpgradeable, UUPSUpgradeable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    bytes32 public root;
    
    mapping(uint256 => bool) public minted;


    event Burn(address account, uint256 id);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize()
        initializer public
    {
        __ERC721_init("Cuy Collection", "CCC");
        __ERC721Burnable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        root = 0x84bf1b2f55bd29c09b994e045d5e08c98e0a304b152696041b4443941ad8e8b7;

    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmUNrxeZyaGYPxK8zK8P3YpmkGAPAV25BtD2Rrdpc74qiw/";
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    //solo puede ser llamado por el Relayer de Open Zeppelin en Mumbai. 
    //Los ids permitidos van del 0 al 999 para este método.
    function safeMint(
        address _to,
        uint256 _tokenId
    ) public onlyRole(MINTER_ROLE) {
        require(_tokenId >= 0 && _tokenId <= 999, "ID Invalido");
        require(minted[_tokenId] == false, "ID no Disponible");
        _safeMint(_to, _tokenId);
        minted[_tokenId] = true;
    }

    //Que será llamado por cada una de las 1000 billeteras de la lista blanca.
    //Internamente este método valida que to y tokenId sean parte de la lista. Así también, se debe habilitar en 
    //el front-end una manera de solicitar las pruebas. Dado un address y un uint256, el front-end te entregará el 
    //array de pruebas a usarse como argumento de este método. Lleva whenNotPaused. Puede ser llamado por cualquiera.
    function safeMintWhiteList(
        address _to,
        uint256 _tokenId,
        bytes32[] calldata _proofs
    ) public {
        require(verify(_hashearInfo(_to, _tokenId), _proofs),"No eres parte de la WhiteList");
        _safeMint(_to, _tokenId);
        minted[_tokenId] = true;
    }

    //permite a los dueños de los ids en el rango de 1000 y 1999 (inclusivo) quemar sus NFTs a cambio de un repago de 
    //BBTKN en la red de Ethereum (Goerli). Este método emite el evento Burn(address account, uint256 id) que finalmente, 
    //cross-chain, dispara mint() en el token BBTKN en la cantidad de 10,000 BBTKNs.
    function buyBack(uint256 _id) public {

        require(_id >= 1000 && _id <= 1999, "No se puede Quemar este NFT");

        require(ownerOf(_id) == msg.sender, "No eres propietario del NFT");

        _burn(_id);

        emit Burn(msg.sender, _id);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) 
    internal virtual  override(
            ERC721Upgradeable, 
            ERC721PausableUpgradeable) {}


    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    function _hashearInfo(
        address to,
        uint256 tokenId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenId, to));
    }

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    function verify(
        bytes32 leaf,
        bytes32[] memory proofs
    ) public view returns (bool) {
        return MerkleProof.verify(proofs, root, leaf);
    }

    function actualizarRaiz(bytes32 _root) public onlyRole(MINTER_ROLE){
        root = _root;
    }
}




    