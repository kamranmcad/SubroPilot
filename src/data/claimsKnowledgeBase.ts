/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClaimRecord {
  claimId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  claimAmount: number;
  assignedAdjuster: string;
  incidentDate: string;
  policyNumber: string;
  notes: string;
}

/**
 * Knowledge Base structure representing the Excel sheet logic:
 * Row 1: Definitions
 * Row 3+: Data
 */
export const CLAIMS_KNOWLEDGE_BASE = {
  definitions: {
    claimId: "Unique identifier for the insurance claim (Format: CLM-XXXX)",
    status: "Current lifecycle state of the subrogation process (e.g., Open, Under Review, Pending Recovery, Closed)",
    createdAt: "Timestamp when the claim record was first created",
    updatedAt: "Timestamp of the last modification to the claim record",
    createdBy: "System user or department that initiated the claim",
    claimAmount: "Total monetary value associated with the subrogation claim",
    assignedAdjuster: "Full name of the specialist managing the claim",
    incidentDate: "Date the motor vehicle incident occurred",
    policyNumber: "Insurance policy ID linked to the claim",
    notes: "Detailed context or historical remarks regarding the subrogation action"
  },
  data: [
    {
      claimId: "CLM-9021",
      status: "Under Review",
      createdAt: "2024-03-15T09:00:00Z",
      updatedAt: "2024-03-20T14:30:00Z",
      createdBy: "Automated Intake System",
      claimAmount: 4500.00,
      assignedAdjuster: "Sarah Miller",
      incidentDate: "2024-03-10",
      policyNumber: "POL-77621",
      notes: "Rear-end collision, liability admitted by 3rd party carrier."
    },
    {
      claimId: "CLM-8834",
      status: "Pending Recovery",
      createdAt: "2024-02-10T11:20:00Z",
      updatedAt: "2024-04-01T10:15:00Z",
      createdBy: "Claims Specialist Alpha",
      claimAmount: 12400.50,
      assignedAdjuster: "John Dawes",
      incidentDate: "2024-02-05",
      policyNumber: "POL-11290",
      notes: "Total loss evaluation complete. Subrogation demand sent to XYZ Insurance."
    },
    {
      claimId: "CLM-4421",
      status: "Closed",
      createdAt: "2024-01-05T08:45:00Z",
      updatedAt: "2024-02-15T16:00:00Z",
      createdBy: "Manual Entry Port",
      claimAmount: 2300.00,
      assignedAdjuster: "Sarah Miller",
      incidentDate: "2023-12-28",
      policyNumber: "POL-99231",
      notes: "Recovery successful. 100% of net loss collected."
    },
    {
      claimId: "CLM-7712",
      status: "Open",
      createdAt: "2024-04-10T15:30:00Z",
      updatedAt: "2024-04-11T09:00:00Z",
      createdBy: "Claims Specialist Beta",
      claimAmount: 6700.00,
      assignedAdjuster: "Elena Rodriguez",
      incidentDate: "2024-04-05",
      policyNumber: "POL-33451",
      notes: "Initial investigation ongoing. Awaiting police report."
    },
    {
      claimId: "CLM-5567",
      status: "Under Review",
      createdAt: "2024-03-25T10:00:00Z",
      updatedAt: "2024-04-02T13:45:00Z",
      createdBy: "Automated Intake System",
      claimAmount: 1580.25,
      assignedAdjuster: "John Dawes",
      incidentDate: "2024-03-22",
      policyNumber: "POL-66712",
      notes: "Minor scratches, dispute over percentage of fault."
    }
  ]
};
