# BIMServer-Node
BIMServer NodeJS Integration

## Neo4j REST-API Postman Collection
[Download the collection from here](https://www.getpostman.com/collections/1157a49441add1a4a13f)

## How to Retrieve Node Entities and Relationships from BIMServer
We run the `app.post('/getRevisionSummary')` api and it triggers the following functions to retrieve all data entities, relationships and link them to each other

`api.ServiceInterface.getAllRevisionsOfProject`
	We retrieve the poid (project id) number of the last revision

`api.ServiceInterface.getProjectByPoid`
	We retrieve the data of the selected project/subproject and store road (revision) in res.locals

`api.ServiceInterface.getRevisionSummary`
	We pass the roid from res.locals, and BIMServer prepares all the data to be downloaded including data entities, 	relationships in a JSON
	We store this data in res.locals with var data

`api.PluginInterface.getSerializerByPluginClassName`
	We define the in which format will the data be downloaded. We choose the JSON format. It returns an serialised id.

`api.ServiceInterface.download`
	This function generates a download topicId to download data later.

`api.ServiceInterface.downloadServlet`
	This functions downloads the data in JSON format
	In the response, we retrieve the data entities and relationships in IFCEntitiesArray and IFCRelationshipArray

`api.NotificationRegistryInterface.getProgress`
	This function logs the download progress state

`api.Neo4j.batchMerge3`
	This function runs batch import of all node entities collected from BIMServer. There is a uniqueness constraint on the 	oid of BIMServer data

`api.Neo4j.batchLabel`
	In “batchMerge3” Neo4j API did not allow to generate the LABELS of nodes dynamically. We SET the labels of Nodes 	with this function

`api.Neo4j.batchRel`
	This function MATCH each node and assign the unique relationships between each other. It reads the relationships 	from IFCRelationshipArray and assigns bi-directionally if needed.

`api.ServiceInterface.cleanupLongAction`
	This function makes cleaning for next api calls.
