from typing import Dict, Any
import random

# Templates for different pathologies
PATHOLOGY_TEMPLATES = {
    "caries": [
        "Dental caries detected with {confidence}% confidence. This appears to be in the {location} region.",
        "Evidence of tooth decay with {confidence}% confidence in the {location} area. Early intervention recommended.",
        "Carious lesion identified with {confidence}% confidence in the {location}. Recommend restoration treatment."
    ],
    "periapical_lesion": [
        "Periapical lesion observed with {confidence}% confidence near the {location}. Further evaluation advised.",
        "Periapical radiolucency detected with {confidence}% confidence in the {location} region. Possible endodontic involvement.",
        "Evidence of periapical pathology with {confidence}% confidence at the {location}. Root canal therapy may be indicated."
    ],
    "calculus": [
        "Calculus deposits visible with {confidence}% confidence in the {location} region. Professional cleaning recommended.",
        "Dental calculus observed with {confidence}% confidence on the {location} surfaces. Scaling and root planing advised.",
        "Calcified plaque detected with {confidence}% confidence at the {location}. Suggest improved oral hygiene and professional cleaning."
    ],
    "periodontal_disease": [
        "Signs of periodontal disease with {confidence}% confidence in the {location} region. Further periodontal assessment needed.",
        "Evidence of periodontal involvement with {confidence}% confidence around the {location}. Consider periodontal therapy.",
        "Periodontal pathology detected with {confidence}% confidence at the {location}. Recommend comprehensive periodontal evaluation."
    ],
    "impacted_tooth": [
        "Impacted tooth identified with {confidence}% confidence in the {location} area. Surgical consultation may be necessary.",
        "Evidence of tooth impaction with {confidence}% confidence in the {location} region. Extraction may be indicated.",
        "Dental impaction observed with {confidence}% confidence at the {location}. Monitor or consider surgical intervention."
    ],
    "abscess": [
        "Dental abscess detected with {confidence}% confidence in the {location} region. Urgent treatment recommended.",
        "Evidence of abscess formation with {confidence}% confidence near the {location}. Immediate attention required.",
        "Periapical abscess identified with {confidence}% confidence at the {location}. Drainage and antibiotic therapy may be indicated."
    ]
}

# Standard locations in the mouth
LOCATIONS = [
    "maxillary anterior", "maxillary posterior", "mandibular anterior", "mandibular posterior",
    "upper right quadrant", "upper left quadrant", "lower right quadrant", "lower left quadrant",
    "incisor", "canine", "premolar", "molar"
]

# General advice templates
GENERAL_ADVICE = [
    "Recommend follow-up in 6 months for routine examination.",
    "Patient should maintain good oral hygiene practices including regular brushing and flossing.",
    "Suggest dietary counseling to reduce sugar intake and prevent future caries.",
    "Regular dental check-ups every 6 months are advised to monitor oral health status.",
    "Consider fluoride treatment to strengthen enamel and prevent further decay."
]

# Summary templates
SUMMARY_TEMPLATES = [
    "This radiographic examination reveals {findings_count} significant findings that require attention.",
    "Dental X-ray analysis shows {findings_count} pathological findings as detailed below.",
    "Radiographic assessment indicates {findings_count} areas of concern that should be addressed."
]

def generate_mock_diagnostic_report(detection_results: Dict[str, Any]) -> str:
    """
    Generate a mock diagnostic report based on detected pathologies
    
    Args:
        detection_results: Detection results from Roboflow API
        
    Returns:
        Generated diagnostic report
    """
    # Extract predictions
    predictions = detection_results.get("predictions", [])
    
    if not predictions:
        return "No pathologies detected in this radiograph. The dental structures appear within normal limits. Recommend routine follow-up in 6 months."
    
    # Generate report sections
    findings = []
    for pred in predictions:
        class_name = pred.get("class", "")
        confidence = round(float(pred.get("confidence", 0)) * 100, 1)  # Convert to percentage
        
        # Get templates for this pathology or use a generic one
        templates = PATHOLOGY_TEMPLATES.get(class_name.lower(), ["{class_name} detected with {confidence}% confidence."])
        
        # Choose a random template and location
        template = random.choice(templates)
        location = random.choice(LOCATIONS)
        
        # Format the finding
        finding = template.format(confidence=confidence, location=location, class_name=class_name)
        findings.append(finding)
    
    # Generate the complete report
    summary = random.choice(SUMMARY_TEMPLATES).format(findings_count=len(findings))
    findings_text = "\n\n".join([f"- {finding}" for finding in findings])
    advice = "\n\n" + random.choice(GENERAL_ADVICE)
    
    report = f"""# Dental Radiographic Diagnostic Report

## Summary
{summary}

## Findings
{findings_text}

## Recommendations
{advice}

---
Note: This is an AI-assisted report and should be verified by a dental professional."""
    
    return report
