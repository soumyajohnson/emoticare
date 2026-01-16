import pytest
from flask_mongoengine import MongoEngine
from server.app import create_app
from server.config import TestConfig
from mongoengine import disconnect

@pytest.fixture
def app():
    disconnect(alias='default')
    app = create_app(TestConfig)
    
    yield app
    
    disconnect(alias='default')

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()