import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import { insertUserSchema, insertSwapRequestSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'skillswap-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
      });

      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUserWithSkills(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        location: user.location,
        profilePicture: user.profilePicture,
        skillsOffered: user.skillsOffered,
        availability: user.availability
      } 
    });
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const { search } = req.query;
      const users = await storage.searchUsers(
        search as string, 
        req.session.userId
      );
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserWithSkills(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const { name, location, skillsOffered, skillsWanted, availability } = req.body;
      const userId = req.session.userId!;

      // Update user basic info
      await storage.updateUser(userId, { name, location });

      // Update skills - delete existing and create new ones
      const existingSkills = await storage.getSkillsByUser(userId);
      for (const skill of existingSkills) {
        await storage.deleteSkill(skill.id, userId);
      }

      // Add new skills
      if (skillsOffered && Array.isArray(skillsOffered)) {
        for (const skillName of skillsOffered) {
          await storage.createSkill({
            userId,
            name: skillName,
            type: 'offered'
          });
        }
      }

      if (skillsWanted && Array.isArray(skillsWanted)) {
        for (const skillName of skillsWanted) {
          await storage.createSkill({
            userId,
            name: skillName,
            type: 'wanted'
          });
        }
      }

      // Update availability
      if (availability && Array.isArray(availability)) {
        await storage.setAvailability(userId, availability);
      }

      const updatedUser = await storage.getUserWithSkills(userId);
      res.json({ user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Swap request routes
  app.post("/api/swap-requests", requireAuth, async (req, res) => {
    try {
      const { targetId, offeredSkill, requestedSkill, message } = req.body;
      const requesterId = req.session.userId!;

      if (requesterId === targetId) {
        return res.status(400).json({ message: "Cannot request swap with yourself" });
      }

      const swapRequest = await storage.createSwapRequest({
        requesterId,
        targetId,
        offeredSkill,
        requestedSkill,
        message,
        status: 'pending'
      });

      res.json({ swapRequest });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/swap-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requests = await storage.getSwapRequestsForUser(userId);
      res.json({ requests });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/swap-requests/:id", requireAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.session.userId!;

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedRequest = await storage.updateSwapRequestStatus(requestId, status, userId);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found or not authorized" });
      }

      res.json({ swapRequest: updatedRequest });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
