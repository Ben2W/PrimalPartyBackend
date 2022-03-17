# Setting up the backend

## Cloning the repository

First, clone the backend repository to your local machine:

Make sure you cd into your desired directory and clone the repository with the following command: 

``` bash
git clone https://github.com/SpartanFA/PrimalPartyBackend.git
```
*NOTE* I recommend using **[Github Desktop](https://desktop.github.com/)** or **[GitKraken](https://www.gitkraken.com/)** which is included with Github Student

<br/><br/>


## Installing Dependancies

At this stage, you need to build your node modules, you can do that with the following command:

``` bash
npm install
```
### Environment Variables

In order to have access to the remote Azure database, you need to declare an environment variable containing the database secret.
You can access the keys here **[here](https://portal.azure.com/#@knights.ucf.edu/resource/subscriptions/d5003bfc-6944-4eea-b58f-3319eb079d93/resourceGroups/PrimalPartyRG/providers/Microsoft.DocumentDb/databaseAccounts/bwerner/mongoDbKeys)**

However we already set up a .env file, download the env file in the downloadables channel in discord.

*NOTE* the file name needs to change from **env** to **.env**, once you fixed the name simply add this file to your local primalpartybackend directory

<br/><br/>

## Running the Backend

Once you installed the dependancies and added the environment variable, you can run the backend with the following command: 

``` bash
npm start
```
The server can be viewed here: **[http://localhost:8080/](http://localhost:8080/)**

### Using Nodemon

**[nodemon](https://nodemon.io/)** is a useful tool for development. When you make changes the server will automatically restart.

install nodemon ***globally*** with this command:

``` bash
npm install -g nodemon 
```

Then to run the backend with nodemon run either

``` bash
npm run startdev

or 

nodemon server.js

```