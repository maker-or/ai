# Testing Branching Functionality

## What We Fixed

The branching system in the AI chat app has been completely overhauled to work properly. Here's what was implemented:

### 1. Message Query System
- **Fixed `getMessages` query** to be branch-aware
- Messages now properly filter by branch ID
- Main thread shows messages without `branchId`
- Branch threads show messages up to branch point + branch-specific messages

### 2. Branch Creation
- **Improved `createBranch` mutation** to properly handle branch points
- Automatically deactivates other branches when creating a new one
- Links messages to the correct branch starting from the branch point

### 3. Branch Switching
- **Enhanced `switchToBranch` mutation** to handle both branches and main thread
- Properly activates/deactivates branches
- Supports switching back to main thread (undefined branchId)

### 4. UI Integration
- **Updated ChatWindow** to use branch-aware message loading
- Messages automatically reload when switching branches
- New messages are properly linked to active branch
- Branch selector shows current branch state

## How to Test

### Step 1: Start a Conversation
1. Sign in to the app
2. Create a new chat
3. Send a few messages back and forth with the AI
4. You should see something like:
   ```
   User: Hello, what's the weather like?
   AI: I don't have access to real-time weather data...
   User: Can you help me with cooking?
   AI: Of course! I'd be happy to help with cooking...
   ```

### Step 2: Create a Branch
1. Hover over any message (user or AI)
2. Click the branch icon (GitBranch) that appears
3. A dialog will open asking for a branch name (optional)
4. Click "Create Branch"
5. You should see the branch selector update to show the new branch name

### Step 3: Continue Conversation in Branch
1. Send new messages in the branch
2. The conversation should continue from the point where you branched
3. Messages should show up normally but are now part of the branch

### Step 4: Switch Between Branches
1. Click the branch selector dropdown (shows current branch name)
2. Select "Main Thread" to go back to the original conversation
3. You should see the conversation as it was before branching
4. Switch back to your branch to see the branched conversation

### Step 5: Create Multiple Branches
1. Go back to main thread
2. Create another branch from a different message
3. You should be able to switch between multiple branches
4. Each branch should maintain its own conversation state

## Expected Behavior

### Main Thread
- Shows original conversation without any branch-specific messages
- Branch selector shows "Main Thread"
- Creating a branch from any message works

### Branch View
- Shows messages up to the branch point from main thread
- Shows additional messages specific to that branch
- Branch selector shows the branch name
- New messages are added to the branch

### Branch Switching
- Smooth transition between branches
- No data loss
- Messages reload correctly
- UI updates properly

## Technical Implementation

### Database Schema
```
messages: {
  branchId?: Id<"branches">  // Links message to specific branch
  // ... other fields
}

branches: {
  chatId: Id<"chats">
  fromMessageId: Id<"messages">  // Branch point
  name: string
  isActive: boolean
  // ... other fields
}
```

### Query Logic
```typescript
// Main thread: branchId === undefined
// Branch thread: branchId === specific branch ID
// Messages shown = beforeBranchPoint + branchSpecificMessages
```

## Troubleshooting

### Branch Not Creating
- Check that a message is selected (click the branch icon on a message)
- Ensure you're authenticated
- Check browser console for errors

### Messages Not Switching
- Verify the branch selector shows the correct active branch
- Check that the useQuery dependencies include branchId
- Ensure database indexes are properly set up

### Branch Selector Not Updating
- Confirm the switchToBranch mutation completed successfully
- Check that activeBranch query is refetching
- Verify branch creation succeeded

## Files Modified

1. `ai/convex/messages.ts` - Branch-aware message querying
2. `ai/convex/branches.ts` - Improved branch creation and switching
3. `ai/convex/ai.ts` - Branch support in AI streaming
4. `ai/src/components/chat/ChatWindow.tsx` - Branch-aware UI
5. `ai/src/components/chat/BranchSelector.tsx` - Fixed switching logic
6. `ai/src/components/chat/ChatInterface.tsx` - Type fixes
7. `ai/src/components/chat/ChatSidebar.tsx` - Async function fixes

The branching system should now work as expected, allowing users to create parallel conversation threads and switch between them seamlessly.