# Pending Reason Feature

## Overview
Added the ability to add and edit reasons for pending PPOs in the PO Management page.

## Changes Made

### Backend Changes

1. **PPO Model** (`server/models/ppo.model.js`)
   - Added `pendingReason` field (String, default: '') to store the reason why a PPO is pending

2. **PPO Routes** (`server/routes/ppos.js`)
   - Added new PATCH endpoint: `/api/ppos/:id/reason`
   - This endpoint allows updating the `pendingReason` field for a specific PPO

### Frontend Changes

3. **PO Management Page** (`src/components/pages/POManagementPage.jsx`)
   - Added new "Pending Reason" column in the table
   - For pending PPOs:
     - Displays the pending reason (or "No reason provided" if empty)
     - Shows "Add Reason" or "Edit Reason" button depending on whether a reason exists
   - For dispatched PPOs:
     - Shows "N/A" in the reason column
   - Added modal dialog for adding/editing pending reasons
   - Modal includes:
     - Text area for entering the reason
     - Cancel and Save buttons
     - Styled to match the existing design

## How to Use

1. Navigate to the PO Management page
2. Find a PPO with "Pending" status
3. In the "Pending Reason" column, click the "Add Reason" button
4. Enter the reason why this PPO is still pending
5. Click "Save Reason"
6. The reason will be displayed in the table
7. Click "Edit Reason" to modify the reason at any time

## Features

- ✅ Only available for pending PPOs (not dispatched ones)
- ✅ Inline display of the reason in the table
- ✅ Modal dialog for editing
- ✅ Toast notifications for success/error
- ✅ Responsive design matching the existing UI
- ✅ Ability to edit reasons multiple times

