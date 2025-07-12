import {
  users,
  skills,
  swapRequests,
  availability,
  reviews,
  chats,
  type User,
  type InsertUser,
  type UserWithSkills,
  type SwapRequestWithUsers,
  type Skill,
  type InsertSkill,
  type SwapRequest,
  type InsertSwapRequest,
  type Availability,
  type InsertAvailability,
  type Review,
  type InsertReview,
  type Chat,
  type InsertChat
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUserWithSkills(id: number): Promise<UserWithSkills | undefined>;
  searchUsers(query?: string, excludeUserId?: number): Promise<UserWithSkills[]>;

  // Skill operations
  createSkill(skill: InsertSkill): Promise<Skill>;
  deleteSkill(id: number, userId: number): Promise<boolean>;
  getSkillsByUser(userId: number): Promise<Skill[]>;

  // Swap request operations
  createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest>;
  getSwapRequestsForUser(userId: number): Promise<SwapRequestWithUsers[]>;
  getSwapRequestsSentByUser(userId: number): Promise<SwapRequestWithUsers[]>;
  updateSwapRequestStatus(id: number, status: string, userId: number): Promise<SwapRequest | undefined>;

  // Availability operations
  setAvailability(userId: number, timeSlots: string[]): Promise<void>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForUser(userId: number): Promise<Review[]>;
  hasUserReviewedSwap(reviewerId: number, swapRequestId: number): Promise<boolean>;

  // Chat operations
  createChatMessage(chat: InsertChat): Promise<Chat>;
  getChatMessages(swapRequestId: number): Promise<Chat[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUserWithSkills(id: number): Promise<UserWithSkills | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const userSkills = await db
      .select()
      .from(skills)
      .where(eq(skills.userId, id));

    const userAvailability = await db
      .select()
      .from(availability)
      .where(eq(availability.userId, id));

    const userReviews = await db
      .select({
        id: reviews.id,
        reviewerId: reviews.reviewerId,
        revieweeId: reviews.revieweeId,
        swapRequestId: reviews.swapRequestId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        reviewer: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.revieweeId, id))
      .orderBy(desc(reviews.createdAt))
      .limit(5);

    return {
      ...user,
      skillsOffered: userSkills,
      availability: userAvailability,
      reviewsReceived: userReviews
    };
  }

  async searchUsers(query?: string, excludeUserId?: number): Promise<UserWithSkills[]> {
    const userList = await db
      .select()
      .from(users)
      .limit(20);

    // Filter out excluded user if specified
    const filteredUsers = excludeUserId
      ? userList.filter(user => user.id !== excludeUserId)
      : userList;

    // Get skills and availability for each user
    const usersWithSkills = await Promise.all(
      filteredUsers.map(async (user) => {
        const userSkills = await db
          .select()
          .from(skills)
          .where(eq(skills.userId, user.id));

        const userAvailability = await db
          .select()
          .from(availability)
          .where(eq(availability.userId, user.id));

        const userReviews = await db
          .select({
            id: reviews.id,
            reviewerId: reviews.reviewerId,
            revieweeId: reviews.revieweeId,
            swapRequestId: reviews.swapRequestId,
            rating: reviews.rating,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
            reviewer: {
              id: users.id,
              name: users.name,
              email: users.email
            }
          })
          .from(reviews)
          .leftJoin(users, eq(reviews.reviewerId, users.id))
          .where(eq(reviews.revieweeId, user.id))
          .orderBy(desc(reviews.createdAt))
          .limit(3);

        return {
          ...user,
          skillsOffered: userSkills,
          availability: userAvailability,
          reviewsReceived: userReviews
        };
      })
    );

    // If there's a query, filter by skills
    if (query) {
      return usersWithSkills.filter(user =>
        user.skillsOffered.some(skill =>
          skill.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }

    return usersWithSkills;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db
      .insert(skills)
      .values(skill)
      .returning();
    return newSkill;
  }

  async deleteSkill(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(skills)
      .where(and(eq(skills.id, id), eq(skills.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.userId, userId));
  }

  async createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest> {
    const [newRequest] = await db
      .insert(swapRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async getSwapRequestsForUser(userId: number): Promise<SwapRequestWithUsers[]> {
    const requests = await db
      .select({
        id: swapRequests.id,
        requesterId: swapRequests.requesterId,
        targetId: swapRequests.targetId,
        offeredSkill: swapRequests.offeredSkill,
        requestedSkill: swapRequests.requestedSkill,
        message: swapRequests.message,
        status: swapRequests.status,
        createdAt: swapRequests.createdAt,
        requesterName: users.name,
        requesterEmail: users.email,
        requesterProfilePicture: users.profilePicture,
      })
      .from(swapRequests)
      .innerJoin(users, eq(swapRequests.requesterId, users.id))
      .where(eq(swapRequests.targetId, userId))
      .orderBy(desc(swapRequests.createdAt));

    return requests.map(req => ({
      id: req.id,
      requesterId: req.requesterId,
      targetId: req.targetId,
      offeredSkill: req.offeredSkill,
      requestedSkill: req.requestedSkill,
      message: req.message,
      status: req.status,
      createdAt: req.createdAt,
      requester: {
        id: req.requesterId,
        name: req.requesterName,
        email: req.requesterEmail,
        profilePicture: req.requesterProfilePicture,
      } as User,
      target: { id: userId } as User,
    }));
  }

  async getSwapRequestsSentByUser(userId: number): Promise<SwapRequestWithUsers[]> {
    const requests = await db
      .select({
        id: swapRequests.id,
        requesterId: swapRequests.requesterId,
        targetId: swapRequests.targetId,
        offeredSkill: swapRequests.offeredSkill,
        requestedSkill: swapRequests.requestedSkill,
        message: swapRequests.message,
        status: swapRequests.status,
        createdAt: swapRequests.createdAt,
        targetName: users.name,
        targetEmail: users.email,
        targetProfilePicture: users.profilePicture,
      })
      .from(swapRequests)
      .innerJoin(users, eq(swapRequests.targetId, users.id))
      .where(eq(swapRequests.requesterId, userId))
      .orderBy(desc(swapRequests.createdAt));

    return requests.map(req => ({
      id: req.id,
      requesterId: req.requesterId,
      targetId: req.targetId,
      offeredSkill: req.offeredSkill,
      requestedSkill: req.requestedSkill,
      message: req.message,
      status: req.status,
      createdAt: req.createdAt,
      requester: { id: userId } as User,
      target: {
        id: req.targetId,
        name: req.targetName,
        email: req.targetEmail,
        profilePicture: req.targetProfilePicture,
      } as User,
    }));
  }


  async updateSwapRequestStatus(id: number, status: string, userId: number): Promise<SwapRequest | undefined> {
    const [updatedRequest] = await db
      .update(swapRequests)
      .set({ status })
      .where(and(eq(swapRequests.id, id), eq(swapRequests.targetId, userId)))
      .returning();
    return updatedRequest || undefined;
  }

  async setAvailability(userId: number, timeSlots: string[]): Promise<void> {
    // Delete existing availability
    await db.delete(availability).where(eq(availability.userId, userId));

    // Insert new availability
    if (timeSlots.length > 0) {
      await db.insert(availability).values(
        timeSlots.map(slot => ({ userId, timeSlot: slot }))
      );
    }
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getReviewsForUser(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async hasUserReviewedSwap(reviewerId: number, swapRequestId: number): Promise<boolean> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.reviewerId, reviewerId), eq(reviews.swapRequestId, swapRequestId)))
      .limit(1);
    return !!review;
  }

  async createChatMessage(chat: InsertChat): Promise<Chat> {
    const [newChat] = await db
      .insert(chats)
      .values(chat)
      .returning();
    return newChat;
  }

  async getChatMessages(swapRequestId: number): Promise<Chat[]> {
    return await db
      .select()
      .from(chats)
      .where(eq(chats.swapRequestId, swapRequestId))
      .orderBy(chats.createdAt);
  }
}

export const storage = new DatabaseStorage();
