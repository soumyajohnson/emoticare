def test_register_login(client):
    # Register
    resp = client.post('/auth/register', json={
        'email': 'test@example.com',
        'password': 'securepassword'
    })
    assert resp.status_code == 201

    # Login
    resp = client.post('/auth/login', json={
        'email': 'test@example.com',
        'password': 'securepassword'
    })
    assert resp.status_code == 200
    assert 'access_token' in resp.json

def test_login_invalid(client):
    resp = client.post('/auth/login', json={
        'email': 'wrong@example.com',
        'password': 'password'
    })
    assert resp.status_code == 401
