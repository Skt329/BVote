const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

// Define the Voter schema
const voterSchema = new mongoose.Schema({
  voterId: String,
  name: String,
  age: Number,
  gender: String,
  constituency_name: String,
  constituency: Number,
  isRegistered: Boolean,
});

const Voter = mongoose.model('Voter', voterSchema);

// Define the Relayer schema
const relayerSchema = new mongoose.Schema({
  constituency: Number,
  relayerAddress: String,
  relayerPrivateKey: String,
});

const Relayer = mongoose.model('Relayer', relayerSchema);

// Contract address (assuming it's in your .env file)
const contractArtifact = JSON.parse(fs.readFileSync('./src/contracts/BVote.sol/BVote.json', 'utf8'));
const contractABI = contractArtifact.abi;
const deploymentInfo = JSON.parse(fs.readFileSync('../deployment.json', 'utf8'));
const contractAddress = deploymentInfo.address;

router.get('/reg', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/register.html'));
});

router.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/admin.html'));
});

router.post('/api/register', async (req, res) => {
  try {
    const { voterId, constituency } = req.body;

    console.log('Received registration request:', voterId, constituency);

    // Check if the voter exists in the database
    const voter = await Voter.findOne({ voterId, constituency });

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    // Retrieve the relayer data for the constituency
    const relayer = await Relayer.findOne({ constituency });

    if (!relayer) {
      return res.status(404).json({ error: 'Relayer not found' });
    }

    // Create a transaction object
    const transactionData = {
      rpcUrl: 'http://127.0.0.1:8545',
      relayerAddress: relayer.relayerAddress,
      gasLimit: 200000,
      gasPrice: BigInt(10) * BigInt(10 ** 9),
    };

    const Voterdetails = {
      voterId: voter.voterId,
      name: voter.name,
      age: voter.age,
      gender: voter.gender,
      constituency_name: voter.constituency_name,
      constituency: voter.constituency
    };

    transactionData.gasPrice = transactionData.gasPrice.toString();

    // Send the required data to the client
    res.json({
      contractAddress,
      contractABI,
      transactionData,
      Voterdetails
    });
  } catch (error) {
    console.error('Error registering voter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/login', async (req, res) => {
  try {
    const { voterId } = req.body;

    console.log('Received Voter Id:', voterId);

    // Check if the voter exists in the database
    const voter = await Voter.findOne({ voterId });

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
    }
    const constituency = voter.constituency;

    // Retrieve the relayer data for the constituency
    const relayer = await Relayer.findOne({ constituency });

    if (!relayer) {
      return res.status(404).json({ error: 'Relayer not found' });
    }
    
    // Create a transaction object
    const transactionData = {
      rpcUrl: 'http://127.0.0.1:8545',
      relayerAddress: relayer.relayerAddress,
      gasLimit: 200000,
      gasPrice: BigInt(10) * BigInt(10 ** 9),
    };
    transactionData.gasPrice = transactionData.gasPrice.toString();

    const Voterdetails = {
      voterId: voter.voterId,
      name: voter.name,
      age: voter.age,
      gender: voter.gender,
      constituency_name: voter.constituency_name,
      constituency: voter.constituency
    };
    // Send the required data to the client
    res.json({
      contractAddress,
      contractABI,
      transactionData,
      Voterdetails
    });
  } catch (error) {
    console.error('Error logging in voter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/deployment.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../deployment.json'));
  });

router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/index.html'));
});

module.exports = router;
