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
* In the project folder open cmd and type 'npx nodemon'.  
* If the server node is configured to  use data es than run elasticsearch.bat in the elasticsearch-X.XX.X/bin folder.  
* Open https://localhost:8888/ in your browser.  
##

## Structure
![Graph](C:\Users\Antonio\Documents\GitHub\borga-ipw_pi-leicipw32d-g04\static-files\Graph.png)  

##
### Games data
This node does all things related to the board games atlas api.  
It queries the api to get information such as games, details and information like mechanics or categories.  
Uses fetch node to query the api and errors node to throw any error that might occur.  
You need to set your board games atlas key as ATLAS_CLIENT_ID environment variable in order to access the api.  
All data is store in separate objects that are later used in services node.  

### Data Mem
This node is responsible for storing, manipulating and checking for data in the local machine.  
It stores user tokens, users, games and groups.
All processing is done asynchronously.  

### Data Es (Elasticsearch)
This node does everything data mem does, but it uses local database provided by elasticsearch.  
Everything is done using fetch node with localhost:9200 as the default port.    
There are three defined indexes, user, games and token.  
There is also a fourth that is defined when creating groups.
All processing is done asynchronously.


### Errors
This node builds a list of error to be used by our application.

### Services
This node does the link between the Data and the Api/Website.  
It adds upon the data with thing like verifications and creating tokens.  
Uses the error's node in order to throw any error that might occur.  

### Web Api
This node uses express in order to create our own api.   
Take on services' node functions as middlewares.  
All uris and all routing is done in this node.

### Web Site
This node takes care of the website page it uses hbs code from 'views' folder in order to render pages.

### Config
Simple node with guest data and elasticsearch default port

### Server
Configures express and passport properly.

### Launch
Uses server node in order to launch the program.  
Also contains information such as elasticsearch uri prefix and the port to be used.





