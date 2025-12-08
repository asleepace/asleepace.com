/**
 * @app reddit/index.ts
 * @description a simple background job for scraping reddit.
 */
const frontPage = 'https://old.reddit.com/r/wallstreetbets/comments.json'

const CHROME_COOKIE_REDDIT = `wwrbucket=2490544639_ue1; loid=000000000000090mk4.2.1347721672000.Z0FBQUFBQmh4VUxqZTNYeHlPX25ZYVRueTRmR1VWb1RXZ0YwMDBHZGpyeXhMMW5UYk52MDB1S2NpNUYyOUFpb3YxZE9NeGttTTdFTGp3WGN2S2tZR29yRmd2aTB6U3kzWGtOZXBEeXpvR1Fmcks3dlZvT1U3Mjg1TEdsa3l5T0ZabXYwb1M2T0VGY2Y; __stripe_mid=02f2dc7b-a06a-4a92-a4a6-bb5ea27f67afcc7bb6; pc=yi; csv=2; edgebucket=0bL8VRAt7bdJXLqgyQ; subreddit_sort=AYhf9QI=; theme=2; eu_cookie={%22opted%22:true%2C%22nonessential%22:true}; _gcl_au=1.1.544471799.1757701099; csrf_token=5ca7c973b0219e883e3c35d0a9676acc; reddit_chat_view=closed; reddit_chat_path=/room/!8pwzstJ-LJNu0uFw4k4_tDlM5XlhQ1dpl8-IS15oIjY%253Areddit.com; t2_90mk4_recentclicks3=t3_1pg5gft%2Ct3_1pbb0ki%2Ct3_1p95wwn%2Ct3_1n7uwts%2Ct3_1ojw7j9%2Ct3_1hvp189%2Ct3_1b2jgel%2Ct3_1nz31om%2Ct3_1npmann%2Ct3_pyxjl; seeker_session=true; __stripe_sid=a56d1652-3945-4872-ab59-d62b269c36fbc3932e; prefers_reduced_motion=false; prefers_reduced_motion_sync=true; is_video_autoplay_disabled=false; reddit_session=eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpsVFdYNlFVUEloWktaRG1rR0pVd1gvdWNFK01BSjBYRE12RU1kNzVxTXQ4IiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0Ml85MG1rNCIsImV4cCI6MTc4MDczNzQ4Ni44MTM4MDksImlhdCI6MTc2NTA5OTA4Ni44MTM4MDksImp0aSI6IjVkUEdPa290X1U2Zlp1b08ybXlYalRWMkxTeUp3QSIsImF0IjoxLCJjaWQiOiJjb29raWUiLCJsY2EiOjEzNDc3MjE2NzIxNzEsInNjcCI6ImVKeUtqZ1VFQUFEX193RVZBTGsiLCJ2MSI6IjE1MTQ1NzgwLDIwMjUtMTItMDdUMDk6MTg6MDYsMmM3YzQ1OTViNTE4YmUwM2RiYzMzMGM3YjE2NDdhMjBhZTM0NjEwYyIsImZsbyI6MTAsImFtciI6WyJwd2QiXX0.lDWGdED6VN0IYTaUDWUWNbni-erTGVjYy1sgKpztRz03KxyjRFAFXxfU5H0Rn-YKLFA4ACPhD4xa6u9YZpmjKwFkRw4ab4voffctPVq_I2AMKzugiHDXwfETGcBfC7PpzNNJT993ssFLC-PqQVK-jMcHSCtMf2B77FJvy_TOM0R9_FM8eLj_59DebqJyR8ZiMJxRmVQZBqNTa8LTw9mwXYeGR2rnLCwPm8FAUhpIh91uWw7hp84ZlbZNG-R_WDUVzXKP_1MQxCk-5qCw3PP4OyeKA7TsoZ7zLxq4Y_VqxO8psgZNFPcl6uxpLWwndWK_fr_nk4qj21SMrSwwjfv7iw; token_v2=eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzY1MTg1NDg5LjkzMDY0NSwiaWF0IjoxNzY1MDk5MDg5LjkzMDY0NSwianRpIjoiMHl5RDhGNEhJX2wzNTV6TlUtZnlEMXpaSjBBZEJnIiwiY2lkIjoiMFItV0FNaHVvby1NeVEiLCJsaWQiOiJ0Ml85MG1rNCIsImFpZCI6InQyXzkwbWs0IiwiYXQiOjEsImxjYSI6MTM0NzcyMTY3MjE3MSwic2NwIjoiZUp4a2tkR090REFJaGQtRmE1X2dmNVVfbTAxdGNZYXNMUWFvazNuN0RWb2NrNzA3Y0Q0cEhQOURLb3FGRENaWGdxbkFCRmdUclREQlJ1VDluTG0zZzJpTmU4dFlzWm5DQkZtd0ZEcmttTEdzaVFRbWVKSWF5eHNtb0lMTnlGeXV0R05OTFQwUUpxaGNNcmVGSHBjMm9ia2JpNTZkR0ZXNXJEeW9zVmZsMHRqR0ZMWW54amNicXcycHVDNm5Na25MUXZrc1h2VGpOOVczOXZtel9TYTBKOE9LcXVtQjNobEpDRzRzZnBpbTNkOVRrNTZ0Q3hhMTkzcVEydWQ2M0s1OTFpdzBPN2VmNl9sckl4bVhZMmgtSnZ0MzF5LWhBNDg4THpQcUFFYXM0VWNaZG1RZF9sVUhVTG1nSkdNSjR0TUk1TXJsMjM4SnRtdlR2OGJ0RXo5OE0tS21OX3pXRE5SekNlTFFwX0gxR3dBQV9fOFExZVRSIiwicmNpZCI6IkhldlpxQ2E0ZUxBVlpCcEV2aFpIalhwaW9xV0I2Mm1HWmxLeGl5WS1lemsiLCJmbG8iOjJ9.BLO0l-5iv-EH_DH7f3kFU1STttgAaGj6hqDvOuHDfqLvuBeVypMTKEEBAL-IpephubaDNMnqD-LhzAPCXf9OcIfByGoiM5V94XfwnBej67P1alE7j9EBo3exSJ9zBgVlTf-VQEnazflWFhWDS--OTn784Sf5_dhkud0AKLtRanUzJFyiOJmUOStcOCJ3DmMan5Y9QrTEB3nb_rG8nNID7eoS2Px0Xli-rdI6dyafJIkVMOJ4gDNvdZGNf71ohHcpAs_R5mjJGAtiOua1SP5SaeEN8syslio-ouswYvrVBHD58qjCMUSduJ-fEiCpFV2LqWOvboMwZY7JmfyZ0eZMMA; g_state={"i_l":0,"i_ll":1765099209144,"i_b":"ZhDzbZRNQZsw2IWhEwbTOJX7i9MtbnIvrGsIagRC2rM"}; wwrbucket=2490544639_ue1; session_tracker=mcaicdmrhcpggqajpf.0.1765099222774.Z0FBQUFBQnBOVWJXdHhjQU84OE5CcTBSODJGQTN2b3NZVW9WMkhONzh0M2h5bmlwRmpwWWxZc1FRZGkxclpUalhScUNhTGVsRXBCcURObzhqV1p6Zk9IODBwbF9wTUtWeFhoQ3lYRkt2Q1hNbVlVRDJ5U1hLbzJqVkxZaFNqSFdab0kycm1LWTNzYkI`

async function fetchReddit(url: string) {
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'accept-language': 'en-US,en;q=0.9',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        referer: 'https://www.google.com/',
        cookie: CHROME_COOKIE_REDDIT,
      },
    })
    if (!resp.ok) throw new Error(`Failed to fetch reddit (${resp.status})`)
    const data = await resp.json()
    return data
  } catch (e) {
    console.warn('[reddit] error:', e)
  }
}

fetchReddit(frontPage).then(console.log)
