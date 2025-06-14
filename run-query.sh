#!/bin/zsh

# Example
#
#   ./run-query.sh chat449416128167948589 >> exported_chat.txt
#   ./run-query.sh chat449416128167948589 >> exported_chat.txt
#   ./run-query.sh chat145145727747807125 >> exported_chat.txt
#


CHAT_ID="$1"       # OFFSET="${:-0}"   # Default to 0
LIMIT="${2:-1000}"  # Default to 1000 if no argument provided
OFFSET="${3:-0}"   # Default to 0

sqlite3 "$HOME/Library/Messages/chat.db" "
SELECT 
    COALESCE(h.id, 'Me') as sender,
    m.text as message,
    datetime(m.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as date
FROM message m
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
JOIN chat c ON cmj.chat_id = c.ROWID
LEFT JOIN handle h ON m.handle_id = h.ROWID
WHERE c.chat_identifier = '$CHAT_ID'
    AND m.text IS NOT NULL 
    AND m.text != ''
    AND m.text != '￼'
    AND LENGTH(TRIM(m.text)) > 0
ORDER BY m.date ASC
LIMIT $LIMIT OFFSET $OFFSET;
"