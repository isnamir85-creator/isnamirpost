
export enum ResidenceStatus {
  RESIDING = '거주중',
  MOVED = '이사함',
  UNKNOWN = '수취인불명',
  VACANT = '공실',
  ADDRESS_ERROR = '주소오류'
}

export interface DeliveryRecord {
  id: string;
  buildingName: string;
  unitNumber: string;
  residentName: string;
  status: ResidenceStatus;
  lastUpdated: string;
  memo?: string;
}

export interface SearchResult {
  records: DeliveryRecord[];
  aiInsight?: string;
}
