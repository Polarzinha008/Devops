terraform {
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.7"
    }
  }
}

provider "kind" {}

resource "kind_cluster" "devops" {
  name = var.cluster_name

  node_image = "kindest/node:v1.34.0"

  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    # 1 Controller
    node {
      role = "control-plane"
    }

    # Worker 1
    node {
      role = "worker"
    }

    # Worker 2
    node {
      role = "worker"
    }
  }
}
