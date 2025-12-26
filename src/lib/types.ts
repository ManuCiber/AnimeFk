import { Board, Comment, Pin, User } from "@/generated/prisma/client";

export type PinWithRelations = Pin & {
    user: Pick<User, 'id' | 'name' | 'image'>
    _count: {
        likes: number
        comments: number
    }
    isLiked?: boolean
    board?: Pick<Board, 'id'|'name'> | null
}

export type PinDetail = Pin & {
    user: Pick<User, 'id'|'name'|'image'|'bio'>
    board: Pick<Board, 'id'|'name'> | null
    comments: CommentWithUser[]
    _count: {
        likes: number
        comments: number
    }
    isLiked: boolean
}

export type CommentWithUser = Comment & {
    user: Pick<User, 'id' | 'name' | 'image'>
}

export interface PaginatedResponse<T>{
    pins: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasMore: boolean
    }
}

export type BoardWithPins = Board & {
    user: Pick<User, 'id' | 'name' | 'image'>
    pins: PinWithRelations[]
}