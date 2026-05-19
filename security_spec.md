# ProCard Security Specification

## Data Invariants
1. **Profiles**: Every user has exactly one profile document at `/profiles/{userId}` where `userId` matches their Auth UID.
2. **CRM Privacy**: Contacts saved at `/users/{userId}/contacts/{contactUserId}` are strictly private to the user identified by `userId`.
3. **Publicity**: Professionals want their cards seen; profiles are public, but contact lists are secret.

## The "Dirty Dozen" Payloads (Deny Cases)
1. Creating a profile for someone else.
2. Updating someone else's bio.
3. Reading someone else's saved contacts.
4. Setting a future `updatedAt` on a profile.
5. Saving a contact as "admin".
6. Profiles with no name or email.
7. Injecting 1MB of junk into the LinkedIn URL.
8. Deleting someone else's profile.
9. Listing all user contacts as another user.
10. Creating a contact without a reference to a real user.
11. Updating a profile's `userId` after creation (Immutability).
12. Anonymous writes to any profile.

## Firestore Rules Plan
- `isValidProfile()`: Checks keys, types, and sizes.
- `isValidContact()`: Checks relational integrity and ownership.
- `isOwner(userId)`: Standard auth check.
