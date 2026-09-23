# Search setup guide

How to get the site into Google Search and set up a Google Business Profile. Do Part 1 first. Part 2 is independent and can be done any time.

Site URL: `https://dangokangoo.github.io/william-odriscoll/`

## Part 1: Google Search Console

Search Console tells Google the site exists, lets you submit the sitemap, and shows which searches bring people to it.

### 1. Add the site

1. Go to https://search.google.com/search-console and sign in with the Google account you want to own this.
2. Click **Add property** and choose **URL prefix** (not Domain: you don't own `github.io`).
3. Enter `https://dangokangoo.github.io/william-odriscoll/` exactly, with the trailing slash.

### 2. Verify ownership (HTML tag)

1. Under **Other verification methods**, open **HTML tag**.
2. Copy only the code inside `content="..."`. It looks like `abc123XYZ...`.
3. Send it to Claude, or paste it into `src/config/site.ts`:

   ```ts
   googleSiteVerification: "abc123XYZ...",
   ```

4. Ship that change (PR, merge, deploy) and wait for the deploy to go live. The GitHub cache can take about 10 minutes.
5. Back in Search Console, click **Verify**.

Keep the tag in place after verification. Google re-checks it, and removing it un-verifies the site.

### 3. Submit the sitemap

1. In the left menu, open **Sitemaps**.
2. Enter `sitemap-index.xml` (the box already includes the site URL) and click **Submit**.
3. The status should read **Success** within a day or two.

There's no robots.txt: on `github.io`, crawlers only read one at `dangokangoo.github.io/robots.txt`, which this repo doesn't control. Submitting the sitemap here covers it.

### 4. Request indexing

1. Paste the site URL into the search bar at the top of Search Console.
2. Click **Request indexing**. Do the same for `/privacy/` if you like.

It usually takes a few days to a few weeks before the site shows up in results. Google decides what it shows; none of this is guaranteed.

### 5. Check the structured data

1. Open https://search.google.com/test/rich-results and test the site URL.
2. It should detect **Local businesses** with no errors. Expect several non-critical warnings (missing street address, postal code, telephone, price range). That's expected: you're a service-area business, so the address is deliberately city-only, and none of those fields are required.
3. For a strict schema check, use https://validator.schema.org with the same URL. It should show no errors.

## Part 2: Google Business Profile

This is the listing that shows on Google Maps and in the local panel for searches like "golf website design St. John's". For local services it often matters more than the website itself.

**Check eligibility first.** Google only allows businesses that meet customers in person. Online-only businesses aren't eligible and get suspended. You qualify as long as you meet clients face to face (at their course, club or shop). List only areas you actually travel to, and keep them within about 2 hours' drive of St. John's. Clients elsewhere in Canada are still welcome through the website; they just don't belong in the profile's service areas.

1. Go to https://business.google.com and click **Manage now**.
2. **Business name:** `W. O'Design`, exactly as on the site, so Google sees one consistent name. Use your real business name only; Google suspends listings that stuff keywords into the name.
3. **Category:** `Website designer`.
4. **Do you want to add a location customers can visit?** Choose **No**, since clients don't visit you at an office. That makes you a service-area business. Google still asks for your address to verify you, but it keeps it hidden from the public.
5. **Service areas:** `St. John's` plus nearby places you'd drive to, such as `Mount Pearl`, `Paradise` or `Conception Bay South`, all within about 2 hours. Don't add the whole province or distant cities. Google allows up to 20.
6. **Contact:** your email, and a phone number if you're comfortable listing one. **Website:** the site URL above.
7. **Verify:** Google will ask for a video, phone or email verification. Follow its prompts.
8. After verification, fill in:
   - **Description:** reuse the site description from `src/config/site.ts`.
   - **Services:** Design and build, Booking and stores, Local search, Hosting and care.
   - **Photos:** your logo (`brand/logo-mark-green-1024.png`) plus screenshots of client sites (`src/assets/shots/`).
9. Ask happy clients to leave a review on the profile. Reviews there are the strongest local signal.

## If the site moves to a custom domain

Add the new domain as a new Search Console property (a **Domain** property works once you own the domain), submit the sitemap again, and update the website link on the Business Profile. Keep the old property until traffic has moved.
