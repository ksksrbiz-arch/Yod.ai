# Security Specification for Jedi Holocron Terminal

## 1. Data Invariants
- A user document can only be created by the user themselves, and must have `email`, `createdAt`, and `rank` initialized to "youngling".
- A user can only access their own messages.
- A message must belong to the user (`userId` matches the parent `userId`) and `createdAt` must be `request.time`.
- `createdAt` and `email` are immutable once created.

## 2. The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Attempt to create a user profile with a different user's UID.
2. **Missing required fields**: Create a user profile missing `createdAt` or `rank`.
3. **Invalid type poisoning**: Update `rank` to an integer `123`.
4. **Privilege Escalation**: User tries to update their own rank to "master".
5. **Orphaned Writes**: Create a message in a non-existent user's subcollection.
6. **Immutable field modification**: Attempt to change `createdAt` on an update.
7. **Cross-Tenant Access**: Attempt to read the user document of another authenticated user.
8. **Subcollection Scraping**: `list` operation on `/users/{otherId}/messages` by a different user.
9. **Shadow Update (Ghost field)**: Create a user document with an unexpected `isAdmin = true` field.
10. **Time spoofing**: Creating a message with a future timestamp instead of `request.time`.
11. **Size explosion**: Set `text` on a message to a 2MB string.
12. **Role spoofing**: Set `role` on a message to an unexpected enum value.
