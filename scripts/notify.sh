#!/usr/bin/env bash

set -e

send_notification() {
  local subject="$1"
  local message="$2"

  sed -e "s/{{SUBJECT}}/$subject/g" \
      -e "s/{{MESSAGE}}/$message/g" \
      email.html | \
  mail -s "$subject" \
    -a "From: Notifications <notifications@asleepace.com>" \
    -a "Reply-To: notifications@asleepace.com" \
    -a "Content-Type: text/html" \
    "colin_teahan@hotmail.com"
}