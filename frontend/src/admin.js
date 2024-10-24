// Connect to the Ethereum blockchain
let web3;
let contract;
let accounts;
let contractInstance;

async function initWeb3() {
	if (window.ethereum) {
		web3 = new Web3(window.ethereum);
		try {
			await window.ethereum.enable();
			
			// Check if we're on the correct network
			const networkId = await web3.eth.net.getId();
			if (Number(networkId) !== 1337) {
				// Try to switch to the local network
				try {
					await window.ethereum.request({
						method: 'wallet_switchEthereumChain',
						params: [{ chainId: '0x539' }], // 1337 in hex
					});
				} catch (switchError) {
					// Rest of your error handling...
				}
			}
			
			await initContract();
			await initAccount();
		} catch (error) {
			console.error("Error initializing Web3:", error);
			alert("Please connect to localhost:8545 network in MetaMask");
		}
	} else if (window.web3) {
		web3 = new Web3(web3.currentProvider);
		initContract();
		initAccount();
	} else {
		console.error("No web3 provider detected");
	}
}

async function initContract() {
	try {
		console.log('Initializing contract...');
		
		// Check network
		const networkId = await web3.eth.net.getId();
		console.log('Current network ID:', networkId); // This will show 1337n
		
		// Convert BigInt to Number for comparison
		if (Number(networkId) !== 1337) {
			throw new Error('Please connect to localhost:8545');
		}
		
		// Get contract ABI
		const response = await fetch('/contracts/BVote.sol/BVote.json');
		if (!response.ok) {
			throw new Error(`Failed to fetch contract ABI: ${response.statusText}`);
		}
		const contractArtifact = await response.json();
		console.log('Contract ABI loaded');

		// Get deployment info
		const deploymentResponse = await fetch('/deployment.json');
		if (!deploymentResponse.ok) {
			throw new Error(`Failed to fetch deployment info: ${deploymentResponse.statusText}`);
		}
		const deploymentInfo = await deploymentResponse.json();
		console.log('Deployment info loaded:', deploymentInfo);

		const contractABI = contractArtifact.abi;
		const contractAddress = deploymentInfo.address;
		
		console.log('Contract Address:', contractAddress);
		console.log('Network ID:', await web3.eth.net.getId());

		contract = new web3.eth.Contract(contractABI, contractAddress);
		console.log('Contract initialized successfully');
	} catch (error) {
		console.error('Error in initContract:', error);
		throw error;
	}
}

async function initAccount() {
	accounts = await web3.eth.getAccounts();
	if (accounts.length > 0) {
		console.log("Connected account: " + accounts[0]);
	} else {
		console.error("No account connected");
	}
}

// Function to convert a string to keccak256 hash with 0x prefix
function keccak256Hash(input) {
	const hash = web3.utils.keccak256(input);
	return hash;
}

// Register Party
const registerPartyForm = document.getElementById('register-party-form');
registerPartyForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const partyNumber = registerPartyForm.elements['partyNumber'].value;
	const partyName = registerPartyForm.elements['partyName'].value;

	try {
		const accounts = await web3.eth.getAccounts();
		await contract.methods.registerParty(partyNumber, partyName).send({ from: accounts[0] });
		alert('Party registered successfully');
	} catch (error) {
		console.error(error);
		alert('Error registering party');
	}
});

// Register Voter
const registerVoterForm = document.getElementById('register-voter-form');
registerVoterForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const voterId = registerVoterForm.elements['voterIdHash'].value;
	const password = registerVoterForm.elements['passwordHash'].value;
	const constituency = registerVoterForm.elements['constituency'].value;

	const voterIdHash = keccak256Hash(voterId);
	const passwordHash = keccak256Hash(password);

	try {
		const accounts = await web3.eth.getAccounts();
		await contract.methods.registerVoter(voterIdHash, passwordHash, constituency).send({ from: accounts[0] });
		alert('Voter registered successfully');
	} catch (error) {
		console.error(error);
		alert('Error registering voter');
	}
});

// Set Admin
const setAdminForm = document.getElementById('set-admin-form');
setAdminForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const newAdmin = setAdminForm.elements['newAdmin'].value;

	try {
		const accounts = await web3.eth.getAccounts();
		await contract.methods.setAdmin(newAdmin).send({ from: accounts[0] });
		alert('Admin set successfully');
	} catch (error) {
		console.error(error);
		alert('Error setting admin');
	}
});

// Set Relayer
const setRelayerForm = document.getElementById('set-relayer-form');
setRelayerForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const constituency = setRelayerForm.elements['relayerConstituency'].value;
	const relayer = setRelayerForm.elements['relayer'].value;

	try {
		const accounts = await web3.eth.getAccounts();
		await contract.methods.setRelayer(constituency, relayer).send({ from: accounts[0] });
		alert('Relayer set successfully');
	} catch (error) {
		console.error(error);
		alert('Error setting relayer');
	}
});


// View Results
// ... (existing code) ...

const viewResultsBtn = document.getElementById('view-results-btn');
viewResultsBtn.addEventListener('click', async (event) => {
	event.preventDefault();

	try {
		const partyResultCards = document.getElementById('party-result-cards');
		partyResultCards.innerHTML = '';

		const numParties = await contract.methods.numParties().call();

		for (let i = 1; i <= numParties; i++) {
			const party = await contract.methods.partyList(i).call();
			const partyCard = document.createElement('div');
			partyCard.classList.add('card');
			partyCard.setAttribute('data-party-number', i);
			partyCard.innerHTML = `
                <h3>${party.name}</h3>
                <p>Votes: ${party.voteCount}</p>
                <button class="view-party-votes-btn">View Votes by Constituency</button>
                <div class="party-votes-container"></div>
            `;
			partyResultCards.appendChild(partyCard);
		}
		document.getElementById('admin-actions').style.display = 'none';
		document.getElementById('result-card').style.display = 'block';
		document.getElementById('party-result-cards').style.display = 'flex';
		document.getElementById('party-result-cards').style.flexWrap = 'wrap';
		document.getElementById('constituency-votes-container').style.display = 'block';

		const viewPartyVotesBtns = document.querySelectorAll('.view-party-votes-btn');
		viewPartyVotesBtns.forEach(btn => {
			btn.addEventListener('click', async (event) => {
				event.preventDefault();
				event.stopPropagation(); // Stop the event from propagating to child elements
				const partyNumber = btn.closest('.card').dataset.partyNumber;
				const partyCard = btn.closest('.card');
				displayPartyVotesByConstituency(partyNumber, partyCard);
				
			});
		});
	} catch (error) {
		console.error(error);
		alert('Error fetching results');
	}
});

async function displayPartyVotesByConstituency(partyNumber, partyCard) {
	const allPartyVotesContainers = document.querySelectorAll('.party-votes-container');
	allPartyVotesContainers.forEach(container => {
		container.classList.remove('show');
	});

	const partyVotesContainer = partyCard.querySelector('.party-votes-container');
	partyVotesContainer.classList.toggle('show');

	if (partyVotesContainer.classList.contains('show')) {
		const partyVotesTable = document.createElement('table');
		const tableHead = document.createElement('thead');
		const tableBody = document.createElement('tbody');

		const headerRow = document.createElement('tr');
		const constituencyHeader = document.createElement('th');
		constituencyHeader.textContent = 'Constituency';
		headerRow.appendChild(constituencyHeader);
		const votesHeader = document.createElement('th');
		votesHeader.textContent = 'Votes';
		headerRow.appendChild(votesHeader);
		tableHead.appendChild(headerRow);
		partyVotesTable.appendChild(tableHead);

		const numParties = await contract.methods.numParties().call();
		for (let i = 1; i <= numParties; i++) {
			const dataRow = document.createElement('tr');

			const constituencyCell = document.createElement('td');
			constituencyCell.textContent = i;
			dataRow.appendChild(constituencyCell);

			const votesCell = document.createElement('td');
			const votes = await contract.methods.getPartyVoteCountByConstituency(i, partyNumber).call();
			votesCell.textContent = votes;
			dataRow.appendChild(votesCell);

			tableBody.appendChild(dataRow);
		}

		partyVotesTable.appendChild(tableBody);
		partyVotesContainer.innerHTML = '';
		partyVotesContainer.appendChild(partyVotesTable);
	}
}
// const partyCards = document.querySelectorAll('.card[data-party-number]');
// partyCards.forEach(card => {
//     card.addEventListener('click', async (event) => {
//         const partyNumber = event.currentTarget.dataset.partyNumber;
//         displayPartyVotesByConstituency(partyNumber);
//     });
// });
const getConstituencyVotesForm = document.getElementById('get-constituency-votes-form');
getConstituencyVotesForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const constituency = getConstituencyVotesForm.elements['constituency'].value;

	try {
		displayVotesByConstituency(constituency);
	} catch (error) {
		console.error(error);
		alert('Error fetching votes by constituency');
	}
});

async function displayVotesByConstituency(constituency) {
	const constituencyVotesTable = document.getElementById('constituency-votes-table');
	constituencyVotesTable.innerHTML = '';

	const table = document.createElement('table');
	const thead = document.createElement('thead');
	const tbody = document.createElement('tbody');

	const headerRow = document.createElement('tr');
	const partyHeader = document.createElement('th');
	partyHeader.textContent = 'Party';
	headerRow.appendChild(partyHeader);
	const votesHeader = document.createElement('th');
	votesHeader.textContent = 'Votes';
	headerRow.appendChild(votesHeader);
	thead.appendChild(headerRow);
	table.appendChild(thead);

	const numParties = await contract.methods.numParties().call();

	for (let i = 1; i <= numParties; i++) {
		const party = await contract.methods.partyList(i).call();
		const dataRow = document.createElement('tr');

		const partyCell = document.createElement('td');
		partyCell.textContent = party.name;
		dataRow.appendChild(partyCell);
		const votesCell = document.createElement('td');
		const votes = await contract.methods.getPartyVoteCountByConstituency(constituency, i).call();
		votesCell.textContent = votes;
		dataRow.appendChild(votesCell);

		tbody.appendChild(dataRow);
	}

	table.appendChild(tbody);
	constituencyVotesTable.appendChild(table);
}


$(document).ready(function () {
	initWeb3();
});

