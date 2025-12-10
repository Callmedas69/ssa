# Overview

Quotient is developing a comprehensive API suite to provide user intelligence for Web3 brands.&#x20;

Use cases include spam filtering, airdrop targeting, rewards multipliers, user recommendations, content curation, community analytics, and enriching user data.&#x20;

Applications can filter out low-quality accounts, segment users by engagement quality, and build better discovery/recommendations features.

The API beta endpoints are subject to change and deprecation.

**Host: `https://api.quotient.social`**


# Quotient Score

## **Quotient Score**

**Quotient Score** is a variation of the PageRank algorithm optimized for Farcaster, measuring momentum and relevance based on the quantity and quality of incoming engagement.&#x20;

The algorithm weights recent interactions more heavily and ignores follower counts to avoid advantages from automated/spam followers, focusing instead on genuine engagement patterns.&#x20;

#### Quotient Score Tiers

<table><thead><tr><th width="137.662109375">Score Range</th><th width="160.390625">Quality Level</th><th>Description</th></tr></thead><tbody><tr><td> &#x3C;0.5</td><td>Inactive</td><td>Bot accounts, farmers, inactive users</td></tr><tr><td>0.5 - 0.6</td><td>Casual</td><td>Occasional users, low engagement. Potentially spam or bot accounts.</td></tr><tr><td>0.6 - 0.75</td><td>Active</td><td>Regular contributors, solid engagement</td></tr><tr><td>0.75 - 0.8</td><td>Influential</td><td>High-quality content, strong network</td></tr><tr><td>0.8 - 0.89</td><td>Elite</td><td>Top-tier creators, community leaders</td></tr><tr><td>0.9+</td><td>Exceptional</td><td>Platform superstars, maximum influence</td></tr></tbody></table>

**Host: `https://api.quotient.social`**

## Get user reputation metrics for multiple users

> Retrieves quotient scores and ranking for up to 1000 Farcaster users.

```json
{"openapi":"3.1.0","info":{"title":"Quotient API","version":"0.1.0"},"paths":{"/v1/user-reputation":{"post":{"tags":["Reputation"],"summary":"Get user reputation metrics for multiple users","description":"Retrieves quotient scores and ranking for up to 1000 Farcaster users.","operationId":"get_user_reputation_by_post_v1_user_reputation_post","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/ReputationRequest"}}},"required":true},"responses":{"200":{"description":"Successfully retrieved reputation data","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ReputationResponse"}}}},"401":{"description":"Unauthorized - Invalid API key"},"404":{"description":"No users found with the provided FIDs"},"422":{"description":"Validation Error","content":{"application/json":{"schema":{"$ref":"#/components/schemas/HTTPValidationError"}}}},"500":{"description":"Internal Server Error"}}}}},"components":{"schemas":{"ReputationRequest":{"properties":{"fids":{"items":{"type":"integer"},"type":"array","maxItems":1000,"title":"Fids","description":"List of Farcaster IDs (FIDs) to retrieve reputation for"},"api_key":{"type":"string","title":"Api Key","description":"API key for authentication"}},"type":"object","required":["fids","api_key"],"title":"ReputationRequest","description":"Request model for reputation endpoint."},"ReputationResponse":{"properties":{"data":{"items":{"$ref":"#/components/schemas/ReputationData"},"type":"array","title":"Data","description":"List of reputation data for the requested FIDs"},"count":{"type":"integer","title":"Count","description":"Number of users found"}},"type":"object","required":["data","count"],"title":"ReputationResponse","description":"Response model for reputation endpoint."},"ReputationData":{"properties":{"fid":{"type":"integer","title":"Fid","description":"Farcaster user ID"},"username":{"type":"string","title":"Username","description":"Farcaster username"},"quotientScore":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Quotientscore","description":"Normalized quotient score - use for display to users. Account quality drops signifigantly beneath .5"},"quotientScoreRaw":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Quotientscoreraw","description":"Raw quotient score - use for rewards multipliers."},"quotientRank":{"anyOf":[{"type":"integer"},{"type":"null"}],"title":"Quotientrank","description":"Account rank across Farcaster based on Quotient score."},"quotientProfileUrl":{"type":"string","title":"Quotientprofileurl","description":"Review reach, engagement, and influence insights for the user in the Quotient discovery portal."}},"type":"object","required":["fid","username","quotientProfileUrl"],"title":"ReputationData","description":"Model for Farcaster reputation data."},"HTTPValidationError":{"properties":{"detail":{"items":{"$ref":"#/components/schemas/ValidationError"},"type":"array","title":"Detail"}},"type":"object","title":"HTTPValidationError"},"ValidationError":{"properties":{"loc":{"items":{"anyOf":[{"type":"string"},{"type":"integer"}]},"type":"array","title":"Location"},"msg":{"type":"string","title":"Message"},"type":{"type":"string","title":"Error Type"}},"type":"object","required":["loc","msg","type"],"title":"ValidationError"}}}}
```
