
import { MedicalInsight } from '../types';

// ============================================
// FREE MEDICAL GROUNDING SERVICES
// ============================================

// --- PubMed API (NCBI E-utilities) ---
// Free public API for medical literature search

interface PubMedArticle {
    pmid: string;
    title: string;
    authors: string[];
    journal: string;
    pubDate: string;
    abstract?: string;
}

export const searchPubMed = async (query: string, maxResults: number = 5): Promise<PubMedArticle[]> => {
    try {
        // Step 1: Search for PMIDs
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        const pmids = searchData.esearchresult?.idlist || [];
        if (pmids.length === 0) return [];

        // Step 2: Fetch article summaries
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
        const summaryResponse = await fetch(summaryUrl);
        const summaryData = await summaryResponse.json();

        const articles: PubMedArticle[] = [];
        for (const pmid of pmids) {
            const article = summaryData.result?.[pmid];
            if (article) {
                articles.push({
                    pmid,
                    title: article.title || 'No title',
                    authors: article.authors?.map((a: any) => a.name) || [],
                    journal: article.source || 'Unknown',
                    pubDate: article.pubdate || 'Unknown',
                });
            }
        }
        return articles;
    } catch (error) {
        console.error('[PubMed] Search failed:', error);
        return [];
    }
};

// --- OpenFDA API ---
// Free public API for drug information and adverse events

interface DrugInfo {
    brandName: string;
    genericName: string;
    manufacturer: string;
    warnings: string[];
    indications: string[];
    adverseReactions: string[];
}

export const searchDrugInfo = async (drugName: string): Promise<DrugInfo | null> => {
    try {
        const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"+openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
                brandName: result.openfda?.brand_name?.[0] || drugName,
                genericName: result.openfda?.generic_name?.[0] || '',
                manufacturer: result.openfda?.manufacturer_name?.[0] || 'Unknown',
                warnings: result.warnings || result.boxed_warning || [],
                indications: result.indications_and_usage || [],
                adverseReactions: result.adverse_reactions ? [result.adverse_reactions[0]?.substring(0, 500)] : [],
            };
        }
        return null;
    } catch (error) {
        console.error('[OpenFDA] Drug search failed:', error);
        return null;
    }
};

interface DrugInteraction {
    drug1: string;
    drug2: string;
    description: string;
    severity: 'minor' | 'moderate' | 'major';
}

export const checkDrugInteractions = async (drugNames: string[]): Promise<DrugInteraction[]> => {
    // OpenFDA's adverse event reports can hint at interactions
    // For robust interaction checking, we query adverse events mentioning multiple drugs
    const interactions: DrugInteraction[] = [];

    if (drugNames.length < 2) return interactions;

    try {
        // Search for adverse events mentioning drug combinations
        for (let i = 0; i < drugNames.length; i++) {
            for (let j = i + 1; j < drugNames.length; j++) {
                const drug1 = drugNames[i];
                const drug2 = drugNames[j];

                const url = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drug1)}"+AND+patient.drug.medicinalproduct:"${encodeURIComponent(drug2)}"&limit=1`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.meta?.results?.total > 10) {
                    // Significant number of adverse events with both drugs
                    interactions.push({
                        drug1,
                        drug2,
                        description: `${data.meta.results.total} adverse event reports involving both medications`,
                        severity: data.meta.results.total > 100 ? 'major' : data.meta.results.total > 50 ? 'moderate' : 'minor'
                    });
                }
            }
        }
    } catch (error) {
        console.error('[OpenFDA] Interaction check failed:', error);
    }

    return interactions;
};

// --- RxNorm API (NIH NLM) ---
// Free API for drug name standardization and relationships

interface RxNormConcept {
    rxcui: string;
    name: string;
    tty: string; // Term type (brand, generic, ingredient, etc.)
}

export const standardizeDrugName = async (drugName: string): Promise<RxNormConcept | null> => {
    try {
        const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`;
        const response = await fetch(url);
        const data = await response.json();

        const rxcui = data.idGroup?.rxnormId?.[0];
        if (!rxcui) return null;

        // Get the full concept info
        const propertiesUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`;
        const propsResponse = await fetch(propertiesUrl);
        const propsData = await propsResponse.json();

        return {
            rxcui,
            name: propsData.properties?.name || drugName,
            tty: propsData.properties?.tty || 'Unknown'
        };
    } catch (error) {
        console.error('[RxNorm] Drug standardization failed:', error);
        return null;
    }
};

export const getDrugAlternatives = async (rxcui: string): Promise<string[]> => {
    try {
        // Get related drugs (same ingredient, different brands)
        const url = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=SBD+SCD+GPCK+BPCK`;
        const response = await fetch(url);
        const data = await response.json();

        const alternatives: string[] = [];
        const groups = data.relatedGroup?.conceptGroup || [];
        for (const group of groups) {
            for (const concept of group.conceptProperties || []) {
                if (alternatives.length < 5) {
                    alternatives.push(concept.name);
                }
            }
        }
        return alternatives;
    } catch (error) {
        console.error('[RxNorm] Alternatives lookup failed:', error);
        return [];
    }
};

// --- ICD-10 Code Lookup (Free via CMS) ---

interface ICDCode {
    code: string;
    description: string;
}

export const searchICDCodes = async (condition: string): Promise<ICDCode[]> => {
    // Using the clinicaltables API from NIH which includes ICD-10 codes
    try {
        const url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(condition)}&maxList=5`;
        const response = await fetch(url);
        const data = await response.json();

        // Response format: [count, codes, null, [code, description] pairs]
        const codes: ICDCode[] = [];
        if (data[3]) {
            for (const pair of data[3]) {
                codes.push({
                    code: pair[0],
                    description: pair[1]
                });
            }
        }
        return codes;
    } catch (error) {
        console.error('[ICD-10] Code search failed:', error);
        return [];
    }
};

// ============================================
// AGGREGATE GROUNDING FUNCTION
// ============================================

export interface GroundingResult {
    pubmedArticles: PubMedArticle[];
    drugInfo: Map<string, DrugInfo>;
    drugInteractions: DrugInteraction[];
    icdCodes: Map<string, ICDCode[]>;
    rxNormConcepts: Map<string, RxNormConcept>;
}

export const gatherGroundingEvidence = async (
    diagnoses: string[],
    medications: string[]
): Promise<GroundingResult> => {
    const result: GroundingResult = {
        pubmedArticles: [],
        drugInfo: new Map(),
        drugInteractions: [],
        icdCodes: new Map(),
        rxNormConcepts: new Map()
    };

    // Parallel fetch for performance
    const promises: Promise<void>[] = [];

    // 1. PubMed search for diagnoses
    for (const diagnosis of diagnoses.slice(0, 3)) {
        promises.push(
            searchPubMed(`${diagnosis} treatment guidelines`, 3).then(articles => {
                result.pubmedArticles.push(...articles);
            })
        );
    }

    // 2. Drug information for each medication
    for (const med of medications.slice(0, 5)) {
        promises.push(
            searchDrugInfo(med).then(info => {
                if (info) result.drugInfo.set(med, info);
            })
        );
        promises.push(
            standardizeDrugName(med).then(concept => {
                if (concept) result.rxNormConcepts.set(med, concept);
            })
        );
    }

    // 3. Drug interactions
    if (medications.length >= 2) {
        promises.push(
            checkDrugInteractions(medications).then(interactions => {
                result.drugInteractions = interactions;
            })
        );
    }

    // 4. ICD-10 codes for diagnoses  
    for (const diagnosis of diagnoses.slice(0, 5)) {
        promises.push(
            searchICDCodes(diagnosis).then(codes => {
                if (codes.length > 0) result.icdCodes.set(diagnosis, codes);
            })
        );
    }

    await Promise.allSettled(promises);
    return result;
};

// ============================================
// FORMAT GROUNDING FOR DISPLAY
// ============================================

export const formatGroundingAsInsights = (grounding: GroundingResult): MedicalInsight[] => {
    const insights: MedicalInsight[] = [];

    // PubMed evidence
    if (grounding.pubmedArticles.length > 0) {
        insights.push({
            id: 'pubmed-evidence',
            title: 'Literature Evidence',
            details: grounding.pubmedArticles.slice(0, 3).map(a =>
                `${a.title} (${a.journal}, ${a.pubDate})`
            ).join(' | '),
            confidence: 'High',
            source: 'PubMed'
        });
    }

    // Drug interactions warning
    if (grounding.drugInteractions.length > 0) {
        for (const interaction of grounding.drugInteractions) {
            insights.push({
                id: `interaction-${interaction.drug1}-${interaction.drug2}`,
                title: `⚠️ Drug Interaction: ${interaction.drug1} + ${interaction.drug2}`,
                details: interaction.description,
                confidence: interaction.severity === 'major' ? 'High' : 'Medium',
                source: 'OpenFDA'
            });
        }
    }

    // ICD-10 codes
    const icdEntries = Array.from(grounding.icdCodes.entries());
    if (icdEntries.length > 0) {
        insights.push({
            id: 'icd-codes',
            title: 'Suggested ICD-10 Codes',
            details: icdEntries.map(([diagnosis, codes]) =>
                `${diagnosis}: ${codes[0]?.code}`
            ).join(' | '),
            confidence: 'High',
            source: 'NLM Clinical Tables'
        });
    }

    return insights;
};
