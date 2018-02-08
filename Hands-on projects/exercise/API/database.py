from pymongo import MongoClient

class DatabaseClient:
    def __init__(self, db_name):
        self._server_name = 'localhost'
        self._mongodb_port = 27017
        self._client = MongoClient(self._server_name, self._mongodb_port)
        self._db = self._client[db_name]

    def get_client(self):
        return self._client

    def get_data_from_collection(self, collection_name):
        return list(self._db[collection_name].find())
