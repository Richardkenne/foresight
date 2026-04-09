#!/bin/bash
echo "=== EMBEDDING STATUS ==="
running=$(pgrep -f embed-chunked | wc -l | tr -d ' ')
echo "Processes running: $running"
echo ""
for i in 1 2 3; do
  log="/tmp/embed-p${i}.log"
  if [ -f "$log" ]; then
    echo "--- Worker $i ---"
    tail -1 "$log" 2>/dev/null
  fi
done
echo ""
echo "Failed batches: $(grep -c 'FAIL' /tmp/embed-p1.log /tmp/embed-p2.log /tmp/embed-p3.log 2>/dev/null | tail -1)"
