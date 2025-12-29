
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Clock, AlertCircle, Edit3, Trash2, Building2, ChevronDown, ChevronUp, Database, ArrowDownAz, Users, AlertTriangle } from 'lucide-react';
import { DeliveryRecord, ResidenceStatus } from './types';
import { parseNaturalLanguageSearch, getAIInsight } from './services/geminiService';

// 한글 초성 추출 유틸리티
const getChosung = (str: string) => {
  const cho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
    else result += str.charAt(i);
  }
  return result;
};

// 이미지 시각적 순서 (1열:좌측 -> 2열:중앙 -> 3열:우측)
const BUILDING_ORDER = [
  // 1열 (왼쪽)
  "65-16 제이지1차", "65-12 더리안", "65-7", "195 스카이하이1차", "195-6 제이지 2차", "195-8 힐링타운", "195-10 이스토리", "195-12 스타일힐스",
  // 2열 (가운데)
  "60-5 무들에코 클래스", "65-4 AM city 1차", "65-8 제이지 3차", "65-11 스카이하이 2차", "11-10 더허브",
  // 3열 (오른쪽)
  "106-25 트레비엔", "124-5-20", "124-54", "124-51", "788", "136", "106-50", "800-72 대성트윈스", "102", "LC타워"
];

const INITIAL_DATA: DeliveryRecord[] = [
  // 1열 데이터
  { id: 'jg1-1', buildingName: '65-16 제이지1차', unitNumber: '808', residentName: '고미진', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg1-2', buildingName: '65-16 제이지1차', unitNumber: '501', residentName: '김용운', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg1-3', buildingName: '65-16 제이지1차', unitNumber: '304', residentName: '김주영', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg1-4', buildingName: '65-16 제이지1차', unitNumber: '407', residentName: '김진수', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg1-5', buildingName: '65-16 제이지1차', unitNumber: '104', residentName: '김현서', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg1-6', buildingName: '65-16 제이지1차', unitNumber: '407', residentName: '민승미, 안대해', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg1-7', buildingName: '65-16 제이지1차', unitNumber: '208', residentName: '안성희', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg1-8', buildingName: '65-16 제이지1차', unitNumber: '804', residentName: '이현배', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg1-9', buildingName: '65-16 제이지1차', unitNumber: '702', residentName: '최현준', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'dr-1', buildingName: '65-12 더리안', unitNumber: '2층', residentName: '다원주택건설', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'dr-2', buildingName: '65-12 더리안', unitNumber: '602', residentName: '박성호', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'dr-3', buildingName: '65-12 더리안', unitNumber: '509', residentName: '하정우', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-7', buildingName: '65-7', unitNumber: '401', residentName: '삼인약품', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh1-1', buildingName: '195 스카이하이1차', unitNumber: '415', residentName: '강마루', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh1-2', buildingName: '195 스카이하이1차', unitNumber: '505', residentName: '김민재', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh1-3', buildingName: '195 스카이하이1차', unitNumber: '406', residentName: '김요한', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh1-4', buildingName: '195 스카이하이1차', unitNumber: '305', residentName: '김한섭', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh1-5', buildingName: '195 스카이하이1차', unitNumber: '1006', residentName: '김형기', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh1-6', buildingName: '195 스카이하이1차', unitNumber: '707', residentName: '손건호', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh1-7', buildingName: '195 스카이하이1차', unitNumber: '806', residentName: '윤석화', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh1-8', buildingName: '195 스카이하이1차', unitNumber: '813', residentName: '정현준', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-1', buildingName: '195-6 제이지 2차', unitNumber: '201', residentName: '김한수', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-2', buildingName: '195-6 제이지 2차', unitNumber: '1001', residentName: '김현주', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-3', buildingName: '195-6 제이지 2차', unitNumber: '402', residentName: '박경호', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-4', buildingName: '195-6 제이지 2차', unitNumber: '906', residentName: '서주형', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-5', buildingName: '195-6 제이지 2차', unitNumber: '507', residentName: '송서아', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-6', buildingName: '195-6 제이지 2차', unitNumber: '709', residentName: '안수중', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-7', buildingName: '195-6 제이지 2차', unitNumber: '1102', residentName: '이동순', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-8', buildingName: '195-6 제이지 2차', unitNumber: '1104', residentName: '이성진', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-9', buildingName: '195-6 제이지 2차', unitNumber: '409', residentName: '장성열', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg2-10', buildingName: '195-6 제이지 2차', unitNumber: '1003', residentName: '최기용', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'ht-1', buildingName: '195-8 힐링타운', unitNumber: '405', residentName: '문성만', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'es-1', buildingName: '195-10 이스토리', unitNumber: '405', residentName: '박준영', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'es-2', buildingName: '195-10 이스토리', unitNumber: '402', residentName: '이용수, 진양수', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'es-3', buildingName: '195-10 이스토리', unitNumber: '205', residentName: '최진호', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'st-1', buildingName: '195-12 스타일힐스', unitNumber: '304', residentName: '곽유선', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },

  // 2열 데이터
  { id: 'mec-1', buildingName: '60-5 무들에코 클래스', unitNumber: '1506', residentName: '강병윤', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-2', buildingName: '60-5 무들에코 클래스', unitNumber: '1201', residentName: '김문진', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-3', buildingName: '60-5 무들에코 클래스', unitNumber: '1002', residentName: '김승권', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-4', buildingName: '60-5 무들에코 클래스', unitNumber: '527', residentName: '김연화', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-5', buildingName: '60-5 무들에코 클래스', unitNumber: '1418', residentName: '김용령', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-6', buildingName: '60-5 무들에코 클래스', unitNumber: '725', residentName: '김재상', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-7', buildingName: '60-5 무들에코 클래스', unitNumber: '321', residentName: '다이너알리', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-8', buildingName: '60-5 무들에코 클래스', unitNumber: '427', residentName: '문서훈', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-9', buildingName: '60-5 무들에코 클래스', unitNumber: '1007', residentName: '박은진', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-10', buildingName: '60-5 무들에코 클래스', unitNumber: '730', residentName: '박지혜', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-11', buildingName: '60-5 무들에코 클래스', unitNumber: '1207', residentName: '배광석, 왕지만', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-12', buildingName: '60-5 무들에코 클래스', unitNumber: '530', residentName: '손영석', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-13', buildingName: '60-5 무들에코 클래스', unitNumber: '911', residentName: '지은용', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-14', buildingName: '60-5 무들에코 클래스', unitNumber: '412', residentName: '진형욱', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-15', buildingName: '60-5 무들에코 클래스', unitNumber: '636', residentName: '최근화', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-16', buildingName: '60-5 무들에코 클래스', unitNumber: '1506', residentName: '최유리', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-17', buildingName: '60-5 무들에코 클래스', unitNumber: '1402', residentName: '최정태', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'mec-18', buildingName: '60-5 무들에코 클래스', unitNumber: '321', residentName: '한명섭', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'am1-1', buildingName: '65-4 AM city 1차', unitNumber: '306', residentName: '손학진', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'am1-2', buildingName: '65-4 AM city 1차', unitNumber: '509', residentName: '신지환', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'am1-3', buildingName: '65-4 AM city 1차', unitNumber: '606', residentName: '김윤', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'jg3-1', buildingName: '65-8 제이지 3차', unitNumber: '1103', residentName: '이호림', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh2-1', buildingName: '65-11 스카이하이 2차', unitNumber: '507', residentName: '문성훈', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'sh2-2', buildingName: '65-11 스카이하이 2차', unitNumber: '1005', residentName: '최성희', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-1', buildingName: '11-10 더허브', unitNumber: '1505', residentName: '김수한, 김태현', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-2', buildingName: '11-10 더허브', unitNumber: '1013', residentName: '김장환', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-3', buildingName: '11-10 더허브', unitNumber: '712', residentName: '김혜랑', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-4', buildingName: '11-10 더허브', unitNumber: '2105', residentName: '박강민', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-5', buildingName: '11-10 더허브', unitNumber: '1905', residentName: '박윤상', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-6', buildingName: '11-10 더허브', unitNumber: '612', residentName: '백종대', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-7', buildingName: '11-10 더허브', unitNumber: '1902', residentName: '양대훈', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-8', buildingName: '11-10 더허브', unitNumber: '1004', residentName: '이성진', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-9', buildingName: '11-10 더허브', unitNumber: '1510', residentName: '이은하', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-10', buildingName: '11-10 더허브', unitNumber: '1005', residentName: '이정민', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-11', buildingName: '11-10 더허브', unitNumber: '1313', residentName: '정한영', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-12', buildingName: '11-10 더허브', unitNumber: '603', residentName: '최현주', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'hub-13', buildingName: '11-10 더허브', unitNumber: '511', residentName: '한창훈', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },

  // 3열 데이터
  { id: 'tre-1', buildingName: '106-25 트레비엔', unitNumber: '2005', residentName: '나명훈', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-2', buildingName: '106-25 트레비엔', unitNumber: '817', residentName: '김판길', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-3', buildingName: '106-25 트레비엔', unitNumber: '1411', residentName: '김하영', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-4', buildingName: '106-25 트레비엔', unitNumber: '1318', residentName: '문동민', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-5', buildingName: '106-25 트레비엔', unitNumber: '2006', residentName: '박아현', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-6', buildingName: '106-25 트레비엔', unitNumber: '1604', residentName: '박에스더', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-7', buildingName: '106-25 트레비엔', unitNumber: '419', residentName: '박영순', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-8', buildingName: '106-25 트레비엔', unitNumber: '410', residentName: '변회원', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-9', buildingName: '106-25 트레비엔', unitNumber: '518', residentName: '여종현', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-10', buildingName: '106-25 트레비엔', unitNumber: '1013', residentName: '와이에이치', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-11', buildingName: '106-25 트레비엔', unitNumber: '1013', residentName: '윤석호', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'tre-12', buildingName: '106-25 트레비엔', unitNumber: '918', residentName: '이미영', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-124', buildingName: '124-5-20', unitNumber: '102', residentName: '김경무', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-124-2', buildingName: '124-5-20', unitNumber: '304', residentName: '류명주', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-124-54', buildingName: '124-54', unitNumber: '4층', residentName: '주식회사서해이엠씨 진명건축사무소 양기봉', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-124-51', buildingName: '124-51', unitNumber: '1층', residentName: '유현일', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-788', buildingName: '788', unitNumber: '치과', residentName: '심은주', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-788-2', buildingName: '788', unitNumber: '2층', residentName: '부경산업', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-136', buildingName: '136', unitNumber: '313', residentName: '엘에스이 새정상학원', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'etc-106-50', buildingName: '106-50', unitNumber: '302', residentName: '에스케이개발', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'dt-1', buildingName: '800-72 대성트윈스', unitNumber: '207', residentName: '주식회사미래월드', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'dt-2', buildingName: '800-72 대성트윈스', unitNumber: '3층', residentName: '유한회사 규남', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'b102-1', buildingName: '102', unitNumber: '105', residentName: '박혜민', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'lc-1', buildingName: 'LC타워', unitNumber: '402', residentName: 'LC', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' },
  { id: 'lc-2', buildingName: 'LC타워', unitNumber: '130', residentName: '백금옥 못난고양이', status: ResidenceStatus.UNKNOWN, lastUpdated: '2024-05-20' }
];

type ViewMode = 'database' | 'search';
type SortOption = 'default' | 'name' | 'units' | 'unknown';

const App: React.FC = () => {
  const [records, setRecords] = useState<DeliveryRecord[]>(() => {
    const saved = localStorage.getItem('postman_records');
    if (!saved) return INITIAL_DATA;
    try {
      return JSON.parse(saved) as DeliveryRecord[];
    } catch (e) {
      return INITIAL_DATA;
    }
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('database');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DeliveryRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<DeliveryRecord>>({
    status: ResidenceStatus.UNKNOWN,
    buildingName: '',
    unitNumber: '',
    residentName: '',
    memo: ''
  });

  useEffect(() => {
    localStorage.setItem('postman_records', JSON.stringify(records));
  }, [records]);

  const groupedAndSortedRecords = useMemo(() => {
    const q = searchQuery.toLowerCase();
    
    const filtered = records.filter(r => {
      // 일반 텍스트 검색 (대소문자 무시)
      const buildingMatch = r.buildingName.toLowerCase().includes(q);
      const unitMatch = r.unitNumber.includes(q);
      const nameMatch = r.residentName.toLowerCase().includes(q);
      
      // 초성 검색
      const buildingChosung = getChosung(r.buildingName);
      const nameChosung = getChosung(r.residentName);
      
      const buildingChoMatch = buildingChosung.includes(q);
      const nameChoMatch = nameChosung.includes(q);

      return buildingMatch || unitMatch || nameMatch || buildingChoMatch || nameChoMatch;
    });

    const groups: { [key: string]: DeliveryRecord[] } = {};
    filtered.forEach(record => {
      if (!groups[record.buildingName]) {
        groups[record.buildingName] = [];
      }
      groups[record.buildingName].push(record);
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true }));
    });

    const sortedBuildingKeys = Object.keys(groups).sort((a, b) => {
      if (sortBy === 'default') {
        const indexA = BUILDING_ORDER.indexOf(a);
        const indexB = BUILDING_ORDER.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      }
      if (sortBy === 'name') return a.localeCompare(b);
      if (sortBy === 'units') return groups[b].length - groups[a].length;
      if (sortBy === 'unknown') {
        const unknownA = groups[a].filter(r => r.status === ResidenceStatus.UNKNOWN).length;
        const unknownB = groups[b].filter(r => r.status === ResidenceStatus.UNKNOWN).length;
        return unknownB - unknownA;
      }
      return 0;
    });

    return { groups, sortedBuildingKeys };
  }, [searchQuery, records, sortBy]);

  const toggleBuilding = (buildingName: string) => {
    setExpandedBuildings(prev => {
      const next = new Set(prev);
      if (next.has(buildingName)) next.delete(buildingName);
      else next.add(buildingName);
      return next;
    });
  };

  const getStatusColor = (status: ResidenceStatus) => {
    switch (status) {
      case ResidenceStatus.UNKNOWN: return 'bg-red-50 text-red-700 border-red-100';
      case ResidenceStatus.RESIDING: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case ResidenceStatus.MOVED: return 'bg-amber-50 text-amber-700 border-amber-100';
      case ResidenceStatus.VACANT: return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const addOrUpdateRecord = (record: DeliveryRecord) => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === record.id);
      if (exists) return prev.map(r => r.id === record.id ? record : r);
      return [record, ...prev];
    });
    setIsAddModalOpen(false);
    setSelectedRecord(null);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('기록을 삭제하시겠습니까?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      setSelectedRecord(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 max-w-md mx-auto relative shadow-2xl border-x overflow-hidden">
      <header className="bg-indigo-700 text-white sticky top-0 z-20 shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">집배원 스마트 리스트</h1>
                <p className="text-[10px] text-indigo-200 font-medium">초성 검색 지원 중 (ㄱㅁㅈ 등)</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setNewRecord({ status: ResidenceStatus.UNKNOWN, buildingName: '', unitNumber: '', residentName: '', lastUpdated: new Date().toISOString().split('T')[0], memo: '' });
                setIsAddModalOpen(true);
              }}
              className="p-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-full transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setSortBy('default')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border shrink-0 ${sortBy === 'default' ? 'bg-white text-indigo-700 border-white' : 'bg-indigo-600/40 text-indigo-100 border-indigo-500/30'}`}>
              <Clock className="w-3.5 h-3.5" /> 기본순
            </button>
            <button onClick={() => setSortBy('name')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border shrink-0 ${sortBy === 'name' ? 'bg-white text-indigo-700 border-white' : 'bg-indigo-600/40 text-indigo-100 border-indigo-500/30'}`}>
              <ArrowDownAz className="w-3.5 h-3.5" /> 건물명순
            </button>
            <button onClick={() => setSortBy('units')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border shrink-0 ${sortBy === 'units' ? 'bg-white text-indigo-700 border-white' : 'bg-indigo-600/40 text-indigo-100 border-indigo-500/30'}`}>
              <Users className="w-3.5 h-3.5" /> 세대수순
            </button>
            <button onClick={() => setSortBy('unknown')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border shrink-0 ${sortBy === 'unknown' ? 'bg-white text-indigo-700 border-white' : 'bg-indigo-600/40 text-indigo-100 border-indigo-500/30'}`}>
              <AlertTriangle className="w-3.5 h-3.5" /> 불명순
            </button>
          </div>
          
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="건물, 호수, 이름(초성 가능) 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-2 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-xs"
            />
            <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-white/40" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-32 overflow-y-auto">
        <div className="space-y-4">
          {groupedAndSortedRecords.sortedBuildingKeys.length > 0 ? (
            groupedAndSortedRecords.sortedBuildingKeys.map(building => {
              const bRecords = groupedAndSortedRecords.groups[building];
              const unknownCount = bRecords.filter(r => r.status === ResidenceStatus.UNKNOWN).length;
              const isExpanded = expandedBuildings.has(building) || searchQuery.length > 0; // 검색 중에는 자동 확장
              return (
                <div key={building} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                  <button onClick={() => toggleBuilding(building)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0"><Building2 className="w-5 h-5" /></div>
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{building}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-400">{bRecords.length}세대</span>
                          {unknownCount > 0 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 불명 {unknownCount}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-full text-slate-400 shrink-0">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-2">
                      <div className="border-t border-slate-50 pt-4 grid grid-cols-1 gap-2">
                        {bRecords.map(record => (
                          <div key={record.id} onClick={() => setSelectedRecord(record)} className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${record.status === ResidenceStatus.UNKNOWN ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-transparent'}`}>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className="text-sm font-black text-slate-800 w-12 shrink-0">{record.unitNumber}</span>
                              <span className="text-xs font-bold text-slate-600 truncate">{record.residentName}</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black border shrink-0 ${getStatusColor(record.status)}`}>{record.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      {selectedRecord && (
        <div className="fixed inset-0 z-30 flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRecord(null)}></div>
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-bottom duration-300">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-indigo-500 block mb-1">{selectedRecord.buildingName}</span>
                <h2 className="text-3xl font-black text-slate-900">{selectedRecord.unitNumber}호</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-slate-600">{selectedRecord.residentName} · {selectedRecord.status}</span>
                </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => {setNewRecord(selectedRecord); setIsAddModalOpen(true); setSelectedRecord(null);}} className="p-3 bg-slate-100 rounded-2xl"><Edit3 className="w-5 h-5" /></button>
                 <button onClick={() => deleteRecord(selectedRecord.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="bg-slate-50 rounded-3xl p-6 mb-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">배달 특이사항</h4>
              <p className="text-slate-700 text-sm leading-relaxed">{selectedRecord.memo || '이 주소에 살지 않는 사람으로 확인되었습니다. (수취인불명)'}</p>
            </div>
            <button onClick={() => setSelectedRecord(null)} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem]">닫기</button>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-slate-900">{newRecord.id ? '기록 수정' : '새 기록 추가'}</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">건물명</label>
                <input type="text" placeholder="건물명 입력" value={newRecord.buildingName} onChange={e => setNewRecord({...newRecord, buildingName: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">호수</label>
                  <input type="text" placeholder="호수" value={newRecord.unitNumber} onChange={e => setNewRecord({...newRecord, unitNumber: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">이름</label>
                  <input type="text" placeholder="수취인명" value={newRecord.residentName} onChange={e => setNewRecord({...newRecord, residentName: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">배달 상태</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(ResidenceStatus).map(status => (
                    <button key={status} onClick={() => setNewRecord({...newRecord, status})} className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${newRecord.status === status ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}>{status}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">메모</label>
                <textarea placeholder="특이사항 입력" value={newRecord.memo} onChange={e => setNewRecord({...newRecord, memo: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none font-medium h-24 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl">취소</button>
              <button onClick={() => addOrUpdateRecord({...newRecord, id: newRecord.id || Math.random().toString(36).substr(2, 9), lastUpdated: new Date().toISOString().split('T')[0]} as DeliveryRecord)} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-transform">저장하기</button>
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 w-full max-w-md bg-white border-t p-4 pb-8 z-20">
        <div className="flex justify-around items-center">
          <button onClick={() => setViewMode('database')} className={`flex flex-col items-center gap-1 ${viewMode === 'database' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Database className="w-6 h-6" />
            <span className="text-[10px] font-bold">전체 DB</span>
          </button>
          <div className="w-12"></div> {/* Spacer for floating button */}
          <button onClick={() => setViewMode('search')} className={`flex flex-col items-center gap-1 ${viewMode === 'search' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-bold">상세 검색</span>
          </button>
        </div>
        <button 
          onClick={() => {
            setNewRecord({ status: ResidenceStatus.UNKNOWN, buildingName: '', unitNumber: '', residentName: '', lastUpdated: new Date().toISOString().split('T')[0], memo: '' });
            setIsAddModalOpen(true);
          }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white p-4 rounded-full shadow-xl border-4 border-white active:scale-90 transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>
      </footer>
    </div>
  );
};

export default App;
