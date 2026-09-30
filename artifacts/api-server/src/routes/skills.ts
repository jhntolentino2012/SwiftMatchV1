import { Router } from "express";

const router = Router();

const ALL_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "PHP", "Ruby", "Go", "Swift",
  "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express.js", "Django", "Laravel", "Spring Boot",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST APIs",
  "HTML", "CSS", "Tailwind CSS", "SASS", "Bootstrap", "Figma", "Adobe Photoshop", "Adobe Illustrator",
  "Project Management", "Agile", "Scrum", "JIRA", "Confluence", "Trello",
  "Digital Marketing", "SEO", "SEM", "Google Analytics", "Social Media Marketing", "Content Creation",
  "Email Marketing", "Copywriting", "Public Relations", "Brand Management",
  "Sales", "Business Development", "CRM", "Customer Service", "Account Management",
  "Financial Analysis", "Accounting", "Bookkeeping", "Auditing", "Tax Preparation",
  "Data Analysis", "Data Science", "Machine Learning", "Power BI", "Tableau", "Excel",
  "Nursing", "Patient Care", "Medical Coding", "Phlebotomy", "BLS/ACLS", "Clinical Research",
  "Teaching", "Curriculum Development", "Training & Development", "Coaching", "Mentoring",
  "Human Resources", "Recruitment", "Talent Acquisition", "Employee Relations", "HRIS",
  "Logistics", "Supply Chain", "Inventory Management", "Procurement", "Warehousing",
  "Architecture", "Interior Design", "AutoCAD", "SketchUp", "Construction Management",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Quality Assurance",
  "Network Administration", "Cybersecurity", "Cloud Computing", "AWS", "Azure", "DevOps", "Docker",
  "Video Production", "Photography", "Adobe Premiere", "Final Cut Pro", "3D Modeling",
  "Legal Research", "Contract Drafting", "Paralegal", "Compliance",
  "Customer Support", "Technical Support", "Help Desk", "Troubleshooting",
  "Writing", "Research", "Editing", "Translation", "Language Teaching",
  "Leadership", "Team Management", "Communication", "Problem Solving", "Critical Thinking",
  "Time Management", "Adaptability", "Creativity", "Attention to Detail", "Work Ethic",
];

router.get("/suggestions", (req, res) => {
  const q = (req.query.q as string | undefined)?.toLowerCase() ?? "";
  const suggestions = q.length === 0
    ? ALL_SKILLS.slice(0, 20)
    : ALL_SKILLS.filter(s => s.toLowerCase().includes(q)).slice(0, 15);
  res.json(suggestions);
});

export default router;
