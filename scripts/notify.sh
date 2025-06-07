#!/usr/bin/env bash

# NOTE: make sure to source this file in the file where it will be used.
# source ./notify.sh
#
# This will not work on MacOS mail command and must be used in a linux 
# environment, since the -a headers don't work with BSD mail.
#

path_email() {
  # Get the directory of this script
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  echo "${script_dir}/email.html"
}

make_email() {
  local subject="$1"
  local message="$2"
  
  # Check if template exists
  local email_path="$(path_email)"
  if [[ ! -f "$email_path" ]]; then
    echo "Error: $email_path not found" >&2
    return 1
  fi
  
  # Escape special characters for sed
  local escaped_subject=$(printf '%s\n' "$subject" | sed 's/[[\.*^$()+?{|]/\\&/g')
  local escaped_message=$(printf '%s\n' "$message" | sed 's/[[\.*^$()+?{|]/\\&/g')
  
  # Output the processed HTML
  sed -e "s/{{SUBJECT}}/$escaped_subject/g" \
      -e "s/{{MESSAGE}}/$escaped_message/g" \
      "$email_path"
}

send_notification() {
  local subject="$1"
  local message="$2"
  local recipient="${3:-colin_teahan@hotmail.com}"

  echo "[notify.sh] sending notification to $recipient" >&2
  
  # Generate email content
  local email_content
  if ! email_content=$(make_email "$subject" "$message"); then
    echo "Error: Failed to generate email" >&2
    return 1
  fi
  
  # Check which mail system we have
  if command -v mail >/dev/null 2>&1; then
    # Check if we're on Linux with GNU mail (supports -a flag)
    if mail --help 2>&1 | grep -q "attach"; then
      # Linux with GNU mail
      echo "$email_content" | mail -s "$subject" \
        -a "From: Notifications <notifications@asleepace.com>" \
        -a "Reply-To: notifications@asleepace.com" \
        "$recipient"
    else
      # macOS or BSD mail (no -a flag)
      echo "$email_content" | mail -s "$subject" "$recipient"
    fi
  else
    echo "Error: mail command not found" >&2
    return 1
  fi
  
  if [[ $? -eq 0 ]]; then
    echo "✅ Notification sent successfully" >&2
  else
    echo "❌ Failed to send notification" >&2
    return 1
  fi
}

# Test function to preview email
preview_email() {
  local subject="$1"
  local message="$2"
  
  echo "=== Email Preview ===" >&2
  echo "Subject: $subject" >&2
  echo "To: colin_teahan@hotmail.com" >&2
  echo "Email template: $(path_email)" >&2
  echo "===================" >&2
  
  # Generate the email
  local email_content
  if ! email_content=$(make_email "$subject" "$message"); then
    echo "Failed to generate email preview" >&2
    return 1
  fi
  
  # Save to temp file
  local temp_file=$(mktemp -t email_preview.XXXXXX.html)
  echo "$email_content" > "$temp_file"
  
  echo "Preview saved to: $temp_file" >&2
  
  # Try to open in browser
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$temp_file" 2>/dev/null
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$temp_file" 2>/dev/null
  else
    echo "Open $temp_file in your browser to preview" >&2
  fi
}

# Only run tests if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "Running preview test..." >&2
  preview_email "Test Subject" "This is a test message"
fi