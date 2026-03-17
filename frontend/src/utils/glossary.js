/**
 * Glossary of ML and clinical terms used in MedVix.
 * Each entry: { term, definition, tag }
 * tag: 'ml' | 'clinical' | 'both'
 */
const GLOSSARY = [
  {
    term: 'Accuracy',
    definition: 'The percentage of all predictions (both positive and negative) that the model got correct. Can be misleading with imbalanced datasets.',
    tag: 'ml',
  },
  {
    term: 'AUC-ROC',
    definition: 'Area Under the Receiver Operating Characteristic Curve. Measures the model\'s ability to distinguish between classes. A value of 1.0 is perfect; 0.5 is random guessing.',
    tag: 'ml',
  },
  {
    term: 'Binary Classification',
    definition: 'A prediction task with exactly two possible outcomes (e.g., disease present or absent).',
    tag: 'ml',
  },
  {
    term: 'Class Imbalance',
    definition: 'When one class in the target variable has significantly more samples than another. Common in healthcare where disease cases are rarer than healthy ones.',
    tag: 'ml',
  },
  {
    term: 'Confusion Matrix',
    definition: 'A table showing True Positives, True Negatives, False Positives, and False Negatives. Helps visualise where the model makes mistakes.',
    tag: 'ml',
  },
  {
    term: 'Cross-Validation',
    definition: 'A technique that splits data into multiple folds to evaluate model performance more robustly than a single train/test split.',
    tag: 'ml',
  },
  {
    term: 'Decision Tree',
    definition: 'A model that makes predictions by learning a series of if/then rules from the data, creating a tree-like structure of decisions.',
    tag: 'ml',
  },
  {
    term: 'F1 Score',
    definition: 'The harmonic mean of precision and recall. Useful when you want a single metric that balances both false positives and false negatives.',
    tag: 'ml',
  },
  {
    term: 'False Positive',
    definition: 'When the model predicts a patient has a condition, but they actually do not. Also known as a Type I error.',
    tag: 'both',
  },
  {
    term: 'False Negative',
    definition: 'When the model predicts a patient does NOT have a condition, but they actually do. Particularly dangerous in healthcare screening.',
    tag: 'both',
  },
  {
    term: 'Feature',
    definition: 'A measurable property or characteristic used as input to the model (e.g., blood pressure, age, cholesterol level).',
    tag: 'ml',
  },
  {
    term: 'Hyperparameter',
    definition: 'A configuration setting for the model that is set before training begins (e.g., number of trees in Random Forest, learning rate).',
    tag: 'ml',
  },
  {
    term: 'K-Nearest Neighbours (KNN)',
    definition: 'A model that classifies a patient by looking at the K most similar patients in the training data and using majority vote.',
    tag: 'ml',
  },
  {
    term: 'Logistic Regression',
    definition: 'A linear model that predicts the probability of a binary outcome. Despite its name, it is used for classification, not regression.',
    tag: 'ml',
  },
  {
    term: 'Min-Max Normalisation',
    definition: 'Scales all feature values to a range of 0 to 1. Formula: (x - min) / (max - min). Useful when features have different scales.',
    tag: 'ml',
  },
  {
    term: 'Naive Bayes',
    definition: 'A probabilistic classifier based on Bayes\' theorem. Assumes features are independent of each other, which is "naive" but often works well.',
    tag: 'ml',
  },
  {
    term: 'Normalisation',
    definition: 'The process of scaling numeric features to a standard range so that no single feature dominates the model due to its scale.',
    tag: 'ml',
  },
  {
    term: 'Overfitting',
    definition: 'When a model learns the training data too well, including noise and outliers, and performs poorly on new unseen data.',
    tag: 'ml',
  },
  {
    term: 'Precision',
    definition: 'Of all patients the model predicted as positive, the percentage that actually are positive. High precision means few false alarms.',
    tag: 'ml',
  },
  {
    term: 'Random Forest',
    definition: 'An ensemble model that builds many decision trees and combines their predictions. Generally more accurate and robust than a single tree.',
    tag: 'ml',
  },
  {
    term: 'Recall (Sensitivity)',
    definition: 'Of all actual positive patients, the percentage the model correctly identified. Critical in healthcare where missing a case is costly.',
    tag: 'both',
  },
  {
    term: 'SHAP',
    definition: 'SHapley Additive exPlanations. A method to explain individual predictions by showing how each feature contributes to the final output.',
    tag: 'ml',
  },
  {
    term: 'SMOTE',
    definition: 'Synthetic Minority Over-sampling Technique. Creates synthetic samples for the minority class to address class imbalance.',
    tag: 'ml',
  },
  {
    term: 'Specificity',
    definition: 'Of all actual negative patients, the percentage the model correctly identified as negative. High specificity means few false positives.',
    tag: 'both',
  },
  {
    term: 'Support Vector Machine (SVM)',
    definition: 'A model that finds the optimal hyperplane to separate classes in feature space. Effective for high-dimensional data.',
    tag: 'ml',
  },
  {
    term: 'Target Variable',
    definition: 'The outcome column the model tries to predict (e.g., "has heart disease" = 1 or 0).',
    tag: 'ml',
  },
  {
    term: 'Test Set',
    definition: 'A portion of the data held back from training, used to evaluate how well the model generalises to new, unseen data.',
    tag: 'ml',
  },
  {
    term: 'Train/Test Split',
    definition: 'Dividing the dataset into a training portion (used to build the model) and a test portion (used to evaluate it).',
    tag: 'ml',
  },
  {
    term: 'Z-Score Normalisation',
    definition: 'Scales features so that the mean becomes 0 and standard deviation becomes 1. Formula: (x - mean) / std. Also called standardisation.',
    tag: 'ml',
  },
  {
    term: 'EU AI Act',
    definition: 'European Union regulation for artificial intelligence systems. Healthcare AI is classified as high-risk, requiring transparency and human oversight.',
    tag: 'clinical',
  },
  {
    term: 'Clinical Decision Support',
    definition: 'AI systems that assist clinicians in making medical decisions. These tools should support, not replace, clinical judgement.',
    tag: 'clinical',
  },
  {
    term: 'Informed Consent',
    definition: 'The principle that patients should be told when AI is used in their diagnosis or treatment, and understand its limitations.',
    tag: 'clinical',
  },
];

export default GLOSSARY;
