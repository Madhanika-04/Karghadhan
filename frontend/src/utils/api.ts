/**
 * frontend/src/utils/api.ts
 * API Service layer for connecting React frontend to FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export interface VerificationResponse {
  overall_verified: boolean;
  aadhaar_qr?: {
    is_valid: boolean;
    qr_format?: string;
    parsed_fields?: {
      uid_last_four?: string;
      name?: string;
      date_of_birth?: string;
      gender?: string;
    };
    error?: string;
  };
  aadhaar_existence?: {
    aadhaar_masked: string;
    status: string;
    exists: boolean;
    gateway_ref?: string;
    is_mock: boolean;
    error?: string;
  };
  face_match?: {
    verified: boolean;
    confidence_pct: number;
    distance: number;
    threshold: number;
    model_used: string;
    flagged_for_review: boolean;
    error?: string;
  };
  summary: string;
}

/**
 * Perform Aadhaar QR check.
 */
export async function checkAadhaarQr(file: File) {
  const formData = new FormData();
  formData.append('aadhaar_file', file);

  const res = await fetch(`${API_BASE_URL}/verification/aadhaar/qr-check`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`QR Check failed with status ${res.status}`);
  return res.json();
}

/**
 * Perform Aadhaar existence verification.
 */
export async function checkAadhaarExistence(aadhaarNumber: string) {
  const cleanNumber = aadhaarNumber.replace(/\D/g, '') || '123456789012';
  const res = await fetch(`${API_BASE_URL}/verification/aadhaar/existence-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aadhaar_number: cleanNumber }),
  });
  if (!res.ok) throw new Error(`Existence check failed with status ${res.status}`);
  return res.json();
}

/**
 * Perform Face Verification between Passbook and Aadhaar photo.
 */
export async function checkFaceMatch(passbookPhoto: File, aadhaarPhoto: File) {
  const formData = new FormData();
  formData.append('passbook_photo', passbookPhoto);
  formData.append('aadhaar_photo', aadhaarPhoto);

  const res = await fetch(`${API_BASE_URL}/verification/face-match`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Face match failed with status ${res.status}`);
  return res.json();
}

/**
 * Perform full identity verification (QR check + existence + face match).
 */
export async function runFullVerification(
  aadhaarFile: File,
  passbookPhoto?: File | null,
  aadhaarPhoto?: File | null,
  aadhaarNumber?: string
): Promise<VerificationResponse> {
  const formData = new FormData();
  formData.append('aadhaar_file', aadhaarFile);

  if (passbookPhoto instanceof File) {
    formData.append('passbook_photo', passbookPhoto);
  }
  if (aadhaarPhoto instanceof File) {
    formData.append('aadhaar_photo', aadhaarPhoto);
  }

  const cleanNumber = (aadhaarNumber || '').replace(/\D/g, '') || '123456789012';
  formData.append('aadhaar_number', cleanNumber);

  const res = await fetch(`${API_BASE_URL}/verification/full-verify`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Full verification failed (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Trigger AI Credit Evaluation for a Weaver.
 */
export async function evaluateCredit(weaverId: string, transactions?: any[], loomAssets?: any[]) {
  const res = await fetch(`${API_BASE_URL}/credit/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      weaver_id: weaverId,
      transactions,
      loom_assets: loomAssets,
    }),
  });
  if (!res.ok) throw new Error(`Credit evaluation failed with status ${res.status}`);
  return res.json();
}

/**
 * Submit Loan Application.
 */
export async function applyLoan(payload: {
  weaver_id: string;
  requested_amount: number;
  purpose: string;
  tenure_months: number;
  assessment_id?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/loans/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Loan application failed with status ${res.status}`);
  return res.json();
}
