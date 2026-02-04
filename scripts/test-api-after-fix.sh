#!/bin/bash

echo "=== COMPREHENSIVE API TESTING AFTER FIX ==="
echo ""

echo "1. No filters (baseline)"
curl -s "http://localhost:3001/api/tuition-centres" | jq '{total: .pagination.total}'
echo ""

echo "2. levels=Secondary (FIXED - was 0, should be 31)"
curl -s "http://localhost:3001/api/tuition-centres?levels=Secondary" | jq '{total: .pagination.total}'
echo ""

echo "3. levels=Primary"
curl -s "http://localhost:3001/api/tuition-centres?levels=Primary" | jq '{total: .pagination.total}'
echo ""

echo "4. levels=JC"
curl -s "http://localhost:3001/api/tuition-centres?levels=JC" | jq '{total: .pagination.total}'
echo ""

echo "5. subjects=English"
curl -s "http://localhost:3001/api/tuition-centres?subjects=English" | jq '{total: .pagination.total}'
echo ""

echo "6. subjects=Mathematics"
curl -s "http://localhost:3001/api/tuition-centres?subjects=Mathematics" | jq '{total: .pagination.total}'
echo ""

echo "7. levels=Secondary&subjects=English (FIXED - was 0, should be 12)"
curl -s "http://localhost:3001/api/tuition-centres?levels=Secondary&subjects=English" | jq '{total: .pagination.total}'
echo ""

echo "8. levels=Primary&subjects=Mathematics"
curl -s "http://localhost:3001/api/tuition-centres?levels=Primary&subjects=Mathematics" | jq '{total: .pagination.total}'
echo ""

echo "9. levels=JC&subjects=Economics"
curl -s "http://localhost:3001/api/tuition-centres?levels=JC&subjects=Economics" | jq '{total: .pagination.total}'
echo ""

echo "10. Multiple levels: levels=Primary,Secondary"
curl -s "http://localhost:3001/api/tuition-centres?levels=Primary,Secondary" | jq '{total: .pagination.total}'
