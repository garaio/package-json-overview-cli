var fs = require('fs');
var path = require('path');
const { execSync } = require('child_process');
const { exit } = require('process');
const args = process.argv.slice(2);

// Fallback directory, is where you execute it
let filePath = process.cwd();
let argumentCommand = args[0];
let packageFilter = args[1] ?? "vue@v2-latest";
let packageName = packageFilter.split('@')[0]; // package name
let command = "";

// No argument shows help / info
if (args.length === 0) {
  console.log(`
  ### Missing arguments. Please provide:

  * template
  * package-filter
  * directory to scan (optional - takes current directory as fallback)
  
  # node ${path.basename(process.argv[1])} TEMPLATE PACKAGE PATH/TO/DIRECTORY/TO/SCAN

  Examples:

  # node ${path.basename(process.argv[1])} template-packageVersion vue
  # node ${path.basename(process.argv[1])} template-packageVersion vue@2
  # node ${path.basename(process.argv[1])} template-packageVersion vue C:/path/to/some/other/directory
  
  `);
  exit();
} else if (args.length >= 1) {
  // 1st argument defines the command to execute (can be any command or a template)
  if (argumentCommand.startsWith("template-")) {
    // Define templates for quick access
    switch (argumentCommand) {
      case 'template-packageVersion': {
        command = `npm ls ${packageFilter} --depth=0`;
        break;
      }
    }
  } else {
    command = argumentCommand;
  }
}

// 3nd Argument can override the path
if (args.length >= 3) {
  filePath = path.join(args[2]);
}


// Vars
let amountOfFoundPackages = 0;
let amountOfPackageJson = 0;
let summary = [];
let latestVersionOfPackageFilter = "";
let latestVersionOfPackageName = "";

function template_PackageVersionOverview(output) {
  let projectInfos = {
    project: "",
    package: "",
    installed: "",
    latest: "",
    status: "",
  }

  const lines = output.split('\n');
  // Get project name
  const firstLine = lines[0];
  projectInfos.project = firstLine.split(' ')[0];

  // Get version number and other infos
  for (const line of lines) {
    // Debugger and console output are not the same :-/
    if (line.startsWith('`-- ') || line.startsWith('└── ')) {
      const package = line.split('@')[0].trim().replace('`-- ', '').replace('└── ', '');
      const installed = line.split('@')[1].trim();
      projectInfos.installed = installed;
      projectInfos.package = package;
      projectInfos.latestPackageVersion = latestVersionOfPackageName;
      projectInfos.latest = latestVersionOfPackageFilter;
      projectInfos.status = latestVersionOfPackageFilter !== installed ? "❗" : "✅";
      break;
    }
  }
  return projectInfos;

}

function findPackageJson(filePath) {
  return new Promise((resolve, reject) => {
    fs.readdir(filePath, async function (err, items) {
      // console.log(":folder:", filePath);
      if (items) {
        for (var i = 0; i < items.length; i++) {
          var file = path.join(filePath, items[i]);
          // ignore node_modules and .git etc files
          if (items[i].match("node_modules") || items[i].startsWith(".")) {
            continue;
          }
          if (file.indexOf('package.json') >= 0) {
            amountOfPackageJson++;
            // indicate progress - we found a package.json
            process.stdout.write('.');

            try {
              // Condition check - only execute command when this returns something
              const output = execSync(`npm ls ${packageFilter} --depth=0`, { cwd: filePath }).toString();
              let projectInfos = [];

              // Condition was successful
              process.stdout.write('!');

              // Prepare all the projectInfos
              projectInfos = template_PackageVersionOverview(output);

              // Template packageVersion
              if (argumentCommand === "template-packageVersion") {
                // Don't do anything, just print summary
              } else {
                // If not template, just execute the given command
                // TODO: unsure why some commands are not having any output yet - improve this (npm-upgrade, npm audit etc.)
                const commandOutput = execSync(command, { cwd: filePath }).toString();
                // For now we add a new column with the command output
                projectInfos.commandOutput = commandOutput.trim();
              }

              // Add infos to summary
              summary.push(projectInfos);


              amountOfFoundPackages++;

              // console.log("-------------------\n");
              // console.log("   PROJECT FOUND\n");
              // console.table(projectInfos);

            } catch (error) {
              // console.log("  --> error");
            }
          } else {
            try {
              const stat = await fs.promises.stat(file);
              if (stat.isDirectory()) {
                await findPackageJson(file);
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
      resolve();
    });
  });
}

// Check for current version number
function checkLatestVersion() {
  // Version of package filter
  const latestVersionByFilter = execSync(`npm info ${packageFilter} version`).toString().trim();
  const lines = latestVersionByFilter.split('\n');
  // Get latest version number, if multiple versions exist
  const lastLine = lines[lines.length - 1];
  // If there are multiple version, the last version line needs to be split, otherwise just take the line
  latestVersionOfPackageFilter = lastLine.split(' ')[1]?.replace(/'/g, "") ?? lastLine;
  console.log(`Latest version of ${packageFilter} filter seems to be: ${latestVersionOfPackageFilter}`);

  // Version of package name
  latestVersionOfPackageName = execSync(`npm info ${packageName} version`).toString().trim();
  console.log(`Latest version of ${packageName} itself, seems to be: ${latestVersionOfPackageName}`);
}

//
// Run this script
//
console.log("\n  ### GARAIO POT (Package.json) Overview Tool ###\n");

checkLatestVersion();

console.log(`\nSearching for installed "${packageFilter}" packages in "${filePath}"...`);
// Find all installed packages in the given directory
findPackageJson(filePath).then(() => {
  console.log("\n\n");
  console.log("Amount of package.json files: " + amountOfPackageJson);
  console.log("Amount of installations of this package: " + amountOfFoundPackages);
  console.table(summary);
})