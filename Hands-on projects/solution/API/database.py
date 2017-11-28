from pymongo import MongoClient

class DatabaseClient:
    def __init__(self, db_name):
        _server_name = 'localhost'
        _mongodb_port = 27017
        self._client = MongoClient(_server_name, _mongodb_port)
        self._db = self._client[db_name]


    def get_client(self):
        return self._db

    def get_data_from_collection(self, collection_name):
        return list(self._db[collection_name].find())
