// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Software is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string private baseURI;
    uint256 cost = 0.05 ether;
    uint256 MAX_SUPPLY = 10_000;
    uint256 MAX_MINT_AMOUNT = 10;
    bool isSaleActive = true;

    constructor() ERC721("Software", "SEN") {
        setBaseURI("BASE_URI");
        ownerMint(10);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setSaleState() public onlyOwner {
        isSaleActive = !isSaleActive;
    }

    function ownerMint(uint256 quantity) public onlyOwner {
        uint256 supply = totalSupply();

        for (uint256 i = 1; i <= quantity; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function mint(uint256 mintAmount) public payable {
        uint256 supply = totalSupply();

        require(isSaleActive, "Sale is paused.");
        require(
            mintAmount > 0 && mintAmount <= MAX_MINT_AMOUNT,
            "You can not mint more than 10."
        );
        require(
            supply + mintAmount <= MAX_SUPPLY,
            "Maximum supply of tokens reached."
        );
        require(
            msg.value >= mintAmount * cost,
            "Not enough value of ETH sent."
        );

        for (uint256 i = 1; i <= mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function withdraw() public payable onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }

    function adminMint(uint256 mintAmount) public payable onlyOwner {
        require(isSaleActive, "Sale is paused.");
        require(
            mintAmount > 0 && mintAmount <= MAX_SUPPLY,
            "You can not mint more than the max supply."
        );

        uint256 supply = totalSupply();

        for (uint256 i = 1; i <= mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }
}
