# Massa Burner 🔥

End of year bonfire - Burn MAS on the Massa blockchain!

## Overview

This project consists of:
- **Smart Contract**: An AssemblyScript smart contract that handles burning MAS tokens
- **Frontend**: A React-based web interface deployable on Massa DeWeb

## Smart Contract

The smart contract allows users to burn MAS by sending them to the null address. It tracks:
- Total amount of MAS burned
- Individual burn history (newest first)
- Leaderboard of top burners

### Features
- `burn()`: Burn MAS coins sent with the transaction
- `getTotalBurnedAmount()`: Get the total amount of MAS burned
- `getBurnCount()`: Get the total number of burn operations
- `getAddressBurnedAmount(address)`: Get total burned by a specific address

### Deployment

```bash
cd smart_contract
npm install
npm run build
WALLET_SECRET_KEY=your_secret_key npm run deploy
```

## Frontend

A festive Christmas-themed interface for interacting with the burner contract.

### Development

```bash
cd front
npm install
npm run dev
```

### Building

```bash
npm run build
```

### DeWeb Deployment

```bash
SECRET_KEY=your_secret_key npx @massalabs/deweb-cli upload dist -y --accept_disclaimer
```

## Deployed Addresses (Mainnet)

- **Smart Contract**: `AS14T6cJRdt8FaNDo7f3AhhAv6gt8zWMT8tFuSsDgp7GxEeW26Xt`
- **DeWeb Frontend**: `AS1FqcKkqgML4nnL41waHbv2sAkrrskMwAhDdiVybhtyDDvuNVjc`

## License

MIT

