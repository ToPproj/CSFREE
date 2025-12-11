#!/bin/bash

# Step 1: add all changes
git add .

# Step 2: commit with a message
git commit -m "update support page — removed tutoring references"

# Step 3: push to main branch (change 'main' if your branch is different)
git push origin main

echo "✅ Changes pushed! Your GitHub Pages site should update in a few minutes."
