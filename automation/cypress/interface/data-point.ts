interface DataPoint {
    name: string;
    url: string;
    lang_profile: string;
    lang: string;
}

interface AnalyzedData {
    name: string;
    lang: string;
    clone_coverage: number;
    findings_count: number;
    LOC: number;
    method_length: Separation;
    nesting_depth: Separation;
    findings_details: FindingsInfo[];
}

interface FindingsInfo{
    categoryName: string;
    count: number;
    countRed: number;
}

interface Separation{
    red: number;
    yellow: number;
    green: number;
}