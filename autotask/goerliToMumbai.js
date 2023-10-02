const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  const payload = data.request.body.events;

  const provider = new DefenderRelayProvider(data);
  const signer = new DefenderRelaySigner(data, provider, { speed: "fast" });
};
