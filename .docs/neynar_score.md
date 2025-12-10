# Neynar User Score

> Check for quality users using Neynar's user score

## What is the Neynar user score?

Neynar user score is generated based on user behavior on the platform. It scores between 0 and 1 and reflects the confidence in the user being a high-quality user. Users can improve their scores by having high-quality interactions with other good users. Scores update weekly.

If you want to see your score as a user, you can use the [Neynar Explorer](https://explorer.neynar.com) and insert your fid in the search bar. Sample url `explorer.neynar.com/<fid>`.

## Interpreting the score

The score is *not* proof of humanity. It's a measure of the account quality / value added to the network by that account. It's capable of discriminating between high and low quality AI activity. E.g. agents like bracky / clanker are bots that have high scores while accounts posting LLM slop have lower scores.

You can see a distribution of users across score ranges on this [dashboard](https://data.hubs.neynar.com/public/dashboards/UPkT4B8bDMCo952MXrHWyFCh1OJqA9cfFZm0BCJo?org_slug=default). A screenshot from Dec 5, 2024 is below.

<Frame>
  <img src="https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png?fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=4188987ebb987d885d5d95dc5c30711d" alt="Neynar user score distribution" data-og-width="2716" width="2716" data-og-height="1380" height="1380" data-path="images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png?w=280&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=f4f0f833c10ec4a77344dbef08f1ec7a 280w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png?w=560&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=36d768964ba6e2a02fa53a0dc4a169eb 560w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png?w=840&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=67bb2f1be9704edef64bddf80430783e 840w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png?w=1100&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=c65a50dcf7a5bd144749b58ac614616b 1100w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png?w=1650&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=078a0e271982a132044565fb2716baf9 1650w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png?w=2500&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=b4f4e4f7932128e20db18ac47454484d 2500w" />
</Frame>

If using scores in product development, **we recommend starting with a threshold around 0.55 and then changing up or down as needed.** As of Dec 5, 2024, there are:

* \~2.5k accounts with 0.9+ scores
* \~27.5k accounts with 0.7+ scores

*Hence, starting with a very high threshold will restrict the product to a tiny user cohort.* Developers should assess their own thresholds for their applications (Neynar does not determine thresholds in other apps). Scores update at least once a week, so new users might take a few days to show an updated score. If the user has not been active for a while, their scores will be reduced.

<Info>
  ##### If looking for more information on scores as end user, see [FAQ section](/docs/neynar-user-quality-score#faqs) at the bottom of this page.
</Info>

## Fetching the score for development

### Getting the score on webhook events

If you're using Neynar webhooks to get data on your backend, you might want to separate high-quality data from low-quality data. A simple way to do this is to look at the `neynar_user_score` inside each user object.

```json  theme={"system"}
user: {
	fid: 263530,
	object: "user",
	pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/68c1cd39-bcd2-4f5e-e520-717cda264d00/original",
	profile: {
		bio: {
			text: "Web3 builder"
		}
	},
	username: "m00n620",
	power_badge: false,
	display_name: "tonywen.base.eth",
	experimental: {
		neynar_user_score: 0.9 // THIS IS THE SCORE
	},
	verifications: [
		"0xc34da1886584aa1807966c0e018709fafffed143"
	],
	follower_count: 29,
	custody_address: "0x22c1898bddb8e829a73ca6b53e2f61e7f02a6e6d",
	following_count: 101,
	verified_accounts: null,
	verified_addresses: {
		eth_addresses: [
			"0xc34da1886584aa1807966c0e018709fafffed143"
		],
		sol_addresses: []
	}
}
```

### Fetching the score on API calls

If you're using APIs, you will see the same score in all user objects across all Neynar API endpoints. Try the following endpoints on our docs pages and look at the user object to see this in action:

* [User by FIDs](/reference/fetch-bulk-users) to see this when fetching user data by fid
* [By Eth or Sol addresses](/reference/fetch-bulk-users-by-eth-or-sol-address)
  If looking to restrict activity to a specific cohort of users, you can check user score on any Neynar API endpoint and then allow them to take actions as appropriate.

### Pulling the scores from hosted SQL

[Neynar SQL playground](/docs/how-to-query-neynar-sql-playground-for-farcaster-data) has user scores available and you can pull from there for larger analysis as needed. [Reach out](https://neynar.com/slack) if you don't yet have access to it.

<Frame>
  <img src="https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png?fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=dccc6ccac384813c3de5d471db03fa84" alt="Neynar user score in SQL" data-og-width="678" width="678" data-og-height="1138" height="1138" data-path="images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png?w=280&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=0c0332d1efca151a1ee09646b1fd9ccf 280w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png?w=560&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=154dcce4362f99c9d1e3b5594cca5af8 560w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png?w=840&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=2180c96b51944e679fbf4bc058772275 840w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png?w=1100&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=a519241e68d2d27b037328f9e93d168c 1100w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png?w=1650&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=bfd0bbc55844a4cccb27b2f0c76ef650 1650w, https://mintcdn.com/neynar/4PNY113y9N9T-r9z/images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png?w=2500&fit=max&auto=format&n=4PNY113y9N9T-r9z&q=85&s=a8553d3752180bd752c926a127dfc50f 2500w" />
</Frame>

### Pulling score data onchain

See [here](/docs/address-user-score-contract) for details. Reach out to us on [Slack](https://neynar.com/slack) if you need the data to be updated.

## Report errors

If you know a score misrepresents a user, that's helpful information we can use to label our data. Please send feedback to `@rish` on [Warpcast DC](https://warpcast.com/rish) or [Slack](https://neynar.com/slack) .

## FAQs

#### 1. How often do the scores update?

There's two different things to note here:

* (a) The algorithm runs **weekly** and calculates scores for accounts on the network based on their activity
* (b) The algorithm itself is upgraded from time to time as activity on the network shifts. You can read about one such update in [Retraining Neynar User Score Algorithm](https://neynar.com/blog/retraining-neynar-user-score-algorithm)

#### 2. As a user, how can I improve my score?

The score is a reflection of account activity on the network. Since we have introduced this score, a few users have written helpful guides on how to contribute to the network in a positive manner:

* see from @ted [here](https://warpcast.com/rish/0xbcbadc6f)
* longer write up from @katekornish (now turned into a mini app by @jpfraneto) [here](https://startonfarcaster.xyz/)


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.neynar.com/llms.txt