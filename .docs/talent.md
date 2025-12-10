Get a specific score using wallet, scorer slug, talent id or account identifier
GET
https://api.talentprotocol.com/score
Get a specific score using wallet, scorer slug, talent id or account identifier

Request
Query Parameters
id
string
required
Talent ID, wallet address or account identifier

account_source
string
Possible values: [farcaster, github, wallet]

The source of the account

scorer_slug
string
The slug of the scorer to filter the score. Default is the builder score scorer.

Header Parameters
X-API-KEY
string
required
Your Talent Protocol API key

Responses
200
401
Get score using Talent ID

application/json
Schema
Example (auto)
Get score using Talent ID
Schema
score
object
csharp
curl
dart
go
http
java
javascript
kotlin
c
nodejs
objective-c
ocaml
php
powershell
python
r
ruby
rust
shell
swift
FETCH
JQUERY
XHR
const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};

fetch("https://api.talentprotocol.com/score", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));


Request
Collapse all
Base URL
https://api.talentprotocol.com
Parameters
id — queryrequired
Talent ID, wallet address or account identifier
X-API-KEY — headerrequired
Your Talent Protocol API key
Send API Request
Response
Clear
Click the Send API Request button above and see the response here!

Previous
Get a project and it's contributors by slug
Next