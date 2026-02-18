export interface SimpleData {
    name: string;
    lang: string;
    authors: number | string;
    forks: number | string;
    files: number | string;
    field: string;
}

export interface DataPoint extends SimpleData {
    url: string;
    lang_profile: string;
}

export interface AnalyzedData extends SimpleData{
    clone_coverage: number;
    findings_count: number;
    LOC: number;
    method_length: Separation;
    nesting_depth: Separation;
    findings_details: FindingsInfo[];
}

export interface FindingsInfo{
    categoryName: string;
    count: number;
    countRed: number;
}

export interface Separation{
    red: number;
    yellow: number;
    green: number;
}
