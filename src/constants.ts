/**
 * Channels and Role Ids
 */
export enum ImportantIds {
  MAIN_GUILD = "802869758503813131",
  TICKET_CATEGORY = "802894623705137182",
}

export enum Roles {
  Executive = "873145273415794708",
  DepartmentHead = "1289956449040076852",
  PublicRelations = "1303815721003913277",
  CustomerSupport = "878175903895679027",
  ServiceProvider = "802909560393695232",
}

export enum ServiceRoles {
  Livery = "1315367582601183242",
  Uniform = "1315367744098537502",
  Logos = "1315367694098239508",
  Developers = "802871568878403594",
}

/**
 * Ticket Configuration and Info
 */

export const ticketEmbedColor = "#2b2d31";
export type ticketDepartmentType =
  | "Liveries"
  | "3D Logos"
  | "Uniform"
  | "Public Relations"
  | "Development"
  | "Management"
  | "Other";
export const ticketTopicMsg =
  "In order to reply to the user, please do .reply <message> in order to do so.";
export const ticketDepartments = [
  {
    name: "Liveries",
    description: "If you wish to place a livery order.",
    allowedRoles: [ServiceRoles.Livery, Roles.Executive],
    shortCode: "liv",
  },
  {
    name: "3D Logos",
    description: "If you wish to place a 3D Logo order.",
    allowedRoles: [
      "873145273415794708",
      "1315367694098239508",
      "1289956449040076852",
    ],
    shortCode: "log",
  },
  {
    name: "Uniform",
    description: "If you wish to place a uniform order.",
    allowedRoles: [
      "873145273415794708",
      "1315367744098537502",
      "1289956449040076852",
    ],
    shortCode: "uni",
  },
  {
    name: "Public Relations",
    description: "Please use this if you wish to partner or have a PR inquiry.",
    allowedRoles: [
      "873145273415794708",
      "1303815721003913277",
      "1289956449040076852",
    ],
    shortCode: "pr",
  },
  {
    name: "Development",
    description:
      "Please select this category if you have a issue/question relating to our assets/products.",
    allowedRoles: [
      "873145273415794708",
      "802871568878403594",
      "1289956449040076852",
    ],
    shortCode: "dev",
  },
  {
    name: "Management",
    description:
      "Have an issue that needs direct intervention from executives? Select this option.",
    allowedRoles: ["873145273415794708", "1289956449040076852"],
    shortCode: "mgmt",
  },
  {
    name: "Other",
    description:
      "Select this if your ticket does not fall into the listed categories.",
    allowedRoles: [
      "873145273415794708",
      "1289956449040076852",
      "878175903895679027",
    ],
    shortCode: "other",
  },
];
