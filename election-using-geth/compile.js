const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");
const contractName = "Item.sol";
const contracts = [];
fs.readdirSync("contracts").forEach(file => {
  contracts.push(file);
});

sources = {};
contracts.forEach(contract => {
  //if(contract == 'Item.sol' || contract == 'ERC721.sol') {
    sources[contract] = {
      content: fs.readFileSync(
        path.resolve(__dirname, "contracts", contract),
        "utf8"
      )
    };
 // } 
});

// Functions

/**
 * Makes sure that the build folder is deleted, before every compilation
 * @returns {*} - Path where the compiled sources should be saved.
 */
compilingPreparations = () => {
  const buildPath = path.resolve(__dirname, "build/contracts");
  console.log("buildpath====>", buildPath);
  fs.removeSync(buildPath);
  return buildPath;
};

/**
 * Returns and Object describing what to compile and what need to be returned.
 */
createConfiguration = () => {
  console.log();
  return {
    language: "Solidity",
    sources: sources,
    settings: {
      outputSelection: {
        // return everything
        "*": {
          "*": ["abi", "evm.bytecode"]
        }
      }
    }
  };
};

/**
 * Compiles the sources, defined in the config object with solc-js.
 * @param config - Configuration object.
 * @returns {any} - Object with compiled sources and errors object.
 */
compileSources = config => {
  try {
     console.log("compiled code====>",  solc.compile(JSON.stringify(config))); // solc.compile(JSON.parse(JSON.stringify(config)))
    fs.writeFileSync('./oldsolabi.txt',solc.compile(JSON.stringify(config)));
    return JSON.parse(solc.compile(JSON.stringify(config)));
  } catch (e) {
    console.log(e);
  }
};

/**
 * Searches for dependencies in the Solidity files (import statements). All import Solidity files
 * need to be declared here.
 * @param dependency
 * @returns {*}
 */
getImports = dependency => {
  console.log("Searching for dependency: ", dependency);
  switch (dependency) {
    case contractName:
      return {
        contents: fs.readFileSync(
          path.resolve(__dirname, "contracts", "ERC721.sol"),
          "utf8"
        )
      };
    /*case 'AnotherImportedSolidityFile.sol':
            return {contents: fs.readFileSync(path.resolve(__dirname, 'contracts', 'AnotherImportedSolidityFile.sol'), 'utf8')};*/
    default:
      return { error: "File not found" };
  }
};

/**
 * Shows when there were errors during compilation.
 * @param compiledSources
 */
errorHandling = compiledSources => {
  if (!compiledSources) {
    console.error(
      ">>>>>>>>>>>>>>>>>>>>>>>> ERRORS <<<<<<<<<<<<<<<<<<<<<<<<\n",
      "NO OUTPUT"
    );
  } else if (compiledSources.errors) {
    // something went wrong.
    console.error(">>>>>>>>>>>>>>>>>>>>>>>> ERRORS <<<<<<<<<<<<<<<<<<<<<<<<\n");
    compiledSources.errors.map(error => console.log(error.formattedMessage));
  }
};

/**
 * Writes the contracts from the compiled sources into JSON files, which you will later be able to
 * use in combination with web3.
 * @param compiled - Object containing the compiled contracts.
 * @param buildPath - Path of the build folder.
 */
writeOutput = (compiled, buildPath) => {
  fs.ensureDirSync(buildPath);

  for (let contractFileName in compiled.contracts) {
    const contractName = contractFileName.replace(".sol", "");
    console.log("Writing: ", contractName + ".json");
    fs.outputJsonSync(
      path.resolve(buildPath, contractName + ".json"),
      compiled.contracts[contractFileName][contractName]
    );
  }
};

// Workflow

const buildPath = compilingPreparations();
const config = createConfiguration();
const compiled = compileSources(config);
errorHandling(compiled);
writeOutput(compiled, buildPath);
