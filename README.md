## ISEL - Introdução à Programação na Web
### LEIC31D - Inverno de 2021/2022
App borga - Your own board games collection

With this project you have the possibility to create your own board game collection as well as creating your groups of games. All data is provided using game atlas [API](https://api.boardgameatlas.com/)


#### Prerequisites
* [Node.js](https://nodejs.org/en/)
* [Elasticsearch](https://www.elastic.co/pt/elasticsearch/)
* [Board Game atlas account](https://www.boardgameatlas.com/api/docs)  

## Instructions on how to launch
* Get your own board games atlas id in the link above.  
* Set your environment variable ATLAS_CLIENT_ID.  
* In the project folder open cmd and type 'npm start'.  
* If the server node is configured to use elasticsearch then run elasticsearch.bat in the elasticsearch-X.XX.X/bin folder.  
* Open https://localhost:8888/ in your browser.  
##

## Structure
![Graph](static-files\Graph.png)  

##
### Games data
This node does all things related to the board games atlas api.  
It queries the api to get information such as games, details and information like mechanics or categories.  
Uses fetch to query the api and  our errors node to throw any error that might occur.  
You need to set your board games atlas key as ATLAS_CLIENT_ID environment variable in order to access the api.
All data is stored in separate objects that are later used in services node.  

### Data Mem
This node is responsible for storing, manipulating and checking for data in the local machine.  
It stores user tokens, users, games and groups.
All processing is done asynchronously.  

### Data Es (Elasticsearch)
This node does everything data mem does, but it uses local database provided by elasticsearch.  
Everything is done using fetch node with localhost:9200 as the default port.    
There are three predefined indexes, one to store the user, other for the games fetched from the BoardGameAtlas API, and other for the user tokens.  
There is also an "infinite" amount of indexes that are defined when creating groups.
All processing is done asynchronously.


### Errors
This node builds a list of error to be used by our application.

### Services
This node does the link between the Data and the Api/Website.  
It adds upon the data with verifications.  
Uses the error's node in order to throw any error that might occur.  

### Web Api
This node uses express in order to create our own REST API.
Uses functions from the services node  
All Api URIs and routing is done in this node.

### Web Site
This node takes care of the website page, it uses hbs code from 'views' folder in order to render pages.
Uses functions form the services node
All Web specific URIs and routning is done in this node.

### Config
Simple node with guest data and elasticsearch default port

### Server
Configures express and passport properly and the server with all the components.

### Launch
Uses server node in order to launch the program.  
Also contains information such as elasticsearch uri prefix and the port to be used.





