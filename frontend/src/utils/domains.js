/**
 * Static domain definitions for the 20 clinical domains.
 * These are used for gradients, icons, and layout before the API responds.
 * Full clinical context is fetched from the backend.
 */

const DOMAINS = [
  {
    id: 'cardiology',
    name: 'Heart Disease',
    subtitle: 'Cardiology',
    gradient: { from: '#EF4444', to: '#DC2626' },
    icon: '\u2764\uFE0F',
    clinical_question: 'Does this patient have significant coronary artery disease?',
    key_variables: ['age', 'sex', 'chest_pain_type', 'resting_bp', 'cholesterol', 'fasting_blood_sugar', 'max_heart_rate', 'exercise_angina'],
    dataset_info: { rows: 303, features: 13, classes: 2, positive_rate: '54%' },
  },
  {
    id: 'radiology',
    name: 'Chest X-Ray',
    subtitle: 'Radiology',
    gradient: { from: '#8B5CF6', to: '#7C3AED' },
    icon: '\uD83E\uDE7B',
    clinical_question: 'Does this chest X-ray indicate pneumonia?',
    key_variables: ['pixel_mean', 'pixel_std', 'contrast', 'entropy', 'lung_area_ratio', 'opacity_score'],
    dataset_info: { rows: 5856, features: 12, classes: 2, positive_rate: '62%' },
  },
  {
    id: 'nephrology',
    name: 'Chronic Kidney',
    subtitle: 'Nephrology',
    gradient: { from: '#F59E0B', to: '#D97706' },
    icon: '\uD83E\uDEC0',
    clinical_question: 'Does this patient have chronic kidney disease?',
    key_variables: ['blood_pressure', 'specific_gravity', 'albumin', 'blood_glucose', 'blood_urea', 'serum_creatinine', 'haemoglobin'],
    dataset_info: { rows: 400, features: 24, classes: 2, positive_rate: '62%' },
  },
  {
    id: 'oncology-breast',
    name: 'Breast Cancer',
    subtitle: 'Oncology',
    gradient: { from: '#EC4899', to: '#DB2777' },
    icon: '\uD83C\uDF80',
    clinical_question: 'Is this breast mass malignant or benign?',
    key_variables: ['radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean', 'compactness_mean', 'concavity_mean'],
    dataset_info: { rows: 569, features: 30, classes: 2, positive_rate: '37%' },
  },
  {
    id: 'neurology',
    name: "Parkinson's",
    subtitle: 'Neurology',
    gradient: { from: '#6366F1', to: '#4F46E5' },
    icon: '\uD83E\uDDE0',
    clinical_question: "Does this patient's voice pattern suggest Parkinson's disease?",
    key_variables: ['MDVP_Fo', 'MDVP_Jitter', 'MDVP_Shimmer', 'NHR', 'HNR', 'RPDE', 'DFA', 'spread1'],
    dataset_info: { rows: 195, features: 22, classes: 2, positive_rate: '75%' },
  },
  {
    id: 'endocrinology',
    name: 'Diabetes',
    subtitle: 'Endocrinology',
    gradient: { from: '#14B8A6', to: '#0D9488' },
    icon: '\uD83E\uDE78',
    clinical_question: 'Is this patient at risk for Type 2 diabetes?',
    key_variables: ['pregnancies', 'glucose', 'blood_pressure', 'skin_thickness', 'insulin', 'bmi', 'diabetes_pedigree', 'age'],
    dataset_info: { rows: 768, features: 8, classes: 2, positive_rate: '35%' },
  },
  {
    id: 'hepatology',
    name: 'Liver Disease',
    subtitle: 'Hepatology',
    gradient: { from: '#78716C', to: '#57534E' },
    icon: '\uD83E\uDEBB',
    clinical_question: 'Does this patient show signs of liver disease?',
    key_variables: ['total_bilirubin', 'direct_bilirubin', 'alkaline_phosphatase', 'ALT', 'AST', 'total_proteins', 'albumin', 'AG_ratio'],
    dataset_info: { rows: 583, features: 10, classes: 2, positive_rate: '71%' },
  },
  {
    id: 'cardiology-stroke',
    name: 'Stroke Risk',
    subtitle: 'Cardiology',
    gradient: { from: '#F87171', to: '#EF4444' },
    icon: '\u26A1',
    clinical_question: 'Is this patient at elevated risk of stroke?',
    key_variables: ['age', 'hypertension', 'heart_disease', 'avg_glucose', 'bmi', 'smoking_status', 'work_type'],
    dataset_info: { rows: 5110, features: 10, classes: 2, positive_rate: '5%' },
  },
  {
    id: 'mental-health',
    name: 'Depression',
    subtitle: 'Mental Health',
    gradient: { from: '#60A5FA', to: '#3B82F6' },
    icon: '\uD83E\uDDE0',
    clinical_question: 'Does this patient show signs of clinical depression?',
    key_variables: ['sleep_duration', 'physical_activity', 'stress_level', 'bmi', 'alcohol_consumption', 'social_support', 'screen_time'],
    dataset_info: { rows: 2000, features: 14, classes: 2, positive_rate: '40%' },
  },
  {
    id: 'pulmonology',
    name: 'COPD',
    subtitle: 'Pulmonology',
    gradient: { from: '#34D399', to: '#10B981' },
    icon: '\uD83E\uDEC1',
    clinical_question: 'Does this patient have chronic obstructive pulmonary disease?',
    key_variables: ['age', 'smoking_years', 'FEV1', 'FVC', 'FEV1_FVC_ratio', 'dyspnea_grade', 'cough_frequency'],
    dataset_info: { rows: 1200, features: 12, classes: 2, positive_rate: '45%' },
  },
  {
    id: 'haematology',
    name: 'Anaemia',
    subtitle: 'Haematology',
    gradient: { from: '#FB923C', to: '#F97316' },
    icon: '\uD83E\uDE78',
    clinical_question: 'Does this patient have anaemia based on blood parameters?',
    key_variables: ['haemoglobin', 'RBC_count', 'PCV', 'MCV', 'MCH', 'MCHC', 'iron_level', 'ferritin'],
    dataset_info: { rows: 1500, features: 10, classes: 2, positive_rate: '42%' },
  },
  {
    id: 'dermatology',
    name: 'Skin Lesion',
    subtitle: 'Dermatology',
    gradient: { from: '#FBBF24', to: '#F59E0B' },
    icon: '\uD83E\uDDB4',
    clinical_question: 'Is this skin lesion potentially malignant?',
    key_variables: ['asymmetry', 'border_irregularity', 'color_variation', 'diameter', 'evolution', 'elevation', 'itching'],
    dataset_info: { rows: 900, features: 11, classes: 2, positive_rate: '33%' },
  },
  {
    id: 'ophthalmology',
    name: 'Diabetic Retinopathy',
    subtitle: 'Ophthalmology',
    gradient: { from: '#2DD4BF', to: '#14B8A6' },
    icon: '\uD83D\uDC41\uFE0F',
    clinical_question: 'Does this patient show signs of diabetic retinopathy?',
    key_variables: ['MA_count', 'exudate_area', 'hemorrhage_count', 'neovascularization', 'optic_disc_diameter', 'vessel_tortuosity'],
    dataset_info: { rows: 1151, features: 19, classes: 2, positive_rate: '53%' },
  },
  {
    id: 'orthopaedics',
    name: 'Spinal Condition',
    subtitle: 'Orthopaedics',
    gradient: { from: '#A3A3A3', to: '#737373' },
    icon: '\uD83E\uDDB4',
    clinical_question: 'Does this patient have a spinal abnormality?',
    key_variables: ['pelvic_incidence', 'pelvic_tilt', 'lumbar_lordosis_angle', 'sacral_slope', 'pelvic_radius', 'spondylolisthesis_grade'],
    dataset_info: { rows: 310, features: 6, classes: 3, positive_rate: '48%' },
  },
  {
    id: 'icu-sepsis',
    name: 'Sepsis Prediction',
    subtitle: 'ICU/Critical Care',
    gradient: { from: '#F43F5E', to: '#E11D48' },
    icon: '\uD83C\uDFE5',
    clinical_question: 'Is this ICU patient at risk of developing sepsis?',
    key_variables: ['heart_rate', 'respiratory_rate', 'temperature', 'WBC_count', 'lactate', 'MAP', 'creatinine', 'bilirubin'],
    dataset_info: { rows: 4000, features: 15, classes: 2, positive_rate: '12%' },
  },
  {
    id: 'obstetrics',
    name: 'Fetal Health',
    subtitle: 'Obstetrics',
    gradient: { from: '#A78BFA', to: '#8B5CF6' },
    icon: '\uD83D\uDC76',
    clinical_question: 'What is the health classification of this fetus based on CTG data?',
    key_variables: ['baseline_FHR', 'accelerations', 'fetal_movement', 'uterine_contractions', 'light_decelerations', 'severe_decelerations'],
    dataset_info: { rows: 2126, features: 21, classes: 3, positive_rate: '78%' },
  },
  {
    id: 'cardiology-arrhythmia',
    name: 'Arrhythmia',
    subtitle: 'Cardiology',
    gradient: { from: '#FB7185', to: '#F43F5E' },
    icon: '\uD83D\uDC93',
    clinical_question: 'Does this patient have a cardiac arrhythmia?',
    key_variables: ['age', 'heart_rate', 'QRS_duration', 'PR_interval', 'QT_interval', 'T_wave_amplitude', 'P_wave_amplitude'],
    dataset_info: { rows: 452, features: 16, classes: 2, positive_rate: '54%' },
  },
  {
    id: 'oncology-cervical',
    name: 'Cervical Cancer',
    subtitle: 'Oncology',
    gradient: { from: '#F472B6', to: '#EC4899' },
    icon: '\uD83C\uDF80',
    clinical_question: 'Is this patient at risk for cervical cancer?',
    key_variables: ['age', 'num_sexual_partners', 'first_sexual_intercourse', 'num_pregnancies', 'smoking_years', 'hormonal_contraceptives_years', 'IUD_years', 'STDs_count'],
    dataset_info: { rows: 858, features: 15, classes: 2, positive_rate: '8%' },
  },
  {
    id: 'thyroid',
    name: 'Thyroid Disease',
    subtitle: 'Endocrinology',
    gradient: { from: '#4ADE80', to: '#22C55E' },
    icon: '\uD83E\uDDEC',
    clinical_question: 'Does this patient have a thyroid disorder?',
    key_variables: ['TSH', 'T3', 'T4', 'T4U', 'FTI', 'age', 'sex', 'on_thyroxine', 'goitre'],
    dataset_info: { rows: 3772, features: 21, classes: 2, positive_rate: '16%' },
  },
  {
    id: 'pharmacy',
    name: 'Readmission Risk',
    subtitle: 'Pharmacy',
    gradient: { from: '#38BDF8', to: '#0EA5E9' },
    icon: '\uD83D\uDC8A',
    clinical_question: 'Is this patient at risk for hospital readmission within 30 days?',
    key_variables: ['num_medications', 'num_procedures', 'num_lab_procedures', 'number_diagnoses', 'time_in_hospital', 'number_emergency', 'number_inpatient'],
    dataset_info: { rows: 10000, features: 18, classes: 2, positive_rate: '11%' },
  },
];

export default DOMAINS;

/**
 * Lookup a domain by id.
 */
export function getDomainById(id) {
  return DOMAINS.find((d) => d.id === id) || null;
}

/**
 * Get gradient CSS style for a domain.
 */
export function getDomainGradient(domain) {
  if (!domain?.gradient) return {};
  return {
    background: `linear-gradient(135deg, ${domain.gradient.from}, ${domain.gradient.to})`,
  };
}
