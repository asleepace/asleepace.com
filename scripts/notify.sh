#!/usr/bin/env bash

# NOTE: make sure to source this file in the file where it will be used.
# source ./notify.sh.
#
# This will not work on MacOS and must be used in a linux environment, since
# the -a headers don't work well.
#

send_notification() {
  local subject="$1"
  local message="$2"

  echo "[notify.sh] sending notification!"

  sed -e "s/{{SUBJECT}}/$subject/g" \
      -e "s/{{MESSAGE}}/$message/g" \
      email.html | \
  mail -s "$subject" \
    -a "From: Notifications <notifications@asleepace.com>" \
    -a "Reply-To: notifications@asleepace.com" \
    -a "Content-Type: text/html" \
    "colin_teahan@hotmail.com"
}
