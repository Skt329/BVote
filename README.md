# BVote README

## Overview

BVote is a decentralized voting application built on the Ethereum blockchain using Solidity smart contracts and the Hardhat development environment. This project allows users to register as voters, register political parties, and cast votes in a secure and transparent manner. The application leverages Web3.js for interaction with the Ethereum blockchain.

## Features

- **Voter Registration**: Voters can register with a unique ID and password.
- **Party Registration**: Admins can register political parties for elections.
- **Voting**: Registered voters can cast their votes for registered parties.
- **Election Management**: Admins can create and manage elections, including setting deadlines.
- **Secure Authentication**: Voter login is secured using hashed passwords.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v12 or later)
- npm (Node Package Manager)
- Hardhat
- MetaMask or another Ethereum wallet

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/VotingApp.git
cd VotingApp
```

### 2. Install Dependencies

Navigate to the project directory and install the required dependencies:

```bash
npm install
```

### 3. Compile the Smart Contracts

Compile the smart contracts using Hardhat:

```bash
npx hardhat compile
```

### 4. Deploy the Smart Contracts

You can deploy the smart contracts to a local Hardhat network or a test network. To deploy to a local network, run:

```bash
npx hardhat node
```

In another terminal, deploy the contracts:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Running Tests

To ensure everything is working correctly, run the tests provided in the project:

```bash
npx hardhat test
```

### 6. Frontend Setup

Navigate to the `frontend` directory and install the frontend dependencies:

```bash
cd frontend
npm install
```

### 7. Running the Frontend

Start the frontend application:

```bash
npm start
```

This will launch the application in your default web browser.

## Usage Instructions

### Admin Functions

- **Register Party**: Admins can register new political parties using the admin interface.
- **Create Election**: Admins can create elections with specified start and end times.
- **Register Candidates**: Admins can register candidates for specific elections.

### Voter Functions

- **Register Voter**: Voters can register using their unique ID and password.
- **Login**: Voters can log in to the application using their credentials.
- **Vote**: After logging in, voters can select a party and cast their vote.

### Example Commands

Here are some example commands for interacting with the smart contract:

- **Register a Party**:
```javascript
await contract.methods.registerParty(partyNumber, partyName).send({ from: adminAddress });
```

- **Register a Voter**:
```javascript
await contract.methods.registerVoter(voterIdHash, passwordHash, constituency).send({ from: relayerAddress });
```

- **Vote**:
```javascript
await contract.methods.vote(partyNumber, voterIdHash).send({ from: relayerAddress });
```

## Code Structure

- **contracts/**: Contains the Solidity smart contracts.
  - `BVote.sol`: The main smart contract for the voting application.
  
- **frontend/**: Contains the frontend application built with HTML, CSS, and JavaScript.
  - `src/`: Contains the source code for the frontend.
  - `src/admin.js`: Handles admin functionalities.
  - `src/client.js`: Handles voter functionalities.

- **scripts/**: Contains deployment scripts for the smart contracts.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hardhat](https://hardhat.org/) for the development environment.
- [Web3.js](https://web3js.readthedocs.io/) for interacting with the Ethereum blockchain.

---

This README provides a comprehensive overview of the VotingApp project, including setup instructions, usage, and code structure. If you have any questions or need further assistance, feel free to reach out!
