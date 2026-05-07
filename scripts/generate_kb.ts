/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const data = [
  [
    "Unique identifier for the insurance claim (Format: CLM-XXXX)",
    "Current lifecycle state of the subrogation process",
    "Full name of the specialist managing the claim",
    "Total monetary value associated with the subrogation claim",
    "Date the motor vehicle incident occurred",
    "System user or department that initiated the claim",
    "Detailed context or historical remarks"
  ],
  [
    "claimId",
    "status",
    "assignedAdjuster",
    "claimAmount",
    "incidentDate",
    "createdBy",
    "notes"
  ],
  [
    "CLM-9021",
    "Under Review",
    "Sarah Miller",
    4500.00,
    "2024-03-10",
    "Automated Intake System",
    "Rear-end collision, liability admitted by 3rd party carrier."
  ],
  [
    "CLM-8834",
    "Pending Recovery",
    "John Dawes",
    12400.50,
    "2024-02-05",
    "Claims Specialist Alpha",
    "Total loss evaluation complete. Subrogation demand sent to XYZ Insurance."
  ],
  [
    "CLM-4421",
    "Closed",
    "Sarah Miller",
    2300.00,
    "2023-12-28",
    "Manual Entry Port",
    "Recovery successful. 100% of net loss collected."
  ],
  [
    "CLM-7712",
    "Open",
    "Elena Rodriguez",
    6700.00,
    "2024-04-05",
    "Claims Specialist Beta",
    "Initial investigation ongoing. Awaiting police report."
  ]
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "ClaimsKB");

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public');
}

XLSX.writeFile(wb, './public/claims_kb.xlsx');
console.log("Excel file generated at ./public/claims_kb.xlsx");
