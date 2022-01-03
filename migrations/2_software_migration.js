const Software = artifacts.require("Software");

module.exports = function (deployer) {
  deployer.deploy(Software);
};
