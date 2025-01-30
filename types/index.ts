// types/index.ts
export type FriendRequest = {
    id: string
    status: 'pending' | 'accepted'
    requester: { email: string }
    receiver: { email: string }
  }
  
  export type FriendRelationship = {
    id: string
    status: string
    user: { id: string; email: string }
    friend: { id: string; email: string }
  }