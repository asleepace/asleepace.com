SELECT 
    c.chat_identifier,
    c.display_name,
    COUNT(m.ROWID) as message_count,
    datetime(MAX(m.date)/1000000000 + strftime("%s", "2001-01-01"), "unixepoch", "localtime") as last_message_date
FROM chat c
LEFT JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id
LEFT JOIN message m ON cmj.message_id = m.ROWID
WHERE c.display_name IN ('Money Gang')
GROUP BY c.ROWID
ORDER BY MAX(m.date) DESC;

-- Count Messages:

SELECT COUNT(*) as total_messages
FROM message m
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
JOIN chat c ON cmj.chat_id = c.ROWID
WHERE c.chat_identifier = 'chat449416128167948589'
    AND m.text IS NOT NULL 
    AND m.text != ''
    AND m.text != '￼'
    AND LENGTH(TRIM(m.text)) > 0;


-- Money Gang: chat449416128167948589

--- chat449416128167948589|Money Gang|17818|2025-06-14 10:20:16
--- chat449416128167948589|Money Gang|6|2025-06-09 16:07:01
--- chat145145727747807125|Money Gang|1053|2025-05-16 13:10:17


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


-- bash command
sqlite3 ~/Desktop/messages.db "
SELECT 
    h.id as sender,
    COALESCE(h.id, 'Me') as sender,
    COALESCE(m.text, '[No text]') as message,
    datetime(m.date/1000000000 + strftime('%s', '2025-01-01'), 'unixepoch', 'localtime') as date
FROM message m
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
JOIN chat c ON cmj.chat_id = c.ROWID
LEFT JOIN handle h ON m.handle_id = h.ROWID
WHERE c.chat_identifier = 'chat449416128167948589'
ORDER BY m.date DESC
LIMIT 100;
" > money_gang_readable.txt
