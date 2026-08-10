import os
import sys
import json
import numpy as np
import pandas as pd
import joblib
import sqlite3

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import get_db_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'model')
ALT_MODEL_DIR = os.path.join(BASE_DIR, 'ml', 'model')
PROCESSED_CSV = os.path.join(BASE_DIR, 'data', 'processed', 'vulnerabilities_processed.csv')

def train_and_evaluate():
    """
    Loads dataset from SQLite DB (or processed CSV), trains RandomForestClassifier,
    calculates metrics, and saves model & preprocessor artifacts.
    """
    print("=" * 60)
    print("      SCIKIT-LEARN RANDOM FOREST MODEL TRAINING")
    print("=" * 60)

    try:
        conn = get_db_connection()
        df = pd.read_sql_query("SELECT * FROM vulnerabilities", conn)
        conn.close()
        print(f"Loaded {len(df):,} records from SQLite database.")
    except Exception as e:
        print(f"Database query failed: {e}. Falling back to CSV...")
        df = pd.read_csv(PROCESSED_CSV)

    # Feature engineering for ML
    df['cwe_code'] = df['cwe_code'].fillna('NVD-CWE-Other').astype(str).str.strip()
    top_cwes = df['cwe_code'].value_counts().head(20).index.tolist()
    df['cwe_bucket'] = df['cwe_code'].apply(lambda x: x if x in top_cwes else 'Other')
    df['has_cwe'] = df['cwe_bucket'].apply(lambda x: 0 if x in ['Other', 'NVD-CWE-Other', ''] else 1)

    num_features = ['cvss', 'cve_age_days', 'vendor_count', 'product_count', 'summary_length', 'has_cwe']
    cat_features = [
        'severity', 'access_authentication', 'access_complexity', 'access_vector',
        'impact_availability', 'impact_confidentiality', 'impact_integrity', 'cwe_bucket'
    ]

    target_col = 'ml_priority'
    if target_col not in df.columns or df[target_col].isnull().all():
        target_col = 'patch_priority'

    class_names = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

    X = df[num_features + cat_features]
    y = df[target_col]

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Train set: {len(X_train):,} samples | Test set: {len(X_test):,} samples")

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_features)
        ]
    )

    print("Fitting feature preprocessor...")
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    print("Training RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced')...")
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1
    )
    clf.fit(X_train_trans, y_train)

    print("Evaluating model performance...")
    y_pred = clf.predict(X_test_trans)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=class_names).tolist()

    onehot_cat_cols = preprocessor.named_transformers_['cat'].get_feature_names_out(cat_features).tolist()
    all_feature_names = num_features + onehot_cat_cols
    importances = clf.feature_importances_

    feature_imp_list = sorted(
        [{"feature": f, "importance": round(float(imp), 4)} for f, imp in zip(all_feature_names, importances)],
        key=lambda x: x['importance'],
        reverse=True
    )

    per_class_metrics = {}
    for cls in class_names:
        if cls in report:
            per_class_metrics[cls] = {
                'precision': round(report[cls]['precision'], 4),
                'recall': round(report[cls]['recall'], 4),
                'f1-score': round(report[cls]['f1-score'], 4),
                'support': int(report[cls]['support'])
            }

    metrics_payload = {
        'overall_accuracy': round(float(acc), 4),
        'total_samples': len(df),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'tree_count': 200,
        'algorithm': 'Random Forest Classifier',
        'per_class_metrics': per_class_metrics,
        'confusion_matrix': cm,
        'class_labels': class_names,
        'feature_importances': feature_imp_list[:15],
        'disclaimer': "The current MVP model learns the derived prioritization policy. It is not a predictor of future cyberattacks or a substitute for real-world threat intelligence."
    }

    # Save to model directory
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(ALT_MODEL_DIR, exist_ok=True)

    joblib.dump(clf, os.path.join(MODEL_DIR, 'patch_priority_model.pkl'))
    joblib.dump(preprocessor, os.path.join(MODEL_DIR, 'preprocessing_pipeline.pkl'))
    joblib.dump(clf, os.path.join(ALT_MODEL_DIR, 'patch_priority_model.pkl'))
    joblib.dump(preprocessor, os.path.join(ALT_MODEL_DIR, 'preprocessor.pkl'))

    with open(os.path.join(MODEL_DIR, 'evaluation_metrics.json'), 'w') as f:
        json.dump(metrics_payload, f, indent=2)

    print("\nTraining complete! Metrics summary:")
    print(f"Accuracy: {acc * 100:.2f}%")
    print(f"Model artifacts saved to {MODEL_DIR} and {ALT_MODEL_DIR}")
    return metrics_payload

if __name__ == '__main__':
    train_and_evaluate()
