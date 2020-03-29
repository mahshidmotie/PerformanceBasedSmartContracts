var PerformanceCheck = artifacts.require("./PerformanceCheck.sol");

module.exports = function(deployer) {
  deployer.deploy(PerformanceCheck);
};
