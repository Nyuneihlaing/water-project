# Water Project
**Requirements:**
- NodeJS (https://nodejs.org/en/download/package-manager)

- Yarn (Obtained through npm, see running steps below)

- Running MongoDB instance, at default port 27017.
    - macOS: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/
    - Windows: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/

--------
**Running steps**
- At the root directory "water-project", enter in your terminal/powershell `npm install yarn`. Then enter `yarn run install-all`, followed by `yarn start`.
  - This should install all of the necessary dependencies that are not already included in the repository, before running the program. 
- Alternative startup: After installing via `yarn run install-all`, run `yarn start` in the "server" folder, then in a new tab of your terminal/PS, run `yarn start` in the "client" folder.
