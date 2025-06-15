---
title: 'How to Export iMessage Chat History'
description: 'How to export your iMessage chat history to a text file which can be uploaded and analyzed with Ai.'
pubDate: 'June 14 2025'
heroImage: '/images/blog-export-imessage.png'
hashTags: 'Technical, MacOS, Bash'
slug: 'how-to-export-imessage'
---

The other day the group chat my friends and I use to talk about stocks, trading and investing devolved into pure political chaos. Desperate to find the culprit who kept steering the conversation towards politics, we turned to Ai.

Our first attempts consisted of taking screenshots and uploading them individually, but this proved to be painfully slow and missing a lof of context, such as was someone responding to a question asked by another member about politics or was the conversation about current events which could affect the markets.

### How to access iMessage on MacOS

If your MacOS is connected with your iCloud account, the all your iMessages are actually saved in an sqlite database. To check if this exists run the following:

```sh
ls ~/Library/Messages/chat.db
```

You should see somthing like `/Users/asleepace/Library/Messages/chat.db` as the output. This is your iMessage sqlite database! In order to open you may need to give your Terminal "Full disk access" permissions:

<img src="/images/full-disk-access.png" />

After restarting the terminal you should then be able to open the file with the `sqlite3` command (when run as `sudo`).

```sh
sudo sqlite3 ~/Library/Messages/chat.db
```

From here you can execute raw SQL commands, lets view what tables are available:

```sql
. tables
```

This should show you a list like the following:

```txt
_SqliteDatabaseProperties
attachment
chat
chat_handle_join
chat_message_join
chat_recoverable_message_join
deleted_messages
handle
kvtable
message
message_attachment_join
message_processing_task
recoverable_message_part
scheduled_messages_pending_cloudkit_delete
sync_deleted_attachments
sync_deleted_chats
sync_deleted_messages
unsynced_removed_recoverable_messages
```

Now let's find that specific group chat, in my case it's name is `'Money Gang'`

```sql
SELECT
    c.chat_identifier,
    c.display_name,
    COUNT(m.ROWID) as message_count,
    datetime(MAX(m.date)/1000000000 + strftime("%s", "2001-01-01"), "unixepoch", "localtime") as last_message_date
FROM chat c
LEFT JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id
LEFT JOIN message m ON cmj.message_id = m.ROWID
WHERE c.display_name IN ('Money Gang')  -- note "Moeny Gang" is the name of our chat
GROUP BY c.ROWID
ORDER BY MAX(m.date) DESC;
```

Since this group chat has been ongoing for quite some time, I actually found several instances:

```txt
chat449416128167948589|Money Gang|17818|2025-06-14 10:20:16
chat449416128167948589|Money Gang|6|2025-06-09 16:07:01
chat145145727747807125|Money Gang|1053|2025-05-16 13:10:17
```

We can check how many messages are in each instance with the following passing in the specific id, in my case `'chat449416128167948589'`:

```sql
SELECT COUNT(*) as total_messages
FROM message m
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
JOIN chat c ON cmj.chat_id = c.ROWID
WHERE c.chat_identifier = 'chat449416128167948589'
    AND m.text IS NOT NULL
    AND m.text != ''
    AND m.text != '￼'
    AND LENGTH(TRIM(m.text)) > 0;
```

If you want to extract all the messages from a specific chat we can do the following:

```sql
SELECT
    h.id as sender,
    COALESCE(h.id, 'Me') as sender,
    COALESCE(m.text, '[No text]') as message,
    datetime(m.date/1000000000 + strftime("%s", "2025-01-01"), "unixepoch", "localtime") as date
FROM message m
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
JOIN chat c ON cmj.chat_id = c.ROWID
LEFT JOIN handle h ON m.handle_id = h.ROWID
WHERE c.chat_identifier = 'chat449416128167948589'
ORDER BY m.date DESC
LIMIT 100;
```

Or if you want to extract all messages from all group chats with that display name:

```sql
SELECT
  c.chat_identifier,
  COALESCE(h.id, 'Me') as sender,
   m.text as message,
   datetime(m.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as date
FROM message m
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
JOIN chat c ON cmj.chat_id = c.ROWID
LEFT JOIN handle h ON m.handle_id = h.ROWID
WHERE c.display_name = 'Money Gang'
     AND m.text IS NOT NULL
     AND m.text != ''
     AND m.text != '￼'
     AND LENGTH(TRIM(m.text)) > 0
ORDER BY m.date ASC;
```

### Exporting to a Text File

Since we wanted to use Ai to read the conversation and determine who was the culprit, the next step was to export the combined conversations into a single text file which could be uploaded to Claude.

The following shell command will coalesce all `'Money Gang'` chat threads into a single text file `chat.txt`

```sh
#!/bin/zsh
sudo sqlite3 ~/Library/Messages/chat.db "SELECT
    c.chat_identifier,
    COALESCE(h.id, 'Me') as sender,
    m.text as message,
    datetime(m.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as date
FROM message m
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
JOIN chat c ON cmj.chat_id = c.ROWID
LEFT JOIN handle h ON m.handle_id = h.ROWID
WHERE c.display_name = 'Money Gang'
    AND m.text IS NOT NULL
    AND m.text != ''
    AND m.text != '￼'
    AND LENGTH(TRIM(m.text)) > 0
ORDER BY m.date ASC;" >> chat.txt
```

The file should now be in the directory where you ran the command.
