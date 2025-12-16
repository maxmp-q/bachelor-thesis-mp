interface SimpleData {
    name: string;
    lang: string;
    authors: number;
    forks: number;
    files: number;
    field: string;
}

interface DataPoint extends SimpleData {
    url: string;
    lang_profile: string;
}

interface AnalyzedData extends SimpleData{
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