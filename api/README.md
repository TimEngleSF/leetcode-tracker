# lc-tracker-api

## Auth

### POST `/auth/register`

This endpoint allows users to register by creating a new account. The HTTP POST
request should be sent to `/auth/register` with the required payload in the raw
request body.

#### Request Body

```
{
    "email": "lc-tracker@example.com",
    "username": "LC-Tracker",
    "firstName": "Leet",
    "lastInit": "C",
    "password": "password"
}
```

#### Response

Upon successful registration, the endpoint returns a status code of 201 with a
response body containing the status message.

Example:

```json
{
    "status": "pending"
}
```

### POST `/auth/login`

This endpoint allows users to authenticate and log in via a POST request to the
specified URL. The request should include a JSON payload in the raw request body
with the user's email and password.

#### Request Body

```
{
    "email": "lc-tracker@example.com",
    "password": "password"
}
```

#### Response

Upon successful authentication, the server responds with a status code of 200
and a JSON object containing the user's details and a authentication token.

Example:

```
{
    "user": {
        "_id": "657404d744f63a74c4de5f3f",
        "username": "LC-Tracker",
        "email": "lc-tracker@example.com",
        "firstName": "Leet",
        "lastInit": "C",
        "status": "verified",
        "lastActivity": "2023-12-09T06:17:54.278Z",
        "groups": [],
        "admins": []
    },
    "token": <jsonwebtoken>
}
```

## Protected Routes

The following routes all require the user to include an authorization header
that contains the jsonwebtoken assigned at login.

Example:

```
Authorization: 'Bearer <jsonwebtoken>'
```

### GET `/auth/status`

This endpoint is used to retrieve the status and information related to the
authentication and app information.

### Response

```json
{
    "status": "",
    "appInfo": {
        "_id": "",
        "messages": {
            "updateMessages": {
                "cli": ""
            }
        },
        "cliInfo": {
            "version": "",
            "released": ""
        },
        "created": ""
    }
}
```
