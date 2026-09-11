export interface CaseReport {
  case_number: string;
  date_filed: string;
  vibe: string;
  charge: string;
  evidence: string;
  suspicion_percent: number;
  verdict: string;
  stamp: string;
  lawyer_name: string;
  court_observations: string;
  appeal_count?: number;
}

export interface CrossExamMessage {
  id: string;
  role: 'user' | 'lawyer';
  content: string;
  timestamp: string;
}

export interface CaseAnalysisRequest {
  image: {
    data: string; // base64 without prefix or with prefix
    mimeType: string;
  };
  isAppeal?: boolean;
  previousCase?: CaseReport;
}

export interface CrossExamRequest {
  question: string;
  caseReport: CaseReport;
  chatHistory?: { role: 'user' | 'lawyer'; content: string }[];
}
