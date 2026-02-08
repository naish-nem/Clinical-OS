/**
 * FHIR-lite Export Utility
 * Converts internal EncounterPacket to a minimal FHIR R4 Bundle
 * 
 * Resources generated:
 * - Condition (from diagnoses)
 * - Observation (from visual findings)
 * - MedicationRequest (from medication orders)
 * - ServiceRequest (from lab/imaging orders)
 * - DocumentReference (narrative note)
 */

import { EncounterPacket, Order, ProblemListItem } from '../types';

interface FHIRResource {
    resourceType: string;
    id: string;
    [key: string]: any;
}

interface FHIRBundle {
    resourceType: 'Bundle';
    type: 'collection';
    timestamp: string;
    entry: Array<{ resource: FHIRResource }>;
}

// Generate a simple UUID-like ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Convert problem list to FHIR Condition resources
const problemToCondition = (problem: ProblemListItem, patientRef: string): FHIRResource => ({
    resourceType: 'Condition',
    id: generateId(),
    clinicalStatus: {
        coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: problem.status === 'Active' ? 'active' : problem.status === 'Resolved' ? 'resolved' : 'recurrence'
        }]
    },
    code: {
        coding: problem.code ? [{
            system: 'http://hl7.org/fhir/sid/icd-10-cm',
            code: problem.code,
            display: problem.description
        }] : [],
        text: problem.description
    },
    subject: { reference: patientRef },
    recordedDate: problem.dateIdentified
});

// Convert order to FHIR MedicationRequest or ServiceRequest
const orderToFHIR = (order: Order, patientRef: string, practitionerRef: string): FHIRResource => {
    if (order.type === 'Medication') {
        return {
            resourceType: 'MedicationRequest',
            id: generateId(),
            status: 'draft',
            intent: 'order',
            priority: order.priority === 'STAT' ? 'stat' : order.priority === 'Urgent' ? 'urgent' : 'routine',
            medicationCodeableConcept: {
                text: order.description
            },
            subject: { reference: patientRef },
            requester: { reference: practitionerRef },
            reasonCode: [{
                text: order.rationale
            }]
        };
    }

    // For Lab, Imaging, Procedure, Referral -> ServiceRequest
    return {
        resourceType: 'ServiceRequest',
        id: generateId(),
        status: 'draft',
        intent: 'order',
        priority: order.priority === 'STAT' ? 'stat' : order.priority === 'Urgent' ? 'urgent' : 'routine',
        category: [{
            coding: [{
                system: 'http://snomed.info/sct',
                code: order.type === 'Lab' ? '108252007' : order.type === 'Imaging' ? '363679005' : '3457005',
                display: order.type
            }]
        }],
        code: {
            text: order.description
        },
        subject: { reference: patientRef },
        requester: { reference: practitionerRef },
        reasonCode: [{
            text: order.rationale
        }]
    };
};

// Create Observation from visual findings
const visualToObservation = (visualFindings: string, patientRef: string): FHIRResource => ({
    resourceType: 'Observation',
    id: generateId(),
    status: 'preliminary',
    category: [{
        coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam'
        }]
    }],
    code: {
        coding: [{
            system: 'http://loinc.org',
            code: '32422-2',
            display: 'Physical examination findings'
        }],
        text: 'Visual Analysis Finding'
    },
    subject: { reference: patientRef },
    valueString: visualFindings,
    effectiveDateTime: new Date().toISOString()
});

// Create DocumentReference for the narrative note
const createNarrativeDocument = (packet: EncounterPacket, patientRef: string): FHIRResource => {
    const narrativeText = `
SOAP NOTE - ${packet.patientName}
Generated: ${new Date(packet.generatedAt).toLocaleString()}

SUBJECTIVE
Chief Complaint: ${packet.soapNote.subjective.chiefComplaint}
HPI: ${packet.soapNote.subjective.historyOfPresentIllness}

OBJECTIVE
${packet.soapNote.objective.vitalSigns ? `Vitals: ${packet.soapNote.objective.vitalSigns}` : ''}
${packet.soapNote.objective.physicalExam ? `Exam: ${packet.soapNote.objective.physicalExam}` : ''}
${packet.soapNote.objective.visualFindings ? `Visual Findings: ${packet.soapNote.objective.visualFindings}` : ''}

ASSESSMENT
${packet.soapNote.assessment.diagnoses.map((d, i) => `${i + 1}. ${d}`).join('\n')}
${packet.soapNote.assessment.differentials?.length ? `Differentials: ${packet.soapNote.assessment.differentials.join(', ')}` : ''}

PLAN
Treatments: ${packet.soapNote.plan.treatments.join('; ')}
Tests: ${packet.soapNote.plan.tests.join('; ')}
${packet.soapNote.plan.referrals?.length ? `Referrals: ${packet.soapNote.plan.referrals.join('; ')}` : ''}
  `.trim();

    return {
        resourceType: 'DocumentReference',
        id: generateId(),
        status: packet.signatureStatus === 'Signed' ? 'current' : 'preliminary',
        type: {
            coding: [{
                system: 'http://loinc.org',
                code: '34117-2',
                display: 'History and physical note'
            }]
        },
        subject: { reference: patientRef },
        date: packet.generatedAt,
        content: [{
            attachment: {
                contentType: 'text/plain',
                data: btoa(narrativeText)
            }
        }]
    };
};

/**
 * Convert an EncounterPacket to a FHIR R4 Bundle
 */
export const convertToFHIRBundle = (packet: EncounterPacket): FHIRBundle => {
    const patientRef = `Patient/${packet.patientId}`;
    const practitionerRef = packet.clinicianName ? `Practitioner/${packet.clinicianName.replace(/\s+/g, '-')}` : 'Practitioner/unknown';

    const entries: Array<{ resource: FHIRResource }> = [];

    // Add Conditions from problem list and diagnoses
    packet.problemList.forEach(problem => {
        entries.push({ resource: problemToCondition(problem, patientRef) });
    });

    // Add diagnoses as Conditions too
    packet.soapNote.assessment.diagnoses.forEach(dx => {
        entries.push({
            resource: {
                resourceType: 'Condition',
                id: generateId(),
                clinicalStatus: {
                    coding: [{
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active'
                    }]
                },
                code: { text: dx },
                subject: { reference: patientRef },
                recordedDate: packet.generatedAt.split('T')[0]
            }
        });
    });

    // Add Orders as MedicationRequest or ServiceRequest
    packet.orders.forEach(order => {
        entries.push({ resource: orderToFHIR(order, patientRef, practitionerRef) });
    });

    // Add visual findings as Observation
    if (packet.soapNote.objective.visualFindings) {
        entries.push({ resource: visualToObservation(packet.soapNote.objective.visualFindings, patientRef) });
    }

    // Add narrative document
    entries.push({ resource: createNarrativeDocument(packet, patientRef) });

    return {
        resourceType: 'Bundle',
        type: 'collection',
        timestamp: new Date().toISOString(),
        entry: entries
    };
};

/**
 * Download the FHIR Bundle as a JSON file
 */
export const downloadFHIRBundle = (packet: EncounterPacket): void => {
    const bundle = convertToFHIRBundle(packet);
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/fhir+json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `encounter-${packet.patientId}-${Date.now()}.fhir.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
