# Water Project
**Requirements:**
- NodeJS (https://nodejs.org/en/download/package-manager)

- Running MongoDB instance, at default port 27017.
    - macOS: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/
    - Windows: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/
 
- NPM package: concurrently
    - Run on terminal or powershell `npm install -g concurrently`.    `sudo` may be necessary if permissions are denied.
--------
**Running steps**
- At the root directory "water-project", enter in your terminal/powershell `yarn start`.
  - If it fails, you may have to run `yarn install` beforehand. To be safe, you can run it in each of the main folders (root, client, server)
- Alternatively: Run `yarn start` in the "server" folder, then in a new tab of your terminal/PS, run `yarn start` in the "client" folder.
