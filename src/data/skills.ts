export type SkillCategory = {
  category: string;
  items: string[];
};

export const skills: SkillCategory[] = [
  { category: "Programming", items: ["Python", "TypeScript", "SQL", "Markdown"] },
  {
    category: "AI / Agent",
    items: [
      "OpenAI Agents SDK",
      "OpenAI API",
      "Function Tools",
      "Structured Output",
      "Multi-Agent",
      "Guardrails",
      "Human-in-the-Loop",
      "Context Engineering",
      "Amazon Bedrock",
      "Amazon Bedrock AgentCore",
      "Dify",
    ],
  },
  { category: "Backend / UI", items: ["FastAPI", "Streamlit", "REST API"] },
  { category: "Database", items: ["SQLite", "PostgreSQL"] },
  { category: "Infrastructure", items: ["AWS", "Docker", "Terraform"] },
  {
    category: "Development",
    items: ["Git", "GitHub", "GitHub Codespaces", "VS Code", "Dev Container", "Claude Code"],
  },
  {
    category: "Design / Process",
    items: [
      "SDD",
      "Requirements",
      "Design",
      "Tasks",
      "Regression Test",
      "System Specification",
      "Technology Constraints",
    ],
  },
];
