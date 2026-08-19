# Secure 3-Tier Cloud-Native Application on GKE Autopilot

A production-grade, secure 3-tier web application (Frontend, Backend, and Load-Balanced Infrastructure) deployed on **Google Kubernetes Engine (GKE) Autopilot** using an automated **GitHub Actions CI/CD** pipeline with **Keyless Workload Identity Federation**.

---

## 🏗️ Architecture Overview

```text
[ Developer ] 
      │ (git push)
      ▼
[ GitHub Actions ] ──(OIDC / Keyless Auth)──► [ GCP Workload Identity Federation ]
      │
      ├─► Builds Docker Images
      └─► Pushes to [ Google Artifact Registry ]
                                │
                                ▼
                       [ GKE Autopilot Cluster ]
                        ├── Frontend (Nginx Reverse Proxy & Static UI)
                        └── Backend API (Internal ClusterIP Service)

Version Control & CI/CD: Developers push code to GitHub. A manually triggered workflow (workflow_dispatch) compiles and builds container images.

Keyless Authentication: GitHub Actions authenticates to Google Cloud via OpenID Connect (OIDC) and Workload Identity Federation—eliminating the need to store long-lived service account keys in GitHub secrets.

Artifact Registry: Securely stores version-controlled container images tagged with unique Git commit SHAs.

GKE Autopilot: Provisions and manages compute resources dynamically, billing strictly by pod resource requests rather than idle virtual machines.

Networking: The frontend container uses an Nginx reverse proxy to route public traffic safely to the private internal backend service using Kubernetes internal DNS (backend-service:8080).

🛠️ Tech Stack
Orchestration: Google Kubernetes Engine (GKE) Autopilot

CI/CD Automation: GitHub Actions (OIDC Integration)

Container Registry: Google Artifact Registry

Security: GCP Workload Identity Federation, IAM Least Privilege, Nginx Reverse Proxy

Containerization: Docker, Node.js / HTML5, Nginx

📂 Repository Structure
Plaintext
gke-3-tier-app/
├── .github/
│   └── workflows/
│       └── build-workflow.yml    # CI/CD pipeline instructions
├── frontend/                     # Web UI and Nginx reverse proxy config
│   ├── index.html                
│   ├── default.conf              
│   └── Dockerfile                
├── backend/                      # API service
│   ├── server.js                 
│   ├── package.json              
│   └── Dockerfile                
├── k8s/                          # Kubernetes declarative manifests
│   ├── frontend.yaml             
│   └── backend.yaml              
├── .gitignore                    
└── README.md                     
🚀 Deployment Guide (For Engineers)
To deploy this architecture in your own Google Cloud environment, follow these steps:

1. Prerequisites
A Google Cloud Platform (GCP) account with an active project.

The gcloud CLI installed and authenticated.

A GitHub repository.

2. Configure GCP Infrastructure & Workload Identity Federation
Enable required services and set up the trust relationship between GitHub and GCP:

Bash
# Enable APIs
gcloud services enable container.googleapis.com artifactregistry.googleapis.com iamcredentials.googleapis.com

# Create Artifact Registry
gcloud artifacts repositories create three-tier-repo --repository-format=docker --location=us-east1

# Create Workload Identity Pool & Provider (OIDC)
gcloud iam workload-identity-pools create github-pool --location="global" --display-name="GitHub Pool"
gcloud iam workload-identity-pools providers create-oidc github-provider \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --display-name="GitHub Provider" \
    --issuer-uri="[https://token.actions.githubusercontent.com](https://token.actions.githubusercontent.com)" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --attribute-condition="attribute.repository == 'YOUR_GITHUB_USERNAME/gke-3-tier-app'"
3. Configure GitHub Actions Secrets
In your GitHub repository settings (Settings -> Secrets and variables -> Actions), configure your environment variables or update them directly inside .github/workflows/build-workflow.yml.

4. Provision GKE Autopilot Cluster
Bash
gcloud container clusters create-auto three-tier-cluster --region us-east1
gcloud container clusters get-credentials three-tier-cluster --region us-east1
5. Deploy Manifests to Kubernetes
Update your image URIs in k8s/frontend.yaml and k8s/backend.yaml, then apply them:

Bash
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
🧹 Cleanup & Cost Management
To avoid ongoing cloud costs when testing is complete, tear down the compute and storage resources:

Bash
# Delete the GKE Cluster
gcloud container clusters delete three-tier-cluster --region us-east1 --quiet

# Delete Artifact Registry
gcloud artifacts repositories delete three-tier-repo --location us-east1 --quiet
