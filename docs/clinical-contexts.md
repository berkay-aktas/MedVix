# MedVix — Clinical Context Descriptions (All 20 Domains)

**Version**: 2.0
**Sprint**: Sprint 2
**Author**: Nisanur KONUR (Product Owner)
**Date**: 17 March 2026

This document provides the complete clinical context for each of the 20 medical domains available in MedVix. Each entry describes the clinical problem, the patient population, the prediction target, the key features and their clinical significance, and why machine learning adds value. These descriptions are displayed in Step 1 of the 7-step MedVix pipeline and serve as the clinical foundation that guides all subsequent analysis.

---

## 1. Cardiology — Heart Disease

**Specialty**: Cardiology
**Domain ID**: `cardiology`
**Built-in Dataset**: `heart.csv` (303 rows, 13 features)
**Target**: `target` (binary: 0 = no disease, 1 = disease present)

### Clinical Problem

Coronary artery disease (CAD) is the leading cause of death worldwide, accounting for approximately 17.9 million deaths annually. The condition develops when atherosclerotic plaque narrows or blocks the coronary arteries, reducing blood flow to the heart muscle. Early identification of patients with significant CAD enables timely intervention through medication, lifestyle modification, or surgical procedures such as stent placement or coronary artery bypass grafting.

### Patient Population

Adults aged 29-77 presenting for cardiac evaluation, including patients with chest pain, shortness of breath, exercise intolerance, or elevated cardiovascular risk factors identified during routine screening.

### Target Outcome

Binary classification: presence or absence of significant coronary artery disease confirmed by angiography.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Age | Cardiovascular risk increases steadily with age; a major non-modifiable risk factor |
| Resting blood pressure | Chronic hypertension accelerates atherosclerosis and increases cardiac workload |
| Serum cholesterol | Elevated total cholesterol is directly linked to plaque formation in coronary arteries |
| Maximum heart rate achieved | A reduced exercise heart rate suggests impaired cardiac reserve and possible ischaemia |
| ST depression (exercise ECG) | ST-segment depression during exercise is a classic indicator of myocardial ischaemia |

### Why ML Matters

Traditional risk scoring (e.g., Framingham) relies on a small number of variables with fixed weights. Machine learning models can capture non-linear interactions between clinical measurements, blood markers, and exercise test results, improving identification of at-risk patients who might be missed by linear scoring.

---

## 2. Radiology — Chest X-Ray / Pneumonia

**Specialty**: Radiology
**Domain ID**: `radiology`
**Built-in Dataset**: `chest_xray.csv` (500 rows, 10 features)
**Target**: `label` (binary: Normal / Pneumonia)

### Clinical Problem

Pneumonia is a leading cause of hospitalisation and mortality, particularly in the elderly and immunocompromised. Chest X-ray (CXR) is the first-line imaging modality for diagnosis, but interpretation varies between radiologists, especially for subtle infiltrates. Automated screening can flag suspicious images for priority review, reducing diagnostic delays in high-volume emergency departments.

### Patient Population

Paediatric and adult patients presenting with respiratory symptoms including cough, fever, dyspnoea, or abnormal auscultation findings requiring chest radiography.

### Target Outcome

Binary classification: normal chest X-ray versus radiographic evidence of pneumonia (consolidation, ground-glass opacity, or interstitial infiltrates).

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Lung opacity region area | Larger opacified regions correlate with more extensive infection and worse prognosis |
| Opacity intensity | Higher radiodensity suggests consolidation rather than mild interstitial disease |
| Pleural effusion indicator | Parapneumonic effusion accompanies approximately 40% of bacterial pneumonias |
| Bilateral involvement | Bilateral infiltrates suggest more severe or atypical pneumonia requiring escalated treatment |
| Patient age | Extremes of age (very young, elderly) are associated with higher pneumonia mortality |

### Why ML Matters

Radiologist workload in busy hospitals can lead to delayed reads. ML-assisted triage prioritises suspicious X-rays in the reading queue, ensuring that pneumonia cases receive faster clinical attention without replacing the expert radiologist's final interpretation.

---

## 3. Nephrology — Chronic Kidney Disease

**Specialty**: Nephrology
**Domain ID**: `nephrology`
**Built-in Dataset**: `ckd.csv` (400 rows, 24 features)
**Target**: `classification` (binary: ckd / notckd)

### Clinical Problem

Chronic kidney disease (CKD) affects over 800 million people globally and often progresses silently until advanced stages when dialysis or transplantation becomes necessary. Early detection through routine blood and urine tests allows nephroprotective interventions — ACE inhibitors, dietary modification, blood pressure control — that can slow progression by years. Many CKD cases are identified only after irreversible damage has occurred.

### Patient Population

Adults with risk factors for kidney disease including diabetes, hypertension, cardiovascular disease, family history of renal failure, or abnormal findings on routine blood work (elevated creatinine, low GFR).

### Target Outcome

Binary classification: presence or absence of chronic kidney disease based on laboratory criteria and clinical assessment.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Serum creatinine | A primary marker of kidney filtration; elevated levels indicate reduced renal function |
| Blood urea | Elevated urea reflects impaired nitrogen waste excretion by the kidneys |
| Haemoglobin | Anaemia is a common CKD complication due to reduced erythropoietin production |
| Specific gravity (urine) | Low specific gravity indicates impaired urine concentration ability, an early CKD sign |
| Albumin (urine) | Proteinuria is both a marker and accelerator of kidney damage progression |

### Why ML Matters

CKD staging relies on eGFR calculations, but many patients fall into grey zones between stages. ML models integrating multiple laboratory and clinical variables can identify patients at high progression risk who need aggressive early intervention, even when individual markers are borderline.

---

## 4. Oncology — Breast Cancer

**Specialty**: Oncology (Breast)
**Domain ID**: `oncology_breast`
**Built-in Dataset**: `breast_cancer.csv` (569 rows, 30 features)
**Target**: `diagnosis` (binary: M = malignant, B = benign)

### Clinical Problem

Breast cancer is the most commonly diagnosed cancer in women worldwide. Fine needle aspirate (FNA) cytology is a minimally invasive diagnostic tool that yields cell-level measurements. Distinguishing malignant from benign masses based on these measurements is critical for surgical planning — benign masses may be monitored, while malignant findings require urgent biopsy, staging, and treatment.

### Patient Population

Women presenting with palpable breast masses or suspicious findings on screening mammography who undergo FNA for cytological assessment.

### Target Outcome

Binary classification: malignant versus benign breast mass based on digitised FNA cell nucleus measurements.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Mean radius | Larger cell nuclei are associated with malignant transformation and rapid proliferation |
| Texture (standard deviation of grey-scale) | Irregular nuclear texture suggests chromatin abnormalities found in cancer cells |
| Concavity | Nuclear membrane concavity indicates irregularity, a hallmark of malignant cells |
| Worst perimeter | The largest nuclear perimeter in the sample reflects the most abnormal cells present |
| Symmetry | Asymmetric nuclei indicate dysplastic changes associated with malignancy |

### Why ML Matters

Cytological interpretation is subjective and varies between pathologists. ML models trained on precise cell measurements provide a quantitative second opinion that can reduce inter-observer variability and support pathologists in making more consistent diagnostic decisions.

---

## 5. Neurology — Parkinson's Disease

**Specialty**: Neurology
**Domain ID**: `neurology`
**Built-in Dataset**: `parkinsons.csv` (195 rows, 22 features)
**Target**: `status` (binary: 0 = healthy, 1 = Parkinson's)

### Clinical Problem

Parkinson's disease (PD) is a progressive neurodegenerative disorder affecting over 10 million people worldwide. Diagnosis relies on clinical assessment of motor symptoms (tremor, rigidity, bradykinesia), but early-stage PD is difficult to distinguish from normal ageing or other movement disorders. Voice analysis offers a non-invasive screening method, as vocal cord control deterioration is one of the earliest detectable PD manifestations.

### Patient Population

Adults aged 40 and older presenting with motor symptoms, voice changes, or family history of neurodegenerative disease undergoing voice recording analysis.

### Target Outcome

Binary classification: healthy individual versus Parkinson's disease patient based on biomedical voice measurements.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| MDVP:Fo (average vocal fundamental frequency) | Altered pitch control is an early indicator of laryngeal motor dysfunction in PD |
| MDVP:Jitter | Frequency perturbation reflects vocal cord instability due to impaired neuromotor control |
| MDVP:Shimmer | Amplitude perturbation indicates irregularity in vocal fold vibration |
| HNR (harmonic-to-noise ratio) | Lower HNR values indicate increased breathiness and reduced vocal clarity |
| RPDE (recurrence period density entropy) | Non-linear complexity measures capture subtle vocal dynamics that linear measures miss |

### Why ML Matters

Traditional PD diagnosis is clinical and subjective, often delayed until significant motor decline has occurred. ML analysis of voice recordings can detect subtle vocal changes years before clinical symptoms become apparent, enabling earlier neuroprotective treatment initiation.

---

## 6. Endocrinology — Diabetes

**Specialty**: Endocrinology
**Domain ID**: `endocrinology`
**Built-in Dataset**: `diabetes.csv` (768 rows, 8 features)
**Target**: `Outcome` (binary: 0 = non-diabetic, 1 = diabetic)

### Clinical Problem

Type 2 diabetes mellitus (T2DM) affects over 537 million adults worldwide and is a leading cause of blindness, kidney failure, cardiovascular disease, and lower-limb amputation. Many patients remain undiagnosed for years while hyperglycaemia silently damages end organs. Early identification of at-risk individuals enables preventive interventions — lifestyle modification, metformin therapy, and regular monitoring — that can delay or prevent disease onset.

### Patient Population

Females of Pima Indian heritage aged 21 and older with at least one diabetes risk factor, including obesity, family history, gestational diabetes, or impaired glucose tolerance.

### Target Outcome

Binary classification: presence or absence of diabetes mellitus within five years of baseline measurement.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Glucose (plasma glucose concentration) | Fasting glucose is the primary diagnostic criterion for diabetes mellitus |
| BMI (body mass index) | Obesity is the strongest modifiable risk factor for insulin resistance and T2DM |
| Age | T2DM prevalence increases significantly with age due to progressive beta-cell decline |
| Diabetes pedigree function | Quantifies genetic predisposition based on family history of diabetes |
| Insulin (2-hour serum insulin) | Elevated fasting insulin reflects insulin resistance preceding overt diabetes |

### Why ML Matters

Diabetes risk calculators use simple threshold-based rules. ML models can detect complex interactions between metabolic markers, anthropometric measurements, and genetic factors to identify patients in the pre-diabetic window when intervention is most effective.

---

## 7. Hepatology — Liver Disease

**Specialty**: Hepatology
**Domain ID**: `hepatology`
**Built-in Dataset**: `liver.csv` (583 rows, 10 features)
**Target**: `Dataset` (binary: 1 = liver patient, 2 = non-liver patient)

### Clinical Problem

Liver disease encompasses conditions ranging from fatty liver to cirrhosis and hepatocellular carcinoma. In many cases, liver damage progresses silently until clinical symptoms (jaundice, ascites, hepatic encephalopathy) appear, by which point the disease is advanced. Routine blood panels including liver function tests (LFTs) can detect early damage, but interpreting multiple enzyme levels simultaneously is difficult for non-specialists.

### Patient Population

Adult patients from the Indian subcontinent undergoing routine or diagnostic blood testing, including those with suspected alcoholic liver disease, viral hepatitis, non-alcoholic fatty liver disease (NAFLD), or unexplained enzyme elevations.

### Target Outcome

Binary classification: presence or absence of liver disease based on clinical presentation and laboratory findings.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Total bilirubin | Elevated bilirubin indicates impaired hepatic conjugation or biliary obstruction |
| Alkaline phosphatase | Raised ALP suggests cholestatic liver disease or biliary pathology |
| Alanine aminotransferase (ALT) | ALT is the most liver-specific enzyme; elevation indicates hepatocellular injury |
| Albumin | Low serum albumin reflects impaired hepatic synthetic function in chronic disease |
| Total proteins | Altered protein levels indicate disrupted liver protein synthesis capacity |

### Why ML Matters

A single enzyme elevation may be benign, but the pattern of multiple enzyme changes is diagnostically significant. ML models excel at recognising multi-marker patterns that distinguish between different liver pathologies and healthy variation, supporting non-specialist clinicians in referral decisions.

---

## 8. Cardiology — Stroke Prediction

**Specialty**: Cardiology / Neurology
**Domain ID**: `stroke`
**Built-in Dataset**: `stroke.csv` (500 rows, 10 features)
**Target**: `stroke` (binary: 0 = no stroke, 1 = stroke)

### Clinical Problem

Stroke is the second leading cause of death globally and a major cause of long-term disability. Approximately 80% of strokes are ischaemic (caused by blood clots), and many are preventable through risk factor management. Identifying high-risk individuals before an event occurs allows targeted anticoagulation, blood pressure control, and lifestyle counselling that can reduce stroke incidence by up to 80%.

### Patient Population

Adults with one or more vascular risk factors including hypertension, atrial fibrillation, diabetes, smoking, obesity, or prior transient ischaemic attack (TIA).

### Target Outcome

Binary classification: whether a patient will experience a stroke based on demographic and clinical risk factors.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Hypertension status | Hypertension is the single most important modifiable stroke risk factor |
| Average glucose level | Hyperglycaemia damages vascular endothelium and promotes thrombosis |
| Age | Stroke risk doubles approximately every decade after age 55 |
| Heart disease status | Cardiac conditions, especially atrial fibrillation, significantly increase embolic stroke risk |
| BMI | Obesity contributes to stroke risk through multiple metabolic pathways |

### Why ML Matters

Traditional stroke risk scores (CHA2DS2-VASc) were designed for specific populations with atrial fibrillation. ML models can provide personalised stroke risk assessment across broader populations by integrating demographic, metabolic, and lifestyle factors that interact in non-linear ways.

---

## 9. Mental Health — Depression

**Specialty**: Psychiatry / Mental Health
**Domain ID**: `mental_health`
**Built-in Dataset**: `mental_health.csv` (500 rows, 12 features)
**Target**: `treatment` (binary: Yes = sought treatment, No = did not seek treatment)

### Clinical Problem

Depression is the leading cause of disability worldwide, affecting over 280 million people. In many professional environments, mental health conditions go unrecognised and untreated due to stigma. Workplace surveys collecting demographic and attitudinal data can identify patterns associated with treatment-seeking behaviour, helping organisations design support programmes that encourage help-seeking among at-risk employees.

### Patient Population

Technology-sector employees who participated in workplace mental health surveys, representing a range of ages, genders, company sizes, and geographic locations.

### Target Outcome

Binary classification: whether an employee with a mental health condition sought professional treatment, as a proxy for treatment accessibility and willingness.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Family history of mental illness | Genetic and familial factors strongly predict both mental health conditions and treatment attitudes |
| Work interference | The degree to which a condition interferes with work correlates with severity and treatment need |
| Company size | Larger companies are more likely to offer mental health benefits and employee assistance programmes |
| Remote work status | Remote workers may face different barriers to accessing mental health support |
| Employer mental health benefits | Availability of benefits is the strongest predictor of treatment uptake |

### Why ML Matters

Identifying workplace factors that predict treatment-seeking behaviour helps organisations allocate mental health resources effectively. ML models can reveal non-obvious patterns — such as interactions between company culture, benefits availability, and demographic factors — that inform evidence-based policy design.

---

## 10. Pulmonology — COPD

**Specialty**: Pulmonology
**Domain ID**: `pulmonology`
**Built-in Dataset**: `copd.csv` (500 rows, 12 features)
**Target**: `COPD_severity` (multi-class: mild, moderate, severe)

### Clinical Problem

Chronic obstructive pulmonary disease (COPD) is the third leading cause of death worldwide, killing over 3 million people annually. COPD severity staging guides treatment escalation — from bronchodilators for mild disease to supplemental oxygen and pulmonary rehabilitation for severe disease. Accurate staging requires spirometry, symptom assessment, and exacerbation history, but integrating these inputs into a severity grade is inconsistent across primary care settings.

### Patient Population

Adults aged 40 and older with a smoking history or occupational dust/chemical exposure who present with chronic cough, dyspnoea, or sputum production undergoing pulmonary assessment.

### Target Outcome

Multi-class classification: COPD severity graded as mild, moderate, or severe based on spirometric and clinical parameters.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| FEV1 (forced expiratory volume in 1 second) | The primary spirometric measure for COPD staging per GOLD criteria |
| FEV1/FVC ratio | A ratio below 0.70 confirms airflow obstruction; lower ratios indicate more severe disease |
| Smoking pack-years | Cumulative smoking exposure is the dominant COPD risk factor |
| Exacerbation frequency | Frequent exacerbations indicate unstable disease requiring treatment escalation |
| Dyspnoea score (mMRC) | Patient-reported breathlessness grade correlates with functional impairment and prognosis |

### Why ML Matters

GOLD staging uses fixed spirometric thresholds that may not capture the heterogeneity of COPD phenotypes. ML models integrating spirometry, symptoms, exacerbation history, and comorbidities can provide more personalised severity assessments that better predict outcomes and guide treatment.

---

## 11. Haematology — Anaemia

**Specialty**: Haematology
**Domain ID**: `haematology`
**Built-in Dataset**: `anaemia.csv` (500 rows, 6 features)
**Target**: `Result` (binary: 0 = not anaemic, 1 = anaemic)

### Clinical Problem

Anaemia affects approximately one-third of the global population and is particularly prevalent in children, pregnant women, and the elderly. While mild anaemia may be asymptomatic, moderate-to-severe cases cause fatigue, cognitive impairment, and cardiovascular strain. Complete blood count (CBC) parameters can indicate anaemia presence and type, but interpreting the pattern of multiple red cell indices simultaneously requires haematological expertise.

### Patient Population

Adults and children undergoing complete blood count testing, including pregnant women, patients with chronic disease, and individuals with nutritional deficiencies.

### Target Outcome

Binary classification: presence or absence of anaemia based on haematological parameters.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Haemoglobin | The primary diagnostic criterion for anaemia; levels vary by age and sex |
| MCH (mean corpuscular haemoglobin) | Low MCH indicates hypochromic anaemia, typically from iron deficiency |
| MCHC (mean corpuscular haemoglobin concentration) | Helps differentiate anaemia types; low MCHC confirms hypochromia |
| MCV (mean corpuscular volume) | Distinguishes microcytic (iron deficiency), normocytic, and macrocytic (B12 deficiency) anaemia |
| Gender | Anaemia thresholds differ between males (<13 g/dL) and females (<12 g/dL) |

### Why ML Matters

While haemoglobin alone can detect anaemia, the pattern of multiple red cell indices determines the anaemia subtype and underlying cause. ML models can simultaneously evaluate all CBC parameters to provide both detection and preliminary classification, assisting non-specialist clinicians in directing further investigation.

---

## 12. Dermatology

**Specialty**: Dermatology
**Domain ID**: `dermatology`
**Built-in Dataset**: `dermatology.csv` (366 rows, 34 features)
**Target**: `class` (multi-class: 6 dermatological conditions)

### Clinical Problem

Dermatological conditions are among the most common reasons for primary care visits, yet accurate diagnosis requires specialist training. The six conditions in this dataset — psoriasis, seborrheic dermatitis, lichen planus, pityriasis rosea, chronic dermatitis, and pityriasis rubra pilaris — share overlapping clinical presentations. Misdiagnosis leads to inappropriate treatment, prolonged patient suffering, and unnecessary specialist referrals.

### Patient Population

Patients presenting to dermatology clinics with erythematous, scaly, or papular skin lesions requiring differential diagnosis among six common dermatoses.

### Target Outcome

Multi-class classification: diagnosis among six dermatological conditions based on clinical and histopathological features.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Koebner phenomenon | Lesion development at sites of trauma, characteristic of psoriasis and lichen planus |
| Oral mucosal involvement | Oral lesions help distinguish lichen planus from other papulosquamous conditions |
| Scalp involvement | Scalp scaling patterns differ between psoriasis and seborrheic dermatitis |
| Histopathological spongiosis | Intercellular oedema in the epidermis suggests eczematous or dermatitic processes |
| Family history | Psoriasis has strong hereditary components; family history raises diagnostic probability |

### Why ML Matters

Dermatological diagnosis depends on recognising patterns across dozens of clinical and histological features simultaneously. ML models trained on expert-confirmed diagnoses can serve as clinical decision support, particularly for general practitioners who encounter these conditions less frequently than dermatologists.

---

## 13. Ophthalmology — Diabetic Retinopathy

**Specialty**: Ophthalmology
**Domain ID**: `ophthalmology`
**Built-in Dataset**: `diabetic_retinopathy.csv` (500 rows, 15 features)
**Target**: `level` (multi-class: 0 = no DR, 1 = mild, 2 = moderate, 3 = severe, 4 = proliferative)

### Clinical Problem

Diabetic retinopathy (DR) is the leading cause of preventable blindness in working-age adults, affecting approximately one-third of all diabetic patients. Regular fundoscopic screening can detect DR at treatable stages, but the global shortage of trained ophthalmologists means millions of diabetic patients go unscreened. Automated severity grading can expand screening capacity to primary care and remote clinics.

### Patient Population

Diabetic patients undergoing retinal screening, typically as part of annual diabetes management, including those with Type 1 or Type 2 diabetes of any duration.

### Target Outcome

Multi-class classification: diabetic retinopathy severity staged from no retinopathy through mild, moderate, and severe non-proliferative to proliferative diabetic retinopathy.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Microaneurysm count | The earliest clinical sign of DR; count correlates with disease progression rate |
| Hard exudate area | Lipid deposits indicate blood-retinal barrier breakdown and macular oedema risk |
| Haemorrhage area | Retinal haemorrhage extent reflects vascular damage severity |
| Neovascularisation indicator | New vessel growth marks the transition to proliferative disease requiring urgent treatment |
| Macular oedema presence | The primary cause of vision loss in DR; requires anti-VEGF therapy or laser treatment |

### Why ML Matters

Manual DR grading is time-consuming and subject to inter-observer variability. ML models can provide consistent, rapid severity classification that scales to population-level screening programmes, ensuring timely referral for patients with sight-threatening disease.

---

## 14. Orthopaedics — Spine

**Specialty**: Orthopaedics
**Domain ID**: `orthopaedics`
**Built-in Dataset**: `spine.csv` (310 rows, 6 features)
**Target**: `class` (binary: Normal / Abnormal)

### Clinical Problem

Lower back pain is the leading cause of disability worldwide, and a significant proportion of cases involve biomechanical abnormalities of the vertebral column. Conditions such as disc herniation and spondylolisthesis alter measurable pelvic and spinal parameters. Accurate biomechanical classification helps orthopaedic surgeons decide between conservative management (physiotherapy, pain management) and surgical intervention (discectomy, spinal fusion).

### Patient Population

Patients referred for orthopaedic evaluation of chronic lower back pain, radiculopathy, or suspected spinal pathology, who have undergone sagittal radiographic assessment.

### Target Outcome

Binary classification: normal versus abnormal spinal biomechanics based on pelvic and lumbar radiographic measurements.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Pelvic incidence | A fixed anatomical parameter that determines the spinal-pelvic balance strategy |
| Pelvic tilt | Increased tilt indicates compensatory posture for underlying spinal pathology |
| Lumbar lordosis angle | Reduced lordosis is associated with disc degeneration and chronic pain |
| Sacral slope | Reflects pelvic orientation and influences load distribution through the lumbar spine |
| Degree of spondylolisthesis | Measures vertebral slippage; higher grades often require surgical stabilisation |

### Why ML Matters

Spinal biomechanical assessment involves interpreting multiple interrelated angular measurements. ML models can recognise abnormal parameter combinations that indicate specific pathologies, providing decision support for orthopaedic surgeons determining the need for surgical versus conservative treatment.

---

## 15. ICU / Sepsis

**Specialty**: Intensive Care Medicine
**Domain ID**: `icu_sepsis`
**Built-in Dataset**: `sepsis.csv` (500 rows, 14 features)
**Target**: `Sepsis` (binary: Positive / Negative)

### Clinical Problem

Sepsis is a life-threatening organ dysfunction caused by a dysregulated host response to infection. It affects approximately 49 million people annually and causes 11 million deaths. Every hour of delayed antibiotic treatment increases mortality by 4-8%. Early detection using routinely collected ICU parameters can trigger rapid intervention protocols (fluid resuscitation, broad-spectrum antibiotics, vasopressors) that significantly improve survival.

### Patient Population

Adult patients admitted to intensive care units with suspected or confirmed infection, or those who develop clinical signs of infection during their ICU stay.

### Target Outcome

Binary classification: presence or absence of sepsis based on clinical parameters, vital signs, and laboratory values collected within the first hours of ICU admission.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Heart rate | Tachycardia is an early compensatory response to infection and hypovolaemia |
| Mean arterial pressure | Hypotension indicates cardiovascular compromise and potential septic shock |
| White blood cell count | Leukocytosis or leukopenia reflects the systemic inflammatory response |
| Lactate level | Elevated lactate indicates tissue hypoperfusion and anaerobic metabolism |
| Temperature | Fever or hypothermia are systemic infection markers; hypothermia carries worse prognosis |

### Why ML Matters

Sepsis develops rapidly and its early signs overlap with many non-infectious conditions. ML models analysing streaming ICU data can detect subtle multi-parameter patterns that precede clinical deterioration, potentially triggering alerts hours before conventional criteria are met and saving critical treatment time.

---

## 16. Obstetrics — Fetal Health

**Specialty**: Obstetrics
**Domain ID**: `obstetrics`
**Built-in Dataset**: `fetal_health.csv` (2126 rows, 21 features)
**Target**: `fetal_health` (multi-class: 1 = normal, 2 = suspect, 3 = pathological)

### Clinical Problem

Fetal distress during labour is a leading cause of neonatal morbidity and mortality. Cardiotocography (CTG) monitoring records fetal heart rate and uterine contractions, producing complex tracings that obstetricians interpret to assess fetal wellbeing. However, CTG interpretation has high inter-observer variability, and both missed distress (delayed intervention) and false alarms (unnecessary caesarean sections) carry significant consequences.

### Patient Population

Pregnant women in the third trimester or during labour who are undergoing continuous electronic fetal monitoring via cardiotocography.

### Target Outcome

Multi-class classification: fetal health status categorised as normal, suspect, or pathological based on CTG features, guiding the urgency of clinical intervention.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Baseline fetal heart rate | Normal range is 110-160 bpm; deviations indicate potential fetal compromise |
| Accelerations | Heart rate accelerations are a reassuring sign of fetal neurological integrity |
| Decelerations | Late or variable decelerations may indicate umbilical cord compression or uteroplacental insufficiency |
| Uterine contractions | Contraction frequency and intensity provide context for heart rate pattern interpretation |
| Short-term variability | Reduced variability is a sensitive marker of fetal hypoxia and acidosis |

### Why ML Matters

CTG interpretation is subjective, with studies showing only 30% agreement between experts on pathological tracings. ML models trained on expert-classified CTG recordings can provide consistent, real-time fetal status assessment, reducing both missed distress and unnecessary emergency caesarean sections.

---

## 17. Cardiology — Arrhythmia

**Specialty**: Cardiology (Electrophysiology)
**Domain ID**: `arrhythmia`
**Built-in Dataset**: `arrhythmia.csv` (500 rows, 15 features)
**Target**: `target` (multi-class: 0 = normal, 1-4 = arrhythmia subtypes)

### Clinical Problem

Cardiac arrhythmias range from benign premature beats to life-threatening ventricular tachycardia. Electrocardiogram (ECG) interpretation requires trained cardiologists, and the sheer volume of continuous monitoring data in cardiac telemetry units makes manual review impractical. Automated arrhythmia classification can flag dangerous rhythms for immediate clinical attention while filtering benign variants.

### Patient Population

Patients undergoing continuous cardiac monitoring, including those in telemetry units, post-cardiac surgery patients, and ambulatory patients wearing Holter monitors.

### Target Outcome

Multi-class classification: normal sinus rhythm versus four arrhythmia subtypes (supraventricular premature beats, premature ventricular contractions, fusion beats, unclassifiable beats).

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| RR interval | The time between consecutive heartbeats; irregularity indicates arrhythmia |
| QRS duration | Widened QRS complex suggests ventricular origin or conduction abnormality |
| PR interval | Prolonged PR interval indicates atrioventricular conduction delay |
| ST segment deviation | ST changes may indicate ischaemia accompanying the arrhythmia |
| Heart rate variability | Reduced HRV is associated with increased risk of sudden cardiac death |

### Why ML Matters

Continuous cardiac monitoring generates thousands of heartbeats per hour. ML classifiers can perform real-time beat-by-beat analysis at scale, detecting dangerous arrhythmias within seconds and alerting nursing staff before the patient becomes symptomatic, a task impossible for human monitors to perform continuously.

---

## 18. Oncology — Cervical Cancer

**Specialty**: Oncology (Gynaecological)
**Domain ID**: `oncology_cervical`
**Built-in Dataset**: `cervical_cancer.csv` (500 rows, 18 features)
**Target**: `Biopsy` (binary: 0 = negative, 1 = positive)

### Clinical Problem

Cervical cancer is the fourth most common cancer in women worldwide, with approximately 604,000 new cases annually. Nearly all cases are caused by persistent human papillomavirus (HPV) infection. Screening through Pap smears and HPV testing can detect precancerous changes, but in low-resource settings, screening coverage is insufficient. Risk prediction models can prioritise screening and follow-up for the highest-risk women.

### Patient Population

Women aged 18 and older attending gynaecological clinics for cervical screening, including those with risk factors such as HPV infection, multiple sexual partners, smoking, or immunosuppression.

### Target Outcome

Binary classification: positive or negative biopsy result for cervical neoplasia, indicating the need for further intervention (colposcopy, LEEP, conisation).

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Number of sexual partners | A proxy for HPV exposure, the primary cervical cancer causative agent |
| Age at first sexual intercourse | Earlier onset is associated with increased HPV acquisition risk |
| Number of pregnancies | Multiparity is an independent cervical cancer risk factor |
| Smoking status | Smoking doubles cervical cancer risk through immune suppression and direct carcinogenic effects |
| STD history | Co-infections with other STDs increase cervical vulnerability to HPV-mediated transformation |

### Why ML Matters

In resource-limited settings, it is not feasible to screen every woman annually. ML risk models can stratify women by predicted cervical cancer probability, enabling targeted allocation of limited screening resources to those who need it most and increasing early detection rates within constrained budgets.

---

## 19. Thyroid / Endocrinology

**Specialty**: Endocrinology
**Domain ID**: `thyroid`
**Built-in Dataset**: `thyroid.csv` (500 rows, 13 features)
**Target**: `target` (binary: P = positive / N = negative for thyroid disease)

### Clinical Problem

Thyroid disorders affect an estimated 200 million people globally. Hypothyroidism and hyperthyroidism produce wide-ranging symptoms — fatigue, weight changes, temperature intolerance, cardiac effects — that overlap with many other conditions, leading to delayed diagnosis. Thyroid function tests (TFTs) are the diagnostic standard, but interpreting TSH, T3, and T4 levels in combination with clinical context requires endocrine expertise.

### Patient Population

Adults referred for thyroid function evaluation due to symptoms suggestive of thyroid dysfunction, thyroid nodules, or abnormal screening results.

### Target Outcome

Binary classification: presence or absence of thyroid disease based on thyroid function tests and clinical parameters.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| TSH (thyroid-stimulating hormone) | The most sensitive marker of thyroid dysfunction; elevated in hypothyroidism, suppressed in hyperthyroidism |
| T3 (triiodothyronine) | The biologically active thyroid hormone; elevated in hyperthyroidism |
| T4 (thyroxine) | The primary circulating thyroid hormone; low levels confirm hypothyroidism |
| Age | Thyroid disease prevalence and presentation change significantly with age |
| Goitre presence | Physical enlargement of the thyroid gland may indicate iodine deficiency, Graves' disease, or nodular disease |

### Why ML Matters

Thyroid function tests produce a pattern of values that must be interpreted together. ML models can integrate TSH, T3, T4, and clinical features to provide rapid screening categorisation, supporting primary care physicians in determining which patients need urgent endocrine referral versus reassurance.

---

## 20. Pharmacy — Hospital Readmission

**Specialty**: Pharmacy / Health Systems
**Domain ID**: `pharmacy`
**Built-in Dataset**: `readmission.csv` (500 rows, 11 features)
**Target**: `readmitted` (binary: Yes / No)

### Clinical Problem

Unplanned hospital readmissions within 30 days of discharge are a major quality and cost concern, costing healthcare systems billions annually. Many readmissions are preventable through better discharge planning, medication reconciliation, and follow-up care. Identifying high-risk patients before discharge allows targeted interventions — enhanced medication counselling, earlier follow-up appointments, home health services — that reduce readmission rates.

### Patient Population

Adult patients being discharged from hospital following an inpatient stay, particularly those with complex medication regimens, chronic conditions, or limited social support.

### Target Outcome

Binary classification: whether a patient will be readmitted to hospital within 30 days of discharge.

### Key Features

| Feature | Clinical Significance |
|---------|----------------------|
| Number of medications | Polypharmacy (5+ medications) increases adverse drug event and readmission risk |
| Length of stay | Longer hospitalisations often indicate greater illness severity and higher readmission risk |
| Number of prior admissions | Prior readmission history is the strongest predictor of future readmission |
| Diagnosis category | Certain conditions (heart failure, COPD, pneumonia) carry inherently higher readmission rates |
| Discharge disposition | Discharge to home without support carries higher risk than discharge to rehabilitation |

### Why ML Matters

Simple readmission risk checklists miss many at-risk patients. ML models can integrate clinical, demographic, and healthcare utilisation data to generate personalised readmission risk scores at the point of discharge, enabling pharmacists and discharge planners to focus their limited time on the patients most likely to benefit from enhanced transitional care.

---

**Document Total**: 20 clinical domains | **Binary Classification**: 15 domains | **Multi-class Classification**: 5 domains

**Models Applied to All Domains**: K-Nearest Neighbours (KNN), Support Vector Machine (SVM), Decision Tree, Random Forest, Logistic Regression, Naive Bayes

---

*Prepared by*: Nisanur KONUR (Product Owner)
*Date*: 17 March 2026
*Project*: MedVix — SENG 430 Software Quality Assurance Laboratory
