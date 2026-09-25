# APSM ML inference service

The Express backend is the only public gateway. This local Python service loads
the scikit-learn artifact once and listens only on `127.0.0.1`.

```powershell
pip install -r backend/ml_engine/requirements.txt
$env:APSM_MODEL_PATH = "<absolute path to synthetic_bootstrap_reach_random_forest.pkl>"
python backend/ml_engine/inference_service.py
```

By default it reads the existing artifact in `ml_engine/ml_models/`, avoiding a
second large binary. For deployment, provide a versioned artifact via
`APSM_MODEL_PATH`; do not commit `.pkl` model binaries to Git.
