// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Sample {
    string private message;

    constructor(string memory initialMessage) {
        message = initialMessage;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}
