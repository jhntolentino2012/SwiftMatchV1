import { Router } from "express";
import { db, coursesTable } from "@workspace/db";

const router = Router();

const SEED_COURSES = [
  {
    title: "Full-Stack Web Development Bootcamp",
    provider: "Zuitt Coding Bootcamp",
    description: "A comprehensive program covering HTML, CSS, JavaScript, React, Node.js, and databases. Perfect for aspiring developers.",
    duration: "3 months",
    category: "Technology",
    skillsGained: ["JavaScript", "React", "Node.js", "SQL", "REST APIs"],
    status: "available",
    url: "https://zuitt.co",
  },
  {
    title: "Digital Marketing Fundamentals",
    provider: "Google Digital Garage",
    description: "Learn the basics of digital marketing, including SEO, social media marketing, email campaigns, and analytics.",
    duration: "6 weeks",
    category: "Marketing",
    skillsGained: ["SEO", "Social Media Marketing", "Google Analytics", "Email Marketing"],
    status: "available",
    url: "https://learndigital.withgoogle.com",
  },
  {
    title: "Project Management Professional (PMP) Prep",
    provider: "PM Learning Academy",
    description: "Prepare for the PMP certification with this comprehensive course covering all areas of project management.",
    duration: "8 weeks",
    category: "Management",
    skillsGained: ["Project Planning", "Risk Management", "Team Leadership", "Agile", "Scrum"],
    status: "available",
    url: null,
  },
  {
    title: "Data Analytics with Python",
    provider: "Coursera / IBM",
    description: "Gain hands-on experience with Python, Pandas, NumPy, and data visualization tools to analyze real-world datasets.",
    duration: "4 months",
    category: "Technology",
    skillsGained: ["Python", "Data Analysis", "Pandas", "Data Visualization", "SQL"],
    status: "available",
    url: "https://coursera.org",
  },
  {
    title: "Professional Communication Skills",
    provider: "SwiftMatch Learning Hub",
    description: "Enhance your workplace communication, presentation skills, and professional writing to advance your career.",
    duration: "3 weeks",
    category: "Soft Skills",
    skillsGained: ["Business Writing", "Public Speaking", "Active Listening", "Negotiation"],
    status: "coming_soon",
    url: null,
  },
  {
    title: "Financial Literacy for Professionals",
    provider: "BDO Institute of Banking",
    description: "Understand financial statements, budgeting, investment basics, and how to manage your finances as a professional.",
    duration: "4 weeks",
    category: "Finance",
    skillsGained: ["Financial Planning", "Budgeting", "Investment Basics", "Tax Planning"],
    status: "coming_soon",
    url: null,
  },
  {
    title: "Customer Service Excellence",
    provider: "SwiftMatch Learning Hub",
    description: "Master the art of delivering exceptional customer experiences, handling difficult situations, and building loyalty.",
    duration: "2 weeks",
    category: "Customer Service",
    skillsGained: ["Customer Relations", "Conflict Resolution", "CRM Tools", "Active Listening"],
    status: "sponsored",
    url: null,
  },
  {
    title: "Leadership & Team Management",
    provider: "Asian Institute of Management",
    description: "Develop your leadership style, learn to motivate teams, and navigate organizational challenges with confidence.",
    duration: "6 weeks",
    category: "Management",
    skillsGained: ["Team Leadership", "Strategic Thinking", "Coaching", "Decision Making"],
    status: "coming_soon",
    url: null,
  },
];

async function ensureCoursesSeeded() {
  const existing = await db.select().from(coursesTable);
  if (existing.length === 0) {
    for (const course of SEED_COURSES) {
      await db.insert(coursesTable).values(course as typeof coursesTable.$inferInsert);
    }
  }
}

router.get("/", async (req, res) => {
  try {
    await ensureCoursesSeeded();
    const courses = await db.select().from(coursesTable);
    res.json(courses);
  } catch (err) {
    req.log.error({ err }, "Failed to list courses");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
